"use client";

import React, { useState } from "react";
import {
  Search,
  Map,
  ShoppingBag,
  UserSearch,
  FileText,
  Zap,
  Clock,
  Shield,
  Play,
  Lock,
  X,
  ArrowRight,
  Bot,
  Sparkles,
  Filter,
  Star,
} from "lucide-react";

type Tab = "featured" | "new" | "popular" | "free";

const AutomationStore: React.FC = () => {
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("featured");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Mock data
  const templates = [
    {
      id: 1,
      title: "Google Maps Deep Extract",
      category: "popular",
      icon: Map,
      color: "blue",
      type: "Popular",
      runs: "15k",
      time: "Avg 2m",
      description:
        "Searches for businesses, iterates through results, and extracts phone, website, and reviews.",
    },
    {
      id: 2,
      title: "Amazon Product Monitor",
      category: "popular",
      icon: ShoppingBag,
      color: "orange",
      type: "Pro",
      runs: "8.2k",
      time: "Fast",
      description:
        "Extracts price, availability, and rating from a list of product URLs. Supports pagination.",
    },
    {
      id: 3,
      title: "LinkedIn Profile Scraper",
      category: "new",
      icon: UserSearch,
      color: "blue",
      type: "Pro",
      runs: "22k",
      time: "Safe Mode",
      description:
        "Safe mode scraper. Extracts job history, education, and about sections from profiles.",
    },
    {
      id: 4,
      title: "Blog/Article Extractor",
      category: "free",
      icon: FileText,
      color: "slate",
      type: "Free",
      runs: "45k",
      time: "Instant",
      description:
        "Reads any news site or blog and converts content to Markdown/JSON. Removes ads.",
    },
    {
      id: 5,
      title: "Competitor Pricing Watch",
      category: "new",
      icon: Zap,
      color: "orange",
      type: "Pro",
      runs: "1.2k",
      time: "Daily",
      description:
        "Monitors pricing changes on competitor websites and alerts you on drops.",
    },
    {
      id: 6,
      title: "Sentiment Analysis",
      category: "free",
      icon: Star,
      color: "slate",
      type: "Free",
      runs: "5k",
      time: "Fast",
      description:
        "Scrapes reviews and performs basic sentiment analysis on the text.",
    },
  ];

  const handleConfigure = (template: any) => {
    setSelectedTemplate(template);
    setConfigModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header / Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-1">
        <div className="flex gap-6 text-sm overflow-x-auto scrollbar-none">
          {["featured", "new", "popular", "free"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={`py-3 border-b-2 font-bold whitespace-nowrap transition-all capitalize ${
                activeTab === tab
                  ? "border-orange-500 text-orange-600 dark:text-orange-500"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
            >
              {tab} Flows
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pb-2 sm:pb-0">
          <div className="relative">
            <Search
              className="absolute left-2.5 top-2 text-zinc-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search templates..."
              className="pl-8 pr-4 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-orange-500 rounded-lg text-sm text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none transition-all w-48 lg:w-64"
            />
          </div>
          <button className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Enterprise Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 dark:from-orange-950 dark:via-zinc-900 dark:to-zinc-950 border border-zinc-800 p-8 shadow-xl group">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
          <Bot size={400} className="text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-400 mb-4 uppercase tracking-wider">
              <Sparkles size={12} />
              Enterprise Services
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Need a custom scraping pipeline?
            </h2>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              Our engineering team builds and maintains dedicated automation
              flows tailored to your specific business logic and scale
              requirements.
            </p>
          </div>
          <button className="whitespace-nowrap px-6 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 transition-all transform hover:scale-105 flex items-center gap-2 group/btn">
            Request Custom Build
            <ArrowRight
              size={18}
              className="group-hover/btn:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((card) => (
          <div
            key={card.id}
            className="bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col h-full group hover:border-orange-500/30 dark:hover:border-orange-500/30 hover:shadow-lg dark:hover:shadow-orange-900/5 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${
                  card.color === "blue"
                    ? "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/20"
                    : card.color === "orange"
                      ? "bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/20"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <card.icon size={24} strokeWidth={1.5} />
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border ${
                  card.type === "Popular"
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                    : card.type === "Pro"
                      ? "bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/20"
                      : "bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/20"
                }`}
              >
                {card.type}
              </span>
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
              {card.title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 line-clamp-2 leading-relaxed">
              {card.description}
            </p>

            <div className="mt-auto">
              <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500 mb-5 pt-5 border-t border-zinc-100 dark:border-zinc-800">
                <span className="flex items-center gap-1.5">
                  <Zap size={14} className="text-orange-500" /> {card.runs} runs
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> {card.time}
                </span>
              </div>

              {card.type === "Pro" ? (
                <button className="w-full py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:border-orange-500/30 dark:hover:border-orange-500/30 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn">
                  <Lock
                    size={14}
                    className="text-zinc-400 group-hover/btn:text-orange-500"
                  />{" "}
                  Upgrade to Use
                </button>
              ) : (
                <button
                  onClick={() => handleConfigure(card)}
                  className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Play size={14} fill="currentColor" /> Configure & Run
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CONFIGURATION MODAL */}
      {configModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800">
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Configure Run
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {selectedTemplate?.title}
                </p>
              </div>
              <button
                onClick={() => setConfigModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Search Query
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dentists in New York"
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-900 dark:text-white placeholder-zinc-400 transition-all"
                />
                <p className="text-xs text-zinc-400 mt-1.5">
                  Input for the main search field.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Max Items
                  </label>
                  <input
                    type="number"
                    defaultValue="10"
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-900 dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Format
                  </label>
                  <select className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-900 dark:text-white transition-all appearance-none cursor-pointer">
                    <option>CSV (Excel)</option>
                    <option>JSON</option>
                    <option>Webhook</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end gap-3">
              <button
                onClick={() => setConfigModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button className="px-5 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 transform active:scale-95">
                <Play size={14} fill="currentColor" /> Start Automation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationStore;
