export enum AgentBlockType {
  INITIAL = 'initial_response',
  THINKING = 'thinking',
  ACTION = 'action',
  FINAL = 'final_response',
  QUESTION = 'question',
}

export interface AgentBlockState {
  type: AgentBlockType;
  content: string;
  isOpen: boolean; 
  toolName?: string;
  toolArgs?: any;
  toolResult?: string;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string; // Raw text fallback
  blocks: AgentBlockState[]; // UI blocks
  timestamp: number;
  isStreaming: boolean;
  attachment?: { name: string; type: string; data: string };
}