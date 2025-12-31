"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  RotateCcw,
  Terminal,
  CheckCircle2,
  Loader2,
  FileSpreadsheet,
  Bot,
  User,
  ArrowRight,
} from "lucide-react";

// Steps simulating the agent's thought process
const DEMO_SEQUENCE = [
  {
    type: "user",
    content:
      "Extract all software engineer profiles from this page and save to CSV.",
  },
  {
    type: "agent",
    content:
      "Understood. I will analyze the page structure and extract profile data.",
  },
  {
    type: "plan",
    content: "Execution Plan",
    steps: [
      "Analyze DOM structure",
      "Identify list container .profile-card",
      "Extract Name, Role, Location",
      "Handle pagination",
      "Export to CSV",
    ],
  },
  {
    type: "log",
    content: "Analyzing DOM...",
    details: [
      "> analyze_website()",
      "> Found 15 profile cards",
      '> extract_data(selector=".profile-card")',
      "> navigate_next_page()",
    ],
  },
  {
    type: "agent",
    content: "I have successfully extracted 15 profiles from the current page.",
  },
  { type: "result", title: "profiles_export.csv", size: "12 KB", rows: 15 },
];

const InteractiveDemo: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stepIndex < DEMO_SEQUENCE.length) {
      const delay = stepIndex === 0 ? 500 : 2000;
      timer = setTimeout(() => {
        setStepIndex((prev) => prev + 1);
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [stepIndex, isReplaying]);

  // Auto-scroll effect
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [stepIndex]);

  const handleReplay = () => {
    setStepIndex(0);
    setIsReplaying((prev) => !prev);
  };

  return (
    <section
      id="how-it-works"
      className="py-32 relative overflow-hidden bg-white dark:bg-[#1a1a1a] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Left Side: Text */}
        <div className="order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 text-xs font-mono mb-6 border border-orange-200 dark:border-orange-500/20 font-bold">
              <Terminal size={12} />
              <span>LIVE AGENT PREVIEW</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-zinc-900 dark:text-white leading-tight">
              It thinks like a human. <br />
              <span className="text-zinc-400 dark:text-zinc-600">
                Executes like a machine.
              </span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-10 leading-relaxed font-light">
              Scrapter isn&apos;t just a scraper. It&apos;s an autonomous agent
              living in your side panel. Give it a natural language goal, and
              watch it plan, execute, and adapt to website changes in real-time.
            </p>

            <div className="space-y-4 mb-10">
              {[
                "Natural Language Control",
                "DOM-aware Context Understanding",
                "ReAct Architecture (Reasoning + Action)",
                "Persistent Memory Scratchpad",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-500 group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={14} strokeWidth={3} />
                  </div>
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleReplay}
              className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
            >
              <RotateCcw size={16} /> Replay Animation
            </button>
          </motion.div>
        </div>

        {/* Right Side: The Chat UI Replica */}
        <div className="order-1 lg:order-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-orange-500/30 to-zinc-500/30 rounded-[2rem] blur-2xl opacity-50 dark:opacity-30"></div>

            {/* Main Panel */}
            <div className="relative bg-white dark:bg-[#09090b] rounded-3xl shadow-2xl overflow-hidden h-[600px] flex flex-col border border-zinc-200 dark:border-zinc-800 transition-colors duration-300 ring-1 ring-black/5 dark:ring-white/5">
              {/* Header */}
              <div className="h-16 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-6 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                    <Terminal size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">
                      Scrapter Agent
                    </div>
                    <div className="text-[10px] text-green-600 dark:text-green-500 flex items-center gap-1.5 font-medium">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                      </span>
                      Active
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                </div>
              </div>

              {/* Chat Content */}
              <div
                className="flex-1 p-6 overflow-y-auto relative bg-zinc-50/50 dark:bg-[#09090b]"
                ref={scrollRef}
              >
                <div className="space-y-6 pb-20">
                  <AnimatePresence mode="popLayout">
                    {DEMO_SEQUENCE.slice(0, stepIndex).map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className={`flex gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${
                            msg.type === "user"
                              ? "bg-zinc-900 dark:bg-white text-white dark:text-black"
                              : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-orange-600 dark:text-orange-500"
                          }`}
                        >
                          {msg.type === "user" ? (
                            <User size={14} />
                          ) : (
                            <Bot size={16} />
                          )}
                        </div>

                        {/* Bubble */}
                        <div
                          className={`max-w-[85%] space-y-2 ${msg.type === "user" ? "items-end flex flex-col" : "w-full"}`}
                        >
                          {(msg.type === "user" || msg.type === "agent") && (
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                msg.type === "user"
                                  ? "bg-zinc-900 dark:bg-white text-white dark:text-black rounded-tr-sm"
                                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-tl-sm"
                              }`}
                            >
                              {msg.content}
                            </div>
                          )}

                          {msg.type === "plan" && (
                            <div className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm w-full">
                              <div className="bg-zinc-50 dark:bg-zinc-900 px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                  <Play size={12} className="text-orange-500" />{" "}
                                  {msg.content}
                                </span>
                              </div>
                              <div className="p-4 space-y-3">
                                {msg.steps?.map((step, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400"
                                  >
                                    <div
                                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono border ${sIdx === 0 ? "bg-orange-500 border-orange-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500"}`}
                                    >
                                      {sIdx + 1}
                                    </div>
                                    <span>{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {msg.type === "log" && (
                            <div className="bg-zinc-900 dark:bg-black rounded-xl p-4 font-mono border border-zinc-800 shadow-md w-full">
                              <div className="text-xs font-bold text-orange-400 mb-3 flex items-center gap-2">
                                <Loader2 size={12} className="animate-spin" />{" "}
                                {msg.content}
                              </div>
                              <div className="space-y-1.5">
                                {msg.details?.map((detail, dIdx) => (
                                  <div
                                    key={dIdx}
                                    className="text-[11px] text-zinc-400 flex gap-2"
                                  >
                                    <span className="text-zinc-600 select-none">
                                      ➜
                                    </span>
                                    <span className="opacity-90">{detail}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {msg.type === "result" && (
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex items-center justify-between hover:border-orange-500/50 transition-colors cursor-pointer group shadow-sm w-full">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-500">
                                  <FileSpreadsheet size={20} />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                    {msg.title}
                                  </div>
                                  <div className="text-xs text-zinc-500">
                                    {msg.rows} rows • {msg.size}
                                  </div>
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-orange-500 group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10 transition-all">
                                <ArrowRight size={14} />
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] z-10 transition-colors duration-300">
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    placeholder="Ask Scrapter to analyze this page..."
                    className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent dark:border-zinc-700/50 rounded-xl px-4 py-3.5 text-sm text-zinc-500 dark:text-zinc-400 focus:outline-none cursor-not-allowed"
                  />
                  <div className="absolute right-2 top-2 p-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg">
                    <Play
                      size={14}
                      className="text-zinc-400"
                      fill="currentColor"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;
