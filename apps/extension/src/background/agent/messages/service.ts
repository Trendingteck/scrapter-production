import { type BaseMessage, AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { MessageHistory, MessageMetadata } from './views';
import { createLogger } from '@src/background/log';
import {
  filterExternalContent,
  wrapUserRequest,
  splitUserTextAndAttachments,
  wrapAttachments,
} from './utils';

const logger = createLogger('MessageManager');

export class MessageManagerSettings {
  maxInputTokens = 128000;
  estimatedCharactersPerToken = 3; // Rough estimate for fast calculation
  imageTokens = 800; // Cost of vision input
  includeAttributes: string[] = [];
  sensitiveData?: Record<string, string>; // PII redaction map
  availableFilePaths?: string[];

  constructor(options: Partial<MessageManagerSettings> = {}) {
    Object.assign(this, options);
  }
}

/**
 * Manages the linear conversation history for the Monolithic Agent.
 * Handles token estimation, PII redaction, and message formatting.
 */
export default class MessageManager {
  private history: MessageHistory;
  private settings: MessageManagerSettings;

  constructor(settings: MessageManagerSettings = new MessageManagerSettings()) {
    this.settings = settings;
    this.history = new MessageHistory();
  }

  /**
   * Initialize a new task with the base system prompt and user objective.
   */
  public initTaskMessages(systemMessage: SystemMessage, task: string): void {
    // 1. System Prompt (The Agent's Persona & Tools)
    this.addMessageWithTokens(systemMessage, 'system');

    // 2. Task Instructions (User's Goal)
    const taskMessage = MessageManager.formatUserTask(task);
    this.addMessageWithTokens(taskMessage, 'user_task');

    // 3. PII & Context Injection
    if (this.settings.sensitiveData) {
      const keys = Object.keys(this.settings.sensitiveData).join(', ');
      const infoMsg = new HumanMessage({
        content: `Available Secrets: [${keys}]. \nUse format <secret>key_name</secret> to input them securely.`,
      });
      this.addMessageWithTokens(infoMsg, 'context');
    }
  }

  /**
   * Formats the user task, handling attachments and sanitization.
   */
  private static formatUserTask(task: string): HumanMessage {
    const { userText, attachmentsInner } = splitUserTextAndAttachments(task);

    // Sanitize user text to prevent prompt injection
    const cleanedTask = filterExternalContent(userText);

    let content = `OBJECTIVE: """${cleanedTask}"""`;
    content = wrapUserRequest(content, false);

    // Append attachments if present
    if (attachmentsInner && attachmentsInner.length > 0) {
      const wrappedFiles = wrapAttachments(attachmentsInner);
      content = `${content}\n\n${wrappedFiles}`;
    }

    return new HumanMessage({ content });
  }

  /**
   * Adds a new goal to the existing context (for follow-up questions).
   */
  public addNewTask(newTask: string): void {
    const msg = MessageManager.formatUserTask(newTask);

    // Prefix to indicate continuity
    if (typeof msg.content === 'string') {
      msg.content = `NEW FOLLOW-UP REQUEST: ${msg.content}`;
    }

    this.addMessageWithTokens(msg, 'user_followup');
  }

  /**
   * Adds the Browser State (DOM + Screenshot) to the history.
   * This is usually ephemeral and removed after the agent acts to save tokens.
   */
  public addStateMessage(stateMessage: HumanMessage): void {
    this.addMessageWithTokens(stateMessage, 'browser_state');
  }

  /**
   * Adds the Agent's reasoning and action (The Model's Output).
   */
  public addAssistantMessage(content: string): void {
    this.addMessageWithTokens(new AIMessage({ content }), 'agent_response');
  }

  /**
   * Removes the last Browser State message.
   * Crucial for the monolithic loop to prevent context bloating with stale DOM trees.
   */
  public removeLastStateMessage(): void {
    // We look from the end. If the last user message was a browser state, remove it.
    const messages = this.history.messages;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].metadata.message_type === 'browser_state') {
        this.history.removeMessage(i);
        return;
      }
    }
  }

  /**
   * Returns the array of messages formatted for LangChain.
   */
  public getMessages(): BaseMessage[] {
    this.cutMessages(); // Prune if over limit
    return this.history.getMessages();
  }

  /**
   * Internal: Adds message to history and calculates tokens.
   */
  public addMessageWithTokens(message: BaseMessage, messageType: string = 'unknown'): void {
    // Redact PII before storing
    const filteredMessage = this.settings.sensitiveData
      ? this._redactPII(message)
      : message;

    const tokenCount = this._estimateTokens(filteredMessage);
    const metadata = new MessageMetadata(tokenCount, messageType);
    this.history.addMessage(filteredMessage, metadata);
  }

  /**
   * Redacts sensitive data based on settings.
   */
  private _redactPII(message: BaseMessage): BaseMessage {
    if (!this.settings.sensitiveData) return message;

    const replaceMap = this.settings.sensitiveData;
    const redact = (text: string) => {
      let res = text;
      for (const [key, val] of Object.entries(replaceMap)) {
        if (val && val.length > 0) {
          // Simple replace, can be improved with regex
          res = res.split(val).join(`<secret>${key}</secret>`);
        }
      }
      return res;
    };

    const copy = { ...message };
    if (typeof copy.content === 'string') {
      copy.content = redact(copy.content);
    }
    // Note: We don't redact inside image content arrays currently
    return copy as BaseMessage;
  }

  /**
   * Simple character-based token estimation.
   */
  private _estimateTokens(message: BaseMessage): number {
    let textContent = '';
    let imageCount = 0;

    if (typeof message.content === 'string') {
      textContent = message.content;
    } else if (Array.isArray(message.content)) {
      for (const item of message.content) {
        if (typeof item === 'string') textContent += item;
        else if ((item as any).type === 'text') textContent += (item as any).text;
        else if ((item as any).type === 'image_url') imageCount++;
      }
    }

    const textTokens = Math.ceil(textContent.length / this.settings.estimatedCharactersPerToken);
    const visionTokens = imageCount * this.settings.imageTokens;

    return textTokens + visionTokens;
  }

  /**
   * Sliding window context management.
   * Removes oldest messages (except System Prompt) if over token limit.
   */
  private cutMessages(): void {
    // Safety break loop
    let attempts = 0;
    while (this.history.totalTokens > this.settings.maxInputTokens && attempts < 50) {
      this.history.removeOldestNonSystemMessage();
      attempts++;
    }

    if (attempts > 0) {
      logger.warning(`Context window pruned: removed ${attempts} old messages.`);
    }
  }
}