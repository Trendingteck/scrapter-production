import type { ActionResult } from '../types';

export interface StepResult {
    done: boolean;
    response?: string;
    question?: string;
    actionResults?: ActionResult[];
    error?: string;
}

export type ParsedStreamEventType =
    | 'initial_response'
    | 'thinking'
    | 'action'
    | 'question'
    | 'final_response'
    | 'token'
    | 'block_start'
    | 'block_end'
    | 'tool_call'
    | 'tool_result'
    | 'error';

export interface ParsedStreamEvent {
    type: ParsedStreamEventType;
    content: string;
    isComplete?: boolean;
    delta?: string; // The specific chunk of text added in this event
    block?: string; // For block_start/end events
    name?: string;  // For tool_call/result
    args?: any;     // For tool_call
}

export type StreamEventCallback = (event: ParsedStreamEvent) => Promise<void>;