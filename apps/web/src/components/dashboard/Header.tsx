"use client";

import React from "react";
import { Sun, Moon, Bell, Search, Command } from "lucide-react";
import { Button } from "@extension/ui"; // Assuming usage of shared UI package or local components

interface HeaderProps {
  title: string;
  isDark: boolean;
  toggleTheme: () => void;
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
    plan?: string;
    credits?: number;
  };
}

export function Header({ title, isDark, toggleTheme, user }: HeaderProps) {
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : user?.email
      ? user.email[0].toUpperCase()
      : "U";

  return (
    <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex flex-col justify-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
          {title}
        </h2>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          System Operational
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-zinc-100 dark:bg-zinc-800/50 rounded-xl px-4 py-2.5 border border-transparent focus-within:border-orange-500/50 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all w-72">
          <Search size={16} className="text-zinc-400 mr-3" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none focus:outline-none text-sm w-full text-zinc-900 dark:text-white placeholder:text-zinc-500"
          />
          <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[10px] text-zinc-500 font-medium">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>

        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-2"></div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="relative p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white dark:border-[#1a1a1a]"></span>
          </button>
        </div>

        <div className="pl-2 border-l border-zinc-200 dark:border-zinc-800 ml-2">
          <div className="flex items-center gap-3 p-1 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-sm font-semibold text-zinc-900 dark:text-white leading-none">
                {user?.user_metadata?.full_name || "Guest User"}
              </span>
              <span className="text-[10px] text-orange-600 dark:text-orange-500 font-bold uppercase tracking-wider mt-1">
                {user?.plan || "Free"} Plan
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-700 dark:text-zinc-300 shadow-sm group-hover:shadow-md transition-all">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
