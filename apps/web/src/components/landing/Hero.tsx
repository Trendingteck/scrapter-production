"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Zap, Shield } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
              v3.1 • Your Essential AI Web Companion
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl text-zinc-900 dark:text-white"
          >
            Turn the Web into <br />
            <span className="text-gradient">Structured Data</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-10 leading-relaxed"
          >
            Scrapter is an autonomous browser agent powered by next-gen AI. It
            navigates, reasons, solves captchas, and extracts data—so you
            don&apos;t have to.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <button className="w-full sm:w-auto bg-orange-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center justify-center gap-2 group">
              Start Scraping Free
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button className="w-full sm:w-auto bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
              <Bot size={20} className="text-zinc-500" />
              Watch Demo
            </button>
          </motion.div>

          {/* Browser Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 w-full max-w-5xl"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-700 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

              <div className="relative rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl transition-colors duration-300">
                <div className="h-10 bg-zinc-100 dark:bg-black/40 border-b border-zinc-200 dark:border-white/10 flex items-center px-4 gap-2 transition-colors duration-300">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80 dark:bg-red-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80 dark:bg-yellow-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400/80 dark:bg-green-500/20"></div>
                  </div>
                  <div className="ml-4 flex-1 bg-white dark:bg-black/50 border border-zinc-200 dark:border-transparent rounded h-6 flex items-center px-3 text-xs text-zinc-500 font-mono">
                    scrapter://agent/dashboard
                  </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Live Activity
                      </h3>
                      <span className="text-xs text-green-600 dark:text-green-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Agent Active
                      </span>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3 border border-zinc-200 dark:border-white/5 flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-orange-600 dark:text-orange-500">
                            <Zap size={14} />
                          </div>
                          <div className="flex-1">
                            <div className="h-2 w-24 bg-zinc-300 dark:bg-zinc-700 rounded mb-1.5"></div>
                            <div className="h-1.5 w-full max-w-[200px] bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                          </div>
                          <div className="text-xs font-mono text-zinc-500">
                            00:0{i}s
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
                      <div className="text-xs text-zinc-500 mb-1">
                        Total Requests
                      </div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                        14,203
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-500 mt-1">
                        +12% this week
                      </div>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
                      <div className="text-xs text-zinc-500 mb-1">
                        Captcha Success
                      </div>
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                        99.8%
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        Auto-solver active
                      </div>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5 flex items-center gap-3">
                      <Shield className="text-zinc-600" size={20} />
                      <div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                          Proxies Ready
                        </div>
                        <div className="text-xs text-zinc-500">
                          Rotating IP pool
                        </div>
                      </div>
                    </div>
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

export default Hero;
