import React, { useRef, useEffect } from 'react';
import { RichMessage } from './RichMessage';
import ChatInput from './ChatInput';
import { AgentMessage } from '../types/agent';

interface ActiveSessionViewProps {
    messages: AgentMessage[];
    isProcessing: boolean;
    onSendMessage: (text: string) => void;
    onStop: () => void;
    onBack: () => void;
}

const ActiveSessionView: React.FC<ActiveSessionViewProps> = ({
    messages, isProcessing, onSendMessage, onStop, onBack
}) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden font-sans relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] pointer-events-none rounded-full" />

            <div className="h-14 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 z-20 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-orange-500 transition-all uppercase tracking-widest"
                >
                    <div className="p-1 rounded-md group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10 transition-colors">
                        ←
                    </div>
                    Back
                </button>

                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-800">
                    {isProcessing ? (
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </div>
                    ) : (
                        <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    )}
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                        {isProcessing ? 'Agent Active' : 'Idle'}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-2 relative z-10">
                {messages.map((msg) => (
                    <RichMessage key={msg.id} message={msg} />
                ))}
                <div ref={bottomRef} className="h-8" />
            </div>

            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-20">
                {isProcessing ? (
                    <button
                        onClick={onStop}
                        className="w-full py-4 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold text-sm flex items-center justify-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm active:scale-[0.98]"
                    >
                        <div className="w-2 h-2 bg-red-600 rounded-sm animate-pulse" />
                        Stop Generation
                    </button>
                ) : (
                    <div className="animate-in slide-in-from-bottom-2 duration-300">
                        <ChatInput
                            onSend={onSendMessage}
                            placeholder="Reply to Scrapter..."
                            onStopTask={onStop}
                            disabled={isProcessing}
                            showStopButton={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveSessionView;