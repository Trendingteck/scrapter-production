"use client";

import React, { useState } from "react";
import {
  Search,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Terminal,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Play,
  Table as TableIcon,
  Bot,
  ArrowLeft,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { chatHistoryStore } from "@extension/storage";

interface HistoryDataProps {
  selectedRunId: string | null;
  onSelectRun: (runId: string | null) => void;
}

// --- Types ---
type SessionType = "automation" | "ocr" | "vision" | "captcha";
type Status = "success" | "failed" | "running";

interface Session {
  id: string;
  title: string;
  type: SessionType;
  status: Status;
  date: string;
  duration: string;
  credits: number;
}

// --- Sub-components (outside for performance and pattern) ---

const StatusBadge = ({ status }: { status: Status }) => {
  if (status === "success")
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded border border-green-100 dark:border-green-900/30">
        <CheckCircle2 size={10} /> SUCCESS
      </span>
    );
  if (status === "failed")
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/30">
        <AlertCircle size={10} /> FAILED
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/30">
      <RefreshCw size={10} className="animate-spin" /> RUNNING
    </span>
  );
};

const renderIcon = (type: SessionType) => {
  switch (type) {
    case "automation":
      return <Terminal size={16} />;
    case "vision":
      return <ImageIcon size={16} />;
    case "ocr":
      return <FileText size={16} />;
    default:
      return <MessageSquare size={16} />;
  }
};

// --- Real Data Hook ---
const useChatHistory = (selectedRunId: string | null) => {
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        // In some environments chatHistoryStore might not be initialized yet
        if (!chatHistoryStore) return;

        const meta = await chatHistoryStore.getSessionsMetadata();
        const mapped: Session[] = meta
          .map((m: any) => ({
            id: m.id,
            title: m.title || "Untitled Run",
            type: "automation" as SessionType,
            status: "success" as Status,
            date: new Date(m.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            duration: "-",
            credits: 0,
          }))
          .sort((a: any, b: any) => b.id.localeCompare(a.id)); // Simple sort

        setSessions(mapped);
      } catch (e) {
        console.error("Failed to fetch sessions:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();

    // Subscribe to changes if supported
    const unsubscribe = chatHistoryStore.subscribe
      ? chatHistoryStore.subscribe(() => {
          fetchSessions();
        })
      : () => {};

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (selectedRunId) {
      const fetchMessages = async () => {
        try {
          const session = await chatHistoryStore.getSession(selectedRunId);
          if (session) {
            setMessages(session.messages);
          }
        } catch (e) {
          console.error("Failed to fetch messages:", e);
        }
      };
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedRunId]);

  return { sessions, messages, loading };
};

const HistoryData: React.FC<HistoryDataProps> = ({
  selectedRunId,
  onSelectRun,
}) => {
  const [viewMode, setViewMode] = useState<"chat" | "logs">("chat");
  const {
    sessions,
    messages: chatMessages,
    loading,
  } = useChatHistory(selectedRunId);

  // Logic to determine which session to show
  const currentSession = selectedRunId
    ? sessions.find((s) => s.id === selectedRunId)
    : null;

  // --- MODE 1: CHAT DETAIL VIEW ---
  if (selectedRunId && currentSession) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-background animate-enter">
        {/* Viewer Header */}
        <div className="h-16 border-b border-slate-200 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onSelectRun(null)}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-zinc-800"></div>
            <div
              className={`p-2 rounded-lg ${currentSession.status === "failed" ? "bg-red-50 text-red-600" : "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"}`}
            >
              {renderIcon(currentSession.type)}
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {currentSession.title}
                <StatusBadge status={currentSession.status} />
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {currentSession.date}
                </span>
                <span className="flex items-center gap-1">
                  ID: #{currentSession.id}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("chat")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${viewMode === "chat" ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300"}`}
            >
              <MessageSquare size={14} /> Chat
            </button>
            <button
              onClick={() => setViewMode("logs")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${viewMode === "logs" ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300"}`}
            >
              <Terminal size={14} /> Logs
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            {chatMessages.length > 0 ? (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                      msg.role === "user"
                        ? "bg-slate-200 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400"
                        : "bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-900/30 text-primary-600 dark:text-primary-400"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <Bot size={16} />
                    ) : (
                      <Terminal size={16} />
                    )}
                  </div>
                  <div
                    className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}
                  >
                    {msg.content && (
                      <div
                        className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-primary-600 text-white rounded-tr-none"
                            : "bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-900 dark:text-white rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                    )}

                    {msg.imageGrid && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {msg.imageGrid.map((img: string, i: number) => (
                          <img
                            key={i}
                            src={img}
                            alt="Snapshot"
                            className="rounded-lg border border-slate-200 dark:border-border w-full aspect-video object-cover shadow-sm"
                          />
                        ))}
                      </div>
                    )}

                    {msg.fileAttachment && (
                      <div className="mt-2 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-4 flex items-center justify-between hover:border-primary-600 transition-colors cursor-pointer group shadow-sm w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <TableIcon size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                              {msg.fileAttachment.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-zinc-500">
                              {msg.fileAttachment.size}
                            </div>
                          </div>
                        </div>
                        <button className="p-2 rounded-lg text-slate-400 group-hover:text-primary-600 hover:bg-slate-50 transition-all">
                          <Download size={18} />
                        </button>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 ml-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  No history available
                </h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-xs">
                  Logs for this session may have been deleted or expired.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- MODE 2: LIST VIEW ---
  return (
    <div className="space-y-6 animate-enter">
      {/* Search/Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
            size={16}
          />
          <input
            type="text"
            placeholder="Search history..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl text-sm font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
            <Filter size={16} /> Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl text-sm font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-slate-400">
              Loading history...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-20 text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No history found
              </h3>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-card/50 border-b border-slate-100 dark:border-border">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                    Automation
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border/50">
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => onSelectRun(session.id)}
                    className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${session.status === "failed" ? "bg-red-50 text-red-600" : "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"}`}
                        >
                          {renderIcon(session.type)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                            {session.title}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                            ID: #{session.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={session.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-zinc-400">
                      {session.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-zinc-400">
                      {session.duration}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-all shadow-sm">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryData;
