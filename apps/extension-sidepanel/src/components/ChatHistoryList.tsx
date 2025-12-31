/* eslint-disable react/prop-types */
import React from 'react';
import { Trash2, MessageSquare } from 'lucide-react';
import { t } from '@extension/i18n';

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
}

interface ChatHistoryListProps {
  sessions: ChatSession[];
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  currentSessionId?: string | null;
}

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({
  sessions,
  onSelect,
  onDelete,
  currentSessionId,
}) => {
  const formatDate = (timestamp: number) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: 'short' });
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  if (sessions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-950 h-full">
        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
          <MessageSquare size={24} className="text-zinc-400" />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
          {t('chat_history_empty') || 'No chat history yet'}
        </p>
      </div>
    );
  }

  const groupedSessions = sessions.reduce((groups, session) => {
    const dateKey = formatDate(session.createdAt);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(session);
    return groups;
  }, {} as Record<string, ChatSession[]>);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom bg-white dark:bg-zinc-950 h-full">
      {Object.entries(groupedSessions).map(([dateKey, dateSessions]) => (
        <div key={dateKey}>
          <div className="sticky top-0 px-4 py-2 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {dateKey}
            </span>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {dateSessions.map(session => {
              const isActive = session.id === currentSessionId;
              return (
                <div
                  key={session.id}
                  className={`group relative flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer ${isActive ? 'bg-orange-50 dark:bg-orange-500/10 border-l-2 border-orange-500' : ''}`}
                  onClick={() => onSelect(session.id)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-medium truncate ${isActive ? 'text-orange-700 dark:text-orange-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
                      {session.title}
                    </h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                      {formatTime(session.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatHistoryList;