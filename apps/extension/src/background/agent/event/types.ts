export enum Actors {
  SYSTEM = 'system',
  USER = 'user',
  // Unified actor for the monolithic agent
  AGENT = 'agent',
}

export enum EventType {
  EXECUTION = 'execution',
  STREAM = 'stream',
}

export enum ExecutionState {
  // Task Lifecycle
  TASK_START = 'task.start',
  TASK_OK = 'task.ok',
  TASK_FAIL = 'task.fail',
  TASK_PAUSE = 'task.pause',
  TASK_RESUME = 'task.resume',
  TASK_CANCEL = 'task.cancel',

  // Step Lifecycle
  STEP_START = 'step.start',
  STEP_OK = 'step.ok',
  STEP_FAIL = 'step.fail',

  // Action Lifecycle
  ACT_START = 'act.start',
  ACT_OK = 'act.ok',
  ACT_FAIL = 'act.fail',
}

export interface EventData {
  taskId: string;
  step: number;
  maxSteps: number;
  details: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any; // For streaming tokens/blocks
}

export class AgentEvent {
  constructor(
    public actor: Actors,
    public state: ExecutionState,
    public data: EventData,
    public timestamp: number = Date.now(),
    public type: EventType = EventType.EXECUTION,
  ) { }
}

export type EventCallback = (event: AgentEvent) => Promise<void>;