"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Zap,
  Activity,
  Clock,
  Database,
  Play,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { authStore, chatHistoryStore } from "@extension/storage";

interface OverviewProps {
  className?: string;
}

const Overview: React.FC<OverviewProps> = () => {
  const [credits, setCredits] = useState<number>(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [totalRuns, setTotalRuns] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        // In a real app, use authStore from a context or prop if possible to avoid hydration mismatch
        // defaulting to safe values
        setCredits(500);
        setTotalRuns(12);

        // Simulate data
        const activity = [
          {
            id: 1,
            title: "Competitor Analysis",
            status: "success",
            date: "Just now",
          },
          {
            id: 2,
            title: "LinkedIn Lead Gen",
            status: "running",
            date: "5m ago",
          },
          {
            id: 3,
            title: "Amazon Price Monitor",
            status: "failed",
            date: "1h ago",
          },
          {
            id: 4,
            title: "News Aggregation",
            status: "success",
            date: "2h ago",
          },
        ];
        setRecentActivity(activity);
      } catch (e) {
        console.error("Failed to load overview data", e);
      }
    };
    loadData();
  }, []);

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
    <div className="bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon size={20} />
        </div>
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
        {value}
      </div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
        {subtext}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-2">Ready to automate?</h2>
            <p className="text-orange-100 opacity-90 max-w-lg">
              Your agent is idle. Start a new task or explore the automation
              store for pre-built workflows.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/store">
              <button className="px-6 py-3 bg-white text-orange-600 font-bold rounded-xl shadow-lg hover:bg-orange-50 transition-colors flex items-center gap-2">
                <Play size={16} fill="currentColor" /> Run New Task
              </button>
            </Link>
          </div>
        </div>
        {/* Decorational Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Credits"
          value={credits.toLocaleString()}
          subtext="1,000 monthly limit"
          icon={Zap}
          colorClass="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500"
        />
        <StatCard
          title="Total Runs"
          value={totalRuns}
          subtext="+12% from last week"
          icon={Activity}
          colorClass="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500"
        />
        <StatCard
          title="Records Extracted"
          value="4.2k"
          subtext="Data points processed"
          icon={Database}
          colorClass="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-500"
        />
        <StatCard
          title="Time Saved"
          value="12h"
          subtext="Estimated manual work"
          icon={Clock}
          colorClass="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Usage Chart (Mocked with CSS bars) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Credit Usage
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Activity over the last 7 days
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
              <button className="px-3 py-1 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white rounded shadow-sm">
                Week
              </button>
              <button className="px-3 py-1 hover:text-zinc-900 dark:hover:text-white">
                Month
              </button>
            </div>
          </div>

          <div className="flex items-end gap-4 h-64 w-full px-2">
            {[35, 55, 25, 85, 45, 65, 40].map((h, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col justify-end gap-3 group cursor-pointer"
              >
                <div className="relative w-full bg-zinc-100 dark:bg-zinc-800 rounded-t-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02]">
                  <div
                    className="w-full bg-gradient-to-t from-orange-600 to-orange-400 opacity-80 group-hover:opacity-100 transition-opacity rounded-t-xl"
                    style={{ height: `${h * 2}px` }}
                  ></div>
                </div>
                <div className="text-xs font-medium text-center text-zinc-400 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Recent Runs
            </h3>
            <Link
              href="/dashboard/history"
              className="text-xs font-bold text-orange-600 dark:text-orange-500 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4 overflow-y-auto pr-2 flex-1 custom-scrollbar max-h-[300px]">
            {recentActivity.length === 0 ? (
              <div className="text-sm text-zinc-400 py-8 text-center bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                No recent activity
              </div>
            ) : (
              recentActivity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700/50 group cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${
                      item.status === "running"
                        ? "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400"
                        : item.status === "success"
                          ? "bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400"
                          : "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {item.status === "running" ? (
                      <Activity size={16} className="animate-spin" />
                    ) : item.status === "success" ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {item.date}
                      </p>
                      <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
                      <p className="text-xs text-zinc-500 capitalize">
                        {item.status}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-zinc-300 group-hover:text-orange-500 transition-colors -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
