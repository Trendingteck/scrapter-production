"use client";

import React, { useState } from "react";
import {
  User,
  Lock,
  Moon,
  Sun,
  Camera,
  Save,
  Loader2,
  FileText,
  Mail,
} from "lucide-react";
import { authStore } from "@extension/storage";

export const AgentProfileSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    name: "Alex Chen",
    email: "alex@techflow.com",
    bio: "Senior Data Engineer focusing on e-commerce scraping and market analysis.",
    theme: "dark",
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
  };

  const toggleTheme = () => {
    const newTheme = user.theme === "light" ? "dark" : "light";
    setUser({ ...user, theme: newTheme });

    // Apply global theme change
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 1. Identity & Avatar */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                <span className="text-3xl font-bold text-zinc-400">AC</span>
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white w-8 h-8" />
              </div>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Allowed: JPG, PNG
            </span>
          </div>

          <div className="flex-1 space-y-5 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block flex justify-between">
                <span>Agent Context (User Summary)</span>
                <span className="text-[10px] text-orange-600 dark:text-orange-500 font-normal normal-case">
                  Visible to Agents
                </span>
              </label>
              <div className="relative">
                <FileText
                  size={16}
                  className="absolute left-3 top-3.5 text-zinc-400"
                />
                <textarea
                  rows={3}
                  value={user.bio}
                  onChange={(e) => setUser({ ...user, bio: e.target.value })}
                  className="w-full pl-9 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-white resize-none"
                  placeholder="Describe your role and preferences so the AI can personalize its responses..."
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1.5">
                This summary is injected into the system prompt to help models
                understand your specific needs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Preferences & Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Preference */}
        <div className="bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
            {user.theme === "light" ? <Sun size={18} /> : <Moon size={18} />}{" "}
            Appearance
          </h3>
          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-white">
                Interface Theme
              </div>
              <div className="text-xs text-zinc-500">
                Currently:{" "}
                <span className="capitalize font-bold">{user.theme}</span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
            >
              {user.theme === "light" ? "Switch to Dark" : "Switch to Light"}
            </button>
          </div>
        </div>

        {/* Password Change */}
        <div className="bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
            <Lock size={18} /> Security
          </h3>
          <button className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-orange-200 dark:hover:border-orange-900/30 transition-colors group text-left">
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-white">
                Change Password
              </div>
              <div className="text-xs text-zinc-500">
                Last updated 3 months ago
              </div>
            </div>
            <span className="px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-700 group-hover:border-orange-500/30 transition-colors">
              Update
            </span>
          </button>
        </div>
      </div>

      {/* Save Actions */}
      <div className="sticky bottom-4 flex justify-end">
        <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70 active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};
