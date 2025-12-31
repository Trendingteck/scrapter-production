import { z } from 'zod';
import type BrowserContext from '../browser/context';
import { DEFAULT_INCLUDE_ATTRIBUTES, ScrapterDOMState } from '../browser/dom/views';
import type MessageManager from './messages/service';
import type { EventManager } from './event/manager';
import { AgentStepHistory } from './history';

// Zod schema for runtime validation of options
export const AgentOptionsSchema = z.object({
  maxSteps: z.number().default(30),
  maxActionsPerStep: z.number().default(5),
  maxFailures: z.number().default(3),
  // Removed planningInterval as we are Monolithic
  retryDelay: z.number().default(1000), // ms
  maxInputTokens: z.number().default(128000),
  maxErrorLength: z.number().default(500),
  useVision: z.boolean().default(true),
  includeAttributes: z.array(z.string()).default(DEFAULT_INCLUDE_ATTRIBUTES),
});

export type AgentOptions = z.infer<typeof AgentOptionsSchema>;

export const DEFAULT_AGENT_OPTIONS: AgentOptions = AgentOptionsSchema.parse({});

export interface AgentStepInfo {
  stepNumber: number;
  maxSteps: number;
}

/**
 * Result of a single tool execution.
 * 
 * If successful, 'extractedContent' usually contains a confirmation string or data.
 * If 'includeInMemory' is true, this result is fed back into the LLM context loop.
 */
export class ActionResult {
  isDone: boolean;
  success: boolean;
  extractedContent: string | null;
  error: string | null;
  includeInMemory: boolean; 
  interactedElementId?: number;

  constructor(params: Partial<ActionResult> = {}) {
    this.isDone = params.isDone ?? false;
    this.success = params.success ?? (!params.error);
    this.extractedContent = params.extractedContent ?? null;
    this.error = params.error ?? null;
    this.includeInMemory = params.includeInMemory ?? false;
    this.interactedElementId = params.interactedElementId;
  }
}

/**
 * Shared context object passed between the Agent and its Tools.
 * Maintains the lifecycle state of a specific Task.
 */
export class AgentContext {
  controller: AbortController;
  taskId: string;
  browserContext: BrowserContext;
  messageManager: MessageManager;
  eventManager: EventManager;
  options: AgentOptions;
  
  // Execution Control Flags
  paused: boolean = false;
  stopped: boolean = false;
  
  // Execution State
  consecutiveFailures: number = 0;
  nSteps: number = 0;
  stepInfo: AgentStepInfo | null = null;
  
  // Ephemeral state for the current loop
  actionResults: ActionResult[] = [];
  stateMessageAdded: boolean = false; 
  
  // Long-term history
  history: AgentStepHistory;
  finalAnswer: string | null = null;

  constructor(
    taskId: string,
    browserContext: BrowserContext,
    messageManager: MessageManager,
    eventManager: EventManager,
    options: Partial<AgentOptions>,
  ) {
    this.controller = new AbortController();
    this.taskId = taskId;
    this.browserContext = browserContext;
    this.messageManager = messageManager;
    this.eventManager = eventManager;
    
    // Merge defaults safely
    this.options = { ...DEFAULT_AGENT_OPTIONS, ...options };
    this.history = new AgentStepHistory();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async emitEvent(actor: any, state: any, details: string) {
    // Dynamic import to avoid circular dependencies if any
    const { AgentEvent } = await import('./event/types');
    const event = new AgentEvent(actor, state, {
      taskId: this.taskId,
      step: this.nSteps,
      maxSteps: this.options.maxSteps,
      details: details,
    });
    await this.eventManager.emit(event);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async emitStreamEvent(payload: any) {
    const { AgentEvent, Actors, ExecutionState, EventType } = await import('./event/types');
    
    const event = new AgentEvent(
      Actors.SYSTEM, 
      ExecutionState.STEP_OK,
      {
        taskId: this.taskId,
        step: this.nSteps,
        maxSteps: this.options.maxSteps,
        details: 'stream',
        payload
      },
      Date.now(),
      EventType.STREAM
    );
    
    await this.eventManager.emit(event);
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; }
  
  stop() { 
    this.stopped = true; 
    this.controller.abort();
  }
}

export interface AgentOutput<T = unknown> {
  id: string;
  result?: T;
  error?: string;
}