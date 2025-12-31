"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Brain,
  Lock,
  Layout,
  FileSpreadsheet,
  Fingerprint,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "Silent Awareness",
    description:
      "Analyzes DOM structures invisibly. Scrapter understands page context without injecting visible scripts until necessary.",
    icon: Eye,
  },
  {
    title: "Advanced AI Core",
    description:
      "Powered by state-of-the-art LLMs. The agent plans multi-step workflows, reasons through navigation, and handles errors autonomously.",
    icon: Brain,
  },
  {
    title: "Auto-Captcha Solver",
    description:
      "Intelligent visual recognition solves complex captchas instantly using a combination of heuristics and AI vision.",
    icon: Lock,
  },
  {
    title: "Smart Extraction",
    description:
      "Automatically identifies repeated patterns, lists, and tables. Exports structured data to JSON, CSV, or Excel.",
    icon: FileSpreadsheet,
  },
  {
    title: "Anti-Fingerprinting",
    description:
      "Mimics human behavior with non-linear mouse movements, realistic typing delays, and scroll patterns.",
    icon: Fingerprint,
  },
  {
    title: "Visual Dashboard",
    description:
      "Watch the agent work in real-time via the sidebar console, or let it run headless in the background.",
    icon: Layout,
  },
];

const Features: React.FC = () => {
  return (
    <section
      id="features"
      className="py-32 relative bg-zinc-50 dark:bg-black transition-colors duration-300"
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] dark:opacity-[0.05] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Zap size={12} className="fill-current" />
            Capabilities
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-6 text-zinc-900 dark:text-white"
          >
            Capabilities that <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
              Defy Detection.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed"
          >
            Built for developers who need reliable data pipelines from the most
            stubborn websites. Scrapter handles the edge cases so you don't have
            to.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-8 rounded-3xl bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 hover:border-orange-500/30 dark:hover:border-orange-500/30 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-orange-600 dark:text-orange-500 mb-6 group-hover:scale-110 group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10 transition-all duration-300">
                <feature.icon size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                {feature.title}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
