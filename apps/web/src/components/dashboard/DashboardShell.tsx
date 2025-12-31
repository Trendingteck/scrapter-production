"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { Header } from "./Header";

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
    plan?: string;
    credits?: number;
  };
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/dashboard/history": "Execution History",
  "/dashboard/store": "Automation Playground",
  "/dashboard/settings": "Platform Settings",
};

export function DashboardShell({ children, user }: DashboardShellProps) {
  const [isDark, setIsDark] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Apply system or preferred theme
    const savedTheme = localStorage.getItem("theme");
    const theme = savedTheme === "light" ? "light" : "dark";
    setIsDark(theme === "dark");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    const theme = newIsDark ? "dark" : "light";
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", newIsDark);
  };

  const currentTitle = pageTitles[pathname] || "Dashboard";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      {/* Sidebar with User Props */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
        {/* Header */}
        <Header
          title={currentTitle}
          isDark={isDark}
          toggleTheme={toggleTheme}
          user={user}
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 bg-background/50 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto pb-20">{children}</div>
        </main>
      </div>
    </div>
  );
}
