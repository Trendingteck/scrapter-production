import React, { useState } from 'react';
import WelcomeView from './components/WelcomeView';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import ImageGallery from './components/features/ImageGallery';
import { ImageToolbar } from './components/features/ImageToolbar';
import { ViewMode } from './types/event';
import { useAgentStream } from './hooks/useAgentStream';
import { Terminal, Image as ImageIcon, MessageSquare } from 'lucide-react';
import './SidePanel.css';

// Styling for the Header Logo
const HeaderLogo = () => (
  <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-zinc-900 dark:text-white select-none">
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
      <Terminal size={16} strokeWidth={2.5} />
    </div>
    <span>Scrapter</span>
  </div>
);

const SidePanel: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.CHAT);
  const [draftMessage, setDraftMessage] = useState<string>('');

  // Use the new hook that properly parses 'token', 'block_start', etc.
  const { messages, isProcessing, startTask, stopTask, clearMessages } = useAgentStream();
  const hasStarted = messages.length > 0;

  const handleStartChat = (initialText: string, attachment?: any) => {
    setDraftMessage('');
    startTask(initialText, attachment); // Pass attachment to hook
  };

  const handleSuggestionClick = (text: string) => {
    setDraftMessage(text);
  };

  const handleBack = () => {
    stopTask();
    clearMessages();
    setView(ViewMode.CHAT);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-orange-500 selection:text-white overflow-hidden">

      {/* --- Header --- */}
      <div className="h-16 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between px-5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-20 shrink-0">
        <div className="cursor-pointer transition-opacity hover:opacity-80" onClick={handleBack}>
          <HeaderLogo />
        </div>

        {/* View Toggle (Only visible if chat started) */}
        {hasStarted && (
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
            <button
              onClick={() => setView(ViewMode.CHAT)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === ViewMode.CHAT 
                ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-500 shadow-sm border border-zinc-200/50 dark:border-zinc-700' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <MessageSquare size={14} />
              Chat
            </button>
            <button
              onClick={() => setView(ViewMode.IMAGES)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === ViewMode.IMAGES 
                ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-500 shadow-sm border border-zinc-200/50 dark:border-zinc-700' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <ImageIcon size={14} />
              Images
            </button>
          </div>
        )}
      </div>

      {/* --- Main Content --- */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-zinc-50/50 dark:bg-black/20">
        {!hasStarted ? (
          <WelcomeView
            username="User"
            onSuggestionClick={handleSuggestionClick}
            onStartChat={handleStartChat}
            draftText={draftMessage}
          />
        ) : (
          <>
            {view === ViewMode.CHAT && (
              <>
                <MessageList messages={messages} onReply={handleStartChat} />
                {/* Chat Input Area with Blur Background */}
                <div className="w-full shrink-0 border-t border-zinc-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md pb-safe">
                  <div className="pt-4">
                     <ChatInput
                        onSend={handleStartChat}
                        onStopTask={stopTask}
                        disabled={isProcessing}
                        showStopButton={isProcessing}
                        placeholder="Reply to Scrapter..."
                      />
                  </div>
                </div>
              </>
            )}

            {view === ViewMode.IMAGES && (
              <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
                <ImageToolbar
                  totalImages={0}
                  selectedCount={0}
                  isPicking={false}
                  isProcessing={false}
                  onTogglePicker={() => { }}
                  onSelectAll={() => { }}
                  onDownload={() => { }}
                  onRefresh={() => { }}
                />
                <ImageGallery />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SidePanel;