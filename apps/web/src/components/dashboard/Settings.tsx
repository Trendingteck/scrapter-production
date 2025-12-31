"use client";

import React, { useState } from "react";
import { PieChart, Layout, Cpu, Shield, UserCircle } from "lucide-react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { AgentGeneralSettings as GeneralSettings } from "./settings/GeneralSettings";
import { AgentModelSettings as ModelSettings } from "./settings/ModelSettings";
import { AgentFirewallSettings as FirewallSettings } from "./settings/FirewallSettings";
import { AgentProfileSettings as ProfileSettings } from "./settings/ProfileSettings";

interface SettingsProps {
  className?: string;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

const Settings: React.FC<SettingsProps> = () => {
  const [activeTab, setActiveTab] = usePersistedState<
    "profile" | "general" | "models" | "firewall" | "analytics"
  >("settings-active-tab", "profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: UserCircle },
    { id: "general", label: "General", icon: Layout },
    { id: "models", label: "Models & Providers", icon: Cpu },
    { id: "firewall", label: "Firewall", icon: Shield },
    { id: "analytics", label: "Analytics", icon: PieChart },
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Settings
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your account, agent behavior, and infrastructure.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-orange-500 text-orange-600 dark:text-orange-500"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <Icon
                size={16}
                className={
                  isActive ? "text-orange-600 dark:text-orange-500" : ""
                }
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="mt-8 transition-all">
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "models" && <ModelSettings />}
        {activeTab === "firewall" && <FirewallSettings />}
        {activeTab === "analytics" && (
          <div className="bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-16 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PieChart size={32} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
              Analytics Dashboard
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-8 font-medium">
              Detailed platform usage analytics and audit logs are available on
              Pro and Enterprise plans.
            </p>
            <button className="bg-zinc-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg hover:shadow-xl">
              Upgrade to Pro
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
