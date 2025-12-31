import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AgentContext, AgentOptions, ActionResult } from './types';
import { t } from '@extension/i18n';
import { createLogger } from '@src/background/log';
import MessageManager from './messages/service';
import type BrowserContext from '../browser/context';
import { EventManager } from './event/manager';
import { Actors, type EventCallback, EventType, ExecutionState } from './event/types';
import { chatHistoryStore } from '@extension/storage/lib/chat';
import type { GeneralSettingsConfig } from '@extension/storage';
import { analytics } from '../services/analytics';
import { Agent, ActionRegistry } from './core/agent';
import { ActionRegistryImpl } from './actions/builder';
import {
  RequestCancelledError,
  MaxStepsReachedError,
  MaxFailuresReachedError
} from './errors';

const logger = createLogger('Executor');

export interface ExecutorExtraArgs {
  agentOptions?: Partial<AgentOptions>;
  generalSettings?: GeneralSettingsConfig;
}

/**
 * The Executor orchestrates the lifecycle of a Task.
 * It manages dependencies, the run loop, error handling, and cleanup.
 */
export class Executor {
  private readonly agent: Agent;
  private readonly context: AgentContext;
  private readonly generalSettings: GeneralSettingsConfig | undefined;

  // Track the primary task and potential sub-tasks
  private rootTask: string;

  constructor(
    task: string,
    taskId: string,
    browserContext: BrowserContext,
    chatLLM: BaseChatModel,
    extraArgs?: Partial<ExecutorExtraArgs>,
  ) {
    this.rootTask = task;
    this.generalSettings = extraArgs?.generalSettings;

    // 1. Initialize Infrastructure Services
    const messageManager = new MessageManager();
    const eventManager = new EventManager();

    // 2. Create Shared Context
    this.context = new AgentContext(
      taskId,
      browserContext,
      messageManager,
      eventManager,
      extraArgs?.agentOptions ?? {},
    );

    // 3. Initialize Registry and Agent
    // The Registry needs the context to perform actions on the browser
    const actionRegistry: ActionRegistry = new ActionRegistryImpl(this.context);

    this.agent = new Agent(
      chatLLM,
      this.context,
      actionRegistry
    );

    // 4. Prime the memory with the initial task
    // (Note: The core Agent adds the System Prompt dynamically per step)
    this.context.messageManager.initTaskMessages(
      // We pass a dummy system message here because MessageManager expects it, 
      // but the Agent overrides it in buildContextWindow()
      { content: "Placeholder", _getType: () => "system" } as any,
      task
    );
  }

  // --- Public Interface ---

  subscribeExecutionEvents(callback: EventCallback): void {
    this.context.eventManager.subscribe(EventType.EXECUTION, callback);
    this.context.eventManager.subscribe(EventType.STREAM, callback);
  }

  clearExecutionEvents(): void {
    this.context.eventManager.clearSubscribers(EventType.EXECUTION);
    this.context.eventManager.clearSubscribers(EventType.STREAM);
  }

  /**
   * Adds a user message to the context during execution.
   * Useful for "human-in-the-loop" scenarios (answering the agent's questions).
   */
  addFollowUpTask(task: string): void {
    logger.info(`Adding follow-up task: ${task}`);
    this.context.messageManager.addNewTask(task);

    // Resume if paused/waiting for input
    if (this.context.paused) {
      this.resume();
    }
  }

  async execute(): Promise<void> {
    logger.info(`🚀 Starting Executor for task: ${this.rootTask}`);
    const context = this.context;
    const maxSteps = context.options.maxSteps;

    try {
      await context.emitEvent(Actors.SYSTEM, ExecutionState.TASK_START, context.taskId);
      void analytics.trackTaskStart(context.taskId);

      // 0. Classify Intent (Added as per workflow requirement)
      // Only do this for the initial request, not if continuing or if it's a follow-up
      if (context.nSteps === 0) {
        logger.info("Classifying intent...");
        const intent = await this.agent.classifyIntent(this.rootTask);
        logger.info(`Intent Classified: ${intent}`);

        if (intent === 'CHAT') {
          // Execute Chat workflow
          const response = await this.agent.runChat(this.rootTask);
          context.finalAnswer = response;

          // Mark as complete and skip loop
          await context.emitEvent(Actors.SYSTEM, ExecutionState.TASK_OK, response);
          void analytics.trackTaskComplete(context.taskId);
          return;
        }
      }

      let taskComplete = false;

      // --- Main Execution Loop ---
      while (context.nSteps < maxSteps) {
        context.stepInfo = {
          stepNumber: context.nSteps + 1,
          maxSteps: maxSteps,
        };

        // 1. Check Stop Signals
        if (await this.shouldStop()) {
          break;
        }

        logger.info(`🔄 Step ${context.nSteps + 1} / ${maxSteps}`);

        // 2. Run Agent Step
        const output = await this.agent.executeStep();
        context.nSteps++;

        // 3. Handle Result
        if (output.error) {
          context.consecutiveFailures++;
          logger.warning(`Step ended with error: ${output.error}`);
        } else {
          context.consecutiveFailures = 0; // Reset failure count on success

          if (output.result) {
            // Check if agent requested completion
            if (output.result.done) {
              if (output.result.question) {
                // Agent paused to ask user a question
                logger.info("Agent asked a question, waiting for user input.");
                await context.emitEvent(Actors.SYSTEM, ExecutionState.TASK_PAUSE, "Waiting for user input...");
                await this.pause();
                // We DON'T break here. The loop will hit shouldStop() next iteration and wait there.
              } else {
                // Success
                taskComplete = true;
                break;
              }
            }
          }
        }
      }

      // --- Finalization ---
      if (taskComplete) {
        logger.info('✅ Task Completed Successfully');
        const finalMsg = context.finalAnswer || "Task completed.";
        await context.emitEvent(Actors.SYSTEM, ExecutionState.TASK_OK, finalMsg);
        void analytics.trackTaskComplete(context.taskId);
      } else if (context.nSteps >= maxSteps) {
        throw new MaxStepsReachedError(t('exec_errors_maxStepsReached'));
      }

    } catch (error) {
      this.handleExecutionError(error);
    } finally {
      await this.saveHistory();
    }
  }

  // --- Controls ---

  async cancel(): Promise<void> {
    logger.info("Cancelling task...");
    await this.context.stop();
    await this.context.emitEvent(Actors.SYSTEM, ExecutionState.TASK_CANCEL, t('exec_task_cancel'));
    void analytics.trackTaskCancelled(this.context.taskId);
  }

  async resume(): Promise<void> {
    logger.info("Resuming task...");
    await this.context.resume();
  }

  async pause(): Promise<void> {
    logger.info("Pausing task...");
    await this.context.pause();
  }

  async cleanup(): Promise<void> {
    logger.info("Cleaning up executor resources");
    try {
      await this.context.browserContext.cleanup();
    } catch (error) {
      logger.error('Failed to cleanup browser context:', error);
    }
  }

  async replayHistory(sessionId: string): Promise<ActionResult[]> {
    logger.warning('Replay not yet implemented for monolithic executor');
    return [];
  }

  // --- Internal Helpers ---

  private async shouldStop(): Promise<boolean> {
    if (this.context.stopped) return true;

    // Handle Pause
    while (this.context.paused) {
      // Check every 500ms if we are still paused
      await new Promise(resolve => setTimeout(resolve, 500));
      if (this.context.stopped) return true;
    }

    // Handle Failures
    if (this.context.consecutiveFailures >= this.context.options.maxFailures) {
      throw new MaxFailuresReachedError(t('exec_errors_maxFailuresReached'));
    }

    return false;
  }

  private handleExecutionError(error: unknown) {
    if (error instanceof RequestCancelledError) {
      // Already handled in cancel() usually, but safe double check
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    logger.error('Execution Error', message);

    // Categorize error for UI
    let eventState = ExecutionState.TASK_FAIL;

    // Emit
    this.context.emitEvent(Actors.SYSTEM, eventState, t('exec_task_fail', [message]));
    void analytics.trackTaskFailed(this.context.taskId, analytics.categorizeError(error as Error));
  }

  private async saveHistory() {
    if (this.generalSettings?.replayHistoricalTasks) {
      try {
        const historyData = JSON.stringify(this.context.history);
        await chatHistoryStore.storeAgentStepHistory(this.context.taskId, this.rootTask, historyData);
      } catch (e) {
        logger.error("Failed to save task history", e);
      }
    }
  }
}