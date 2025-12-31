export const ACTOR_PROFILES = {
  user: {
    name: 'User',
    icon: 'icons/user.svg',
    iconBackground: '#18181b', // zinc-900
  },
  system: {
    name: 'System',
    icon: 'icons/system.svg',
    iconBackground: '#EAB308', // gold-500
  },
  // The monolithic agent
  agent: {
    name: 'Scrapter',
    icon: 'icons/agent.svg',
    iconBackground: '#f97316', // orange-500
  },
  // Legacy mapping for compatibility with old history items
  navigator: {
    name: 'Scrapter',
    icon: 'icons/agent.svg',
    iconBackground: '#f97316', 
  },
} as const;

// New types for the enhanced UI

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface Attachment {
  name: string;
  type: string;
  data: string; // Base64 for images, text content for files
}

export interface EnhancedMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  attachment?: Attachment;
}

export type ParsedAgentResponse = {
  initial: string | null;
  logs: string[]; // Thinking, Action logs
  question: string | null; // Extracted Question content for main UI
  final: string | null;
  raw: string; // Keep raw for fallback
};

export enum ViewMode {
  CHAT = 'chat',
  IMAGES = 'images',
  HISTORY = 'history'
}