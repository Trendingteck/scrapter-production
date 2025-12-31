import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentMessage, AgentBlockType } from '../types/agent';
import { parseAgentBlocks } from '../utils';

// Fix: Cast ReactMarkdown to any to bypass strict type mismatch
const Markdown = ReactMarkdown as unknown as React.FC<any>;

// Scrapter Logo Component
const ScrapterLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5000 4530" className="w-full h-full">
        <g fill="rgb(241,98,41)">
            <path d="M2127 4125 c-273 -44 -527 -150 -738 -306 -61 -45 -69 -55 -92 -117 -37 -100 -75 -280 -88 -420 -44 -468 167 -949 523 -1185 83 -56 202 -117 226 -117 7 0 -13 33 -43 73 -67 87 -137 225 -165 327 -28 97 -38 290 -20 397 75 469 501 880 1021 987 222 46 477 46 668 1 22 -6 23 -4 11 10 -25 30 -215 151 -310 197 -123 60 -238 100 -386 134 -105 24 -143 28 -319 30 -139 2 -227 -1 -288 -11z" />
            <path d="M2796 2949 c4 -8 25 -36 46 -62 121 -154 198 -382 198 -586 0 -464 -334 -894 -831 -1069 -182 -64 -270 -77 -519 -76 -187 1 -240 5 -315 21 -93 21 -109 21 -83 0 315 -258 641 -387 1023 -404 343 -15 694 83 982 276 134 90 145 103 177 205 106 341 110 635 14 940 -96 306 -312 573 -578 714 -89 47 -126 61 -114 41z" />
            <path d="M2970 3634 c-189 -23 -328 -60 -469 -125 -245 -113 -479 -337 -583 -555 -21 -45 -38 -85 -38 -88 0 -3 35 23 79 58 285 230 617 275 970 131 127 -52 242 -129 360 -241 209 -200 325 -408 398 -714 34 -145 43 -396 19 -558 -9 -62 -20 -120 -23 -130 -13 -36 35 19 94 107 167 250 256 505 284 814 27 290 -43 638 -179 897 -39 74 -150 244 -181 277 -24 26 -166 73 -307 103 -96 20 -342 34 -424 24z" />
            <path d="M1018 3456 c-147 -192 -257 -449 -306 -711 -26 -142 -23 -428 6 -574 51 -253 143 -469 280 -658 33 -45 57 -67 86 -79 322 -131 640 -155 963 -74 310 78 584 271 737 519 55 89 100 180 93 187 -1 2 -39 -24 -82 -56 -193 -145 -402 -210 -633 -197 -522 29 -966 445 -1091 1022 -41 188 -45 425 -11 615 6 34 10 63 8 65 -2 2 -24 -25 -50 -59z" />
        </g>
    </svg>
);

// Thinking Indicator (animated dots)
const ThinkingIndicator: React.FC = () => (
    <div className="flex items-center gap-3 py-1 animate-in fade-in duration-300">
        <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></div>
        </div>
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-500 animate-pulse">
            Processing...
        </span>
    </div>
);

// Interactive Content - handles [OPTIONS: A | B] syntax
const InteractiveContent: React.FC<{ content: string; onReply?: (text: string) => void }> = ({ content, onReply }) => {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const optionsMatch = content.match(/\[OPTIONS:\s*(.*?)\]/i);
    const textBefore = optionsMatch ? content.replace(optionsMatch[0], '').trim() : content;
    const options = optionsMatch ? optionsMatch[1].split('|').map(o => o.trim()) : null;

    const handleOptionClick = (option: string) => {
        setIsSubmitted(true);
        if (onReply) onReply(option);
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="prose prose-sm max-w-none dark:prose-invert text-zinc-800 dark:text-zinc-200">
                <Markdown remarkPlugins={[remarkGfm]}>{textBefore}</Markdown>
            </div>

            {!isSubmitted && options && (
                <div className="flex flex-wrap gap-2 mt-1 animate-in fade-in duration-300">
                    {options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleOptionClick(opt)}
                            className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-orange-50 dark:hover:bg-zinc-700 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-500/30 transition-all shadow-sm"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Question Card Component
const QuestionCard: React.FC<{ content: string; onReply: (text: string) => void }> = ({ content, onReply }) => {
    const [inputValue, setInputValue] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const optionsMatch = content.match(/\[OPTIONS:\s*(.*?)\]/i);
    const questionText = optionsMatch ? content.replace(optionsMatch[0], '').trim() : content;
    const options = optionsMatch ? optionsMatch[1].split('|').map(o => o.trim()) : null;

    const handleSubmitText = () => {
        if (inputValue.trim()) {
            setIsSubmitted(true);
            onReply(inputValue.trim());
        }
    };

    const handleOptionClick = (option: string) => {
        setIsSubmitted(true);
        onReply(option);
    };

    return (
        <div className="w-full max-w-md my-3 bg-white dark:bg-zinc-800 border border-orange-200 dark:border-orange-900/30 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 ring-1 ring-orange-500/10">
            <div className="flex items-start gap-3 mb-3">
                <div className="p-1.5 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="flex-1">
                    <span className="block text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-1">
                        Scrapter wants to ask
                    </span>
                    <div className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                        <Markdown>{questionText}</Markdown>
                    </div>
                </div>
            </div>

            {!isSubmitted && (
                <div className="pl-0 sm:pl-10">
                    {options ? (
                        <div className="flex flex-wrap gap-2">
                            {options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionClick(opt)}
                                    className="px-4 py-2 text-sm font-medium bg-zinc-50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-300 hover:border-orange-200 dark:hover:border-orange-500/30 transition-all"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmitText()}
                                placeholder="Type your response here..."
                                className="flex-1 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-600 rounded-lg outline-none focus:border-orange-400 dark:focus:border-orange-500 focus:ring-1 focus:ring-orange-400/20 transition-all"
                                autoFocus
                            />
                            <button
                                onClick={handleSubmitText}
                                disabled={!inputValue.trim()}
                                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Send
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Execution Logs Component (collapsible)
const ExecutionLogs: React.FC<{ logs: string[]; isStreaming: boolean; isComplete: boolean }> = ({ logs, isStreaming, isComplete }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Auto-expand when streaming and not complete, auto-collapse when complete
        if (isStreaming && !isComplete) {
            setIsExpanded(true);
        } else if (isComplete) {
            setIsExpanded(false);
        }
    }, [isStreaming, isComplete]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (isExpanded && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs.length, logs[logs.length - 1], isExpanded]);

    if (logs.length === 0) return null;

    return (
        <div className="w-full my-2 animate-in fade-in slide-in-from-top-1 duration-300">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="group flex items-center gap-2 select-none focus:outline-none"
            >
                <div className={`
            flex items-center justify-center w-5 h-5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800
            text-zinc-400 transition-all duration-200
            ${isExpanded ? 'rotate-90 text-zinc-600 dark:text-zinc-300' : '-rotate-0'}
        `}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                </div>

                <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200 transition-colors">
                    Execution Steps
                </span>

                {isStreaming && !isComplete && (
                    <div className="flex items-center gap-2 ml-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                    </div>
                )}
            </button>

            {isExpanded && (
                <div
                    ref={scrollRef}
                    className="mt-1 ml-[9px] pl-3 border-l-2 border-zinc-200 dark:border-zinc-800 max-h-64 overflow-y-auto space-y-3 font-mono text-[11px] leading-relaxed scrollbar-thin pb-2"
                >
                    {logs.map((log, idx) => {
                        const match = log.match(/^\[([A-Z]+)\]\s*([\s\S]*)$/);
                        const type = match ? match[1] : 'INFO';
                        const content = match ? match[2] : log;

                        const isAction = type === 'ACTION';

                        return (
                            <div key={idx} className="flex gap-2.5 group/log">
                                <div className={`shrink-0 w-16 uppercase text-[9px] font-bold pt-[2px] ${isAction ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}`}>
                                    {type}
                                </div>
                                <div className={`flex-1 min-w-0 ${isAction ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-500 dark:text-zinc-500'}`}>
                                    <div className="whitespace-pre-wrap">{content}</div>
                                </div>
                            </div>
                        );
                    })}

                    {isStreaming && !isComplete && (
                        <div className="w-1.5 h-3 bg-zinc-300 dark:bg-zinc-700 animate-pulse ml-[74px]"></div>
                    )}
                </div>
            )}
        </div>
    );
}

// Agent Message Content - Uses parseAgentBlocks at render time
const AgentMessageContent: React.FC<{ content: string; isStreaming?: boolean; onReply: (text: string) => void }> = ({ content, isStreaming, onReply }) => {
    const { initial, logs, question, final } = parseAgentBlocks(content);

    return (
        <div className="flex flex-col space-y-2 w-full max-w-full text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">

            {/* 1. Initial Response (e.g. "I'm on it") */}
            {initial && (
                <div className="animate-in fade-in duration-300">
                    <InteractiveContent content={initial} onReply={onReply} />
                </div>
            )}

            {/* 2. Execution Logs (Thinking, Action) - Collapsible & Clean */}
            {(logs.length > 0) && (
                <ExecutionLogs
                    logs={logs}
                    isStreaming={!!isStreaming}
                    isComplete={!!final || !!question || (isStreaming === false)}
                />
            )}

            {/* 3. Question Block (Rendered Prominently) */}
            {question && (
                <QuestionCard content={question} onReply={onReply} />
            )}

            {/* 4. Final Response (Result) */}
            {final && (
                <div className="animate-in slide-in-from-bottom-2 duration-300 pt-1">
                    <InteractiveContent content={final} onReply={onReply} />
                </div>
            )}
        </div>
    );
};

// Main RichMessage Component
export const RichMessage: React.FC<{ message: AgentMessage, onReply?: (text: string) => void }> = ({ message, onReply }) => {
    if (message.role === 'user') {
        return (
            <div className="flex justify-end mb-6">
                <div className="flex flex-col items-end max-w-[90%]">
                    <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-[20px] rounded-tr-sm px-4 py-2.5 text-sm shadow-sm border border-zinc-200/50 dark:border-zinc-700/50">
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-0">
                            <Markdown>{message.content}</Markdown>
                        </div>
                    </div>
                    {message.attachment && (
                        <div className="mt-1 mr-1 flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-100 dark:border-zinc-800">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path fillRule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z" clipRule="evenodd" />
                            </svg>
                            <span className="truncate max-w-[100px]">{message.attachment.name}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (message.role === 'system') {
        return (
            <div className="flex justify-center mb-4">
                <span className="text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-800">
                    {message.content}
                </span>
            </div>
        );
    }

    // Thinking indicator for empty streaming message
    if (message.role === 'assistant' && message.content === '' && message.isStreaming) {
        return (
            <div className="flex gap-4 w-full animate-in fade-in duration-300 mb-2">
                <div className="shrink-0 w-8 h-8 flex items-start pt-1">
                    <ScrapterLogo />
                </div>
                <div className="flex-1 pt-1.5">
                    <ThinkingIndicator />
                </div>
            </div>
        );
    }

    // Empty finalized message - skip
    if (message.role === 'assistant' && message.content === '' && !message.isStreaming) {
        return null;
    }

    // Full AI Response
    return (
        <div className="flex gap-4 w-full max-w-full mb-4">
            <div className="shrink-0 w-8 h-8 flex items-start pt-1">
                <ScrapterLogo />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
                <AgentMessageContent
                    content={message.content}
                    isStreaming={message.isStreaming}
                    onReply={onReply || (() => { })}
                />
            </div>
        </div>
    );
};
