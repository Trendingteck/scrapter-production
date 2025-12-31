import { z } from 'zod';

// Actors available in the system
export enum Actors {
  SYSTEM = 'system',
  USER = 'user',
  AGENT = 'agent',
}

// A single message in the chat history
export interface Message {
  id: string; // UUID
  sessionId: string;
  actor: Actors | string;
  content: string; // The raw content (including [THINKING] tags etc)
  timestamp: number;

  // Optional metadata for rich display
  metadata?: {
    tokens?: number;
    screenshot?: string; // Base64 thumbnail (optional)
    domStateHash?: string;
    actionType?: string; // e.g. "click", "search"
    url?: string; // Page URL when message occurred
  };
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];

  // Task status
  status: 'active' | 'completed' | 'failed' | 'cancelled';

  // Stats
  stepCount: number;
  tokenUsage?: number;
}

// Zod schema for runtime validation if needed
export const MessageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  actor: z.string(),
  content: z.string(),
  timestamp: z.number(),
  metadata: z.object({
    tokens: z.number().optional(),
    screenshot: z.string().optional(),
    domStateHash: z.string().optional(),
    url: z.string().optional(),
  }).optional(),
});