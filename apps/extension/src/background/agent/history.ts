import type { ActionResult } from './types';
import type { ScrapterDOMState } from '../browser/dom/views';

/**
 * Represents a snapshot of the browser at a specific step.
 * We store the URL, Title, and optionally the summary.
 * We do NOT store the full Element Map or Screenshot to save memory/storage.
 */
export interface BrowserHistorySnapshot {
  url: string;
  title: string;
  summary?: string; // Optional: Keep text representation for debugging
  timestamp: number;
}

/**
 * Represents a single step in the agent's execution history.
 */
export class AgentStepRecord {
  /** The raw text output from the LLM (Reasoning + Action JSON) */
  modelOutput: string | null;
  
  /** The structured result of the action(s) executed */
  result: ActionResult[];
  
  /** The state of the browser *before* the action was taken */
  stateSnapshot: BrowserHistorySnapshot;
  
  /** Timestamp of the step */
  timestamp: number;

  constructor(
    modelOutput: string | null,
    result: ActionResult[],
    // Accepts the full state but stores a snapshot
    fullState: ScrapterDOMState,
  ) {
    this.modelOutput = modelOutput;
    this.result = result;
    this.timestamp = Date.now();
    
    // Create lightweight snapshot
    this.stateSnapshot = {
      url: fullState.url,
      title: fullState.title,
      summary: fullState.summary.slice(0, 5000), // Cap summary length for storage
      timestamp: Date.now()
    };
  }
}

/**
 * A linear history of the agent's execution.
 */
export class AgentStepHistory {
  history: AgentStepRecord[];

  constructor(history?: AgentStepRecord[]) {
    this.history = history ?? [];
  }

  addStep(record: AgentStepRecord) {
    this.history.push(record);
  }

  get lastStep(): AgentStepRecord | undefined {
    return this.history[this.history.length - 1];
  }

  isEmpty(): boolean {
    return this.history.length === 0;
  }
  
  clear() {
    this.history = [];
  }

  toJSON() {
    return this.history;
  }
}