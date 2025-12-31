"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  History,
  Settings,
  Workflow,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Terminal,
  LogOut,
  Moon,
  Sun,
  User,
  CreditCard,
  ChevronsUpDown,
  Loader2,
} from "lucide-react";
import { signout } from "@/app/(auth)/actions"; // Import the server action

interface SidebarProps {
  user?: {
    email?: string;
    user_metadata?: { full_name?: string };
    plan?: string;
  };
  onNavigate?: (path: string) => void;
}

// NavItem sub-component for cleaner code
const NavItem = ({
  icon: Icon,
  label,
  href,
  activePath,
  isCollapsed,
  badge,
  hasSubmenu = false,
  isExpanded = false,
  onToggleExpand,
  recentHistory = [],
}: any) => {
  const isActive =
    activePath === href ||
    (href !== "/dashboard" && activePath.startsWith(href));

  return (
    <div className="relative">
      <Link
        href={href}
        className={`group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 w-full ${
          isActive
            ? "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 shadow-sm"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200"
        } ${isCollapsed ? "justify-center" : "justify-between"}`}
        title={isCollapsed ? label : undefined}
      >
        <div
          className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}
        >
          <Icon
            size={20}
            className={`shrink-0 ${isActive ? "text-orange-600 dark:text-orange-500" : ""}`}
          />
          {!isCollapsed && <span>{label}</span>}
        </div>

        {!isCollapsed && hasSubmenu && (
          <div
            role="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onToggleExpand) onToggleExpand(e);
            }}
            className={`p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ${isExpanded ? "bg-zinc-100 dark:bg-zinc-800" : ""}`}
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isExpanded ? "rotate-180 text-zinc-900 dark:text-white" : "text-zinc-400"}`}
            />
          </div>
        )}

        {!isCollapsed && !hasSubmenu && badge && <>{badge}</>}
        {isCollapsed && badge && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-[#1a1a1a]" />
        )}
      </Link>

      {!isCollapsed && hasSubmenu && isExpanded && (
        <div className="mt-1 ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-800 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {recentHistory.map((item: any) => (
            <Link
              key={item.id}
              href={`/dashboard/history?runId=${item.id}`}
              className="w-full text-left px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors truncate flex items-center gap-2"
            >
              <MessageSquare size={12} className="shrink-0 opacity-50" />
              <span className="truncate">{item.title}</span>
            </Link>
          ))}
          <Link
            href="/dashboard/history"
            className="w-full text-left px-3 py-2 text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline mt-1 block"
          >
            View all history
          </Link>
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Mock history - in a real app, pass this as prop or fetch via SWR/React Query
  const recentHistory = [
    { id: "1", title: "Amazon Laptop Analysis" },
    { id: "2", title: "LinkedIn Outreach" },
    { id: "3", title: "Competitor Pricing" },
  ];

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signout();
    } catch (error) {
      console.error("Logout failed", error);
      setIsLoggingOut(false);
    }
  };

  const toggleTheme = () => {
    const current = localStorage.getItem("theme") || "light";
    const next = current === "light" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "SC";

  return (
    <aside
      className={`bg-white dark:bg-[#1a1a1a] border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-20 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] flex-shrink-0 ${isCollapsed ? "w-20" : "w-72"}`}
    >
      {/* Header */}
      <div
        className={`h-20 flex items-center border-b border-zinc-100 dark:border-zinc-800/50 ${isCollapsed ? "justify-center px-0" : "px-6"}`}
      >
        <Link
          href="/"
          className="flex items-center gap-3 text-zinc-900 dark:text-white cursor-pointer overflow-hidden whitespace-nowrap group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/30 transition-all">
            <Terminal size={20} strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl tracking-tight">Scrapter</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 overflow-y-auto flex-1 overflow-x-hidden custom-scrollbar">
        <div className="space-y-1">
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-3 mb-3 mt-2">
              <p className="text-xs font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
                Workspace
              </p>
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
            </div>
          ) : (
            <div className="flex justify-center mb-6 mt-2">
              <button
                onClick={() => setIsCollapsed(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          <NavItem
            view="overview"
            icon={LayoutDashboard}
            label="Overview"
            href="/dashboard"
            activePath={pathname}
            isCollapsed={isCollapsed}
          />

          <NavItem
            view="store"
            icon={Workflow}
            label="Playground"
            href="/dashboard/store"
            activePath={pathname}
            isCollapsed={isCollapsed}
            badge={
              <span className="text-[10px] font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-500/20">
                New
              </span>
            }
          />

          <NavItem
            view="history"
            icon={History}
            label="History"
            href="/dashboard/history"
            activePath={pathname}
            isCollapsed={isCollapsed}
            hasSubmenu={true}
            isExpanded={historyExpanded}
            onToggleExpand={() => setHistoryExpanded(!historyExpanded)}
            recentHistory={recentHistory}
          />

          <NavItem
            view="settings"
            icon={Settings}
            label="Configuration"
            href="/dashboard/settings"
            activePath={pathname}
            isCollapsed={isCollapsed}
          />
        </div>
      </nav>

      {/* User Profile Footer */}
      <div
        className="p-4 border-t border-zinc-200 dark:border-zinc-800"
        ref={userMenuRef}
      >
        <div className="relative">
          {/* User Button */}
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors ${isCollapsed ? "justify-center" : "justify-between"} group`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 border border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300 shadow-sm">
                {initials}
              </div>
              {!isCollapsed && (
                <div className="text-left">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate max-w-[120px]">
                    {user?.user_metadata?.full_name || "Guest User"}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-medium">
                    {user?.plan || "Free Plan"}
                  </p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronsUpDown size={14} className="text-zinc-400" />
            )}
          </button>

          {/* Popover Menu */}
          {userMenuOpen && (
            <div
              className={`absolute bottom-[calc(100%+12px)] left-0 w-full min-w-[240px] bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-black/50 p-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200 ${isCollapsed ? "left-10" : ""}`}
            >
              {!isCollapsed && (
                <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                  <p className="text-xs font-medium text-zinc-900 dark:text-white truncate">
                    {user?.email || "guest@scrapter.com"}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <Link href="/dashboard/billing">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                    <CreditCard size={16} />
                    Upgrade Plan
                  </button>
                </Link>
                <Link href="/dashboard/settings">
                  <button
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <User size={16} />
                    Profile Settings
                  </button>
                </Link>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <Sun size={16} className="dark:hidden" />
                  <Moon size={16} className="hidden dark:block" />
                  Switch Theme
                </button>
              </div>

              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2"></div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LogOut size={16} />
                )}
                {isLoggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
