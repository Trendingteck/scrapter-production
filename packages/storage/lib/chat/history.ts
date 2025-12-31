import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';
import { ChatSession, Message, Actors } from './types';

// The storage schema
interface ChatHistoryStorage {
  sessions: Record<string, ChatSession>;
  // Store raw agent steps separately to avoid bloating the main session list
  // Key: sessionId -> stringified JSON of AgentStepHistory
  agentStepHistory: Record<string, string>;
}

type ChatHistoryStorageType = BaseStorage<ChatHistoryStorage> & {
  addMessage: (sessionId: string, message: Message) => Promise<void>;
  createSession: (title: string) => Promise<string>;
  getSession: (sessionId: string) => Promise<ChatSession | null>;
  getSessionsMetadata: () => Promise<Omit<ChatSession, 'messages'>[]>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  storeAgentStepHistory: (sessionId: string, task: string, historyData: string) => Promise<void>;
  getAgentStepHistory: (sessionId: string) => Promise<string | null>;
};

const storage = createStorage<ChatHistoryStorage>(
  'chat-history-v2',
  { sessions: {}, agentStepHistory: {} },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const chatHistoryStore: ChatHistoryStorageType = Object.assign(storage, {
  createSession: async (title: string) => {
    const sessionId = Math.random().toString(36).substring(2, 15);
    const newSession: ChatSession = {
      id: sessionId,
      title: title.substring(0, 50) + (title.length > 50 ? '...' : ''),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      status: 'active',
      stepCount: 0
    };

    await storage.set((data) => ({
      ...data,
      sessions: { ...data.sessions, [sessionId]: newSession }
    }));

    return sessionId;
  },

  addMessage: async (sessionId: string, message: Message) => {
    await storage.set((data) => {
      const session = data.sessions[sessionId];
      if (!session) return data;

      const updatedSession = {
        ...session,
        updatedAt: Date.now(),
        messages: [...session.messages, message],
        stepCount: message.actor === Actors.AGENT ? session.stepCount + 1 : session.stepCount
      };

      return {
        ...data,
        sessions: { ...data.sessions, [sessionId]: updatedSession }
      };
    });
  },

  getSession: async (sessionId: string) => {
    const data = await storage.get();
    return data.sessions[sessionId] || null;
  },

  getSessionsMetadata: async () => {
    const data = await storage.get();
    return Object.values(data.sessions)
      .map(({ messages, ...meta }) => meta)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },

  deleteSession: async (sessionId: string) => {
    await storage.set((data) => {
      const { [sessionId]: _, ...restSessions } = data.sessions;
      const { [sessionId]: __, ...restHistory } = data.agentStepHistory;
      return { sessions: restSessions, agentStepHistory: restHistory };
    });
  },

  clearAll: async () => {
    await storage.set(() => ({ sessions: {}, agentStepHistory: {} }));
  },

  storeAgentStepHistory: async (sessionId: string, task: string, historyData: string) => {
    await storage.set((data) => ({
      ...data,
      agentStepHistory: { ...data.agentStepHistory, [sessionId]: historyData }
    }));

    // Also update the session title if it was a default "New Chat"
    const data = await storage.get();
    const session = data.sessions[sessionId];
    if (session && (session.title === 'New Chat' || session.title === 'Untitled Run')) {
      const newTitle = task.substring(0, 50) + (task.length > 50 ? '...' : '');
      await storage.set((d) => ({
        ...d,
        sessions: { ...d.sessions, [sessionId]: { ...session, title: newTitle } }
      }));
    }
  },

  getAgentStepHistory: async (sessionId: string) => {
    const data = await storage.get();
    return data.agentStepHistory[sessionId] || null;
  }
}) as ChatHistoryStorageType;