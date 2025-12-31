"use client";

import React from "react";
import { firewallStore } from "@extension/storage";
import { Shield, Plus, X, Save, Loader2, Globe } from "lucide-react";

export const AgentFirewallSettings: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<"allow" | "deny">("allow");
  const [newUrl, setNewUrl] = React.useState("");
  const [allowList, setAllowList] = React.useState<string[]>([]);
  const [denyList, setDenyList] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const loadFirewall = async () => {
      setLoading(true);
      try {
        const f = await firewallStore.getFirewall();
        setAllowList(f.allowList || []);
        setDenyList(f.denyList || []);
      } catch (e) {
        console.error("Failed to load firewall settings", e);
      } finally {
        setLoading(false);
      }
    };
    loadFirewall();
  }, []);

  const addUrl = () => {
    if (!newUrl.trim()) return;
    if (activeTab === "allow") setAllowList([...allowList, newUrl]);
    else setDenyList([...denyList, newUrl]);
    setNewUrl("");
  };

  const removeUrl = (url: string) => {
    if (activeTab === "allow") setAllowList(allowList.filter((u) => u !== url));
    else setDenyList(denyList.filter((u) => u !== url));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await firewallStore.updateFirewall({
        allowList,
        denyList,
        enabled: true,
      });
      // Optional: Toast
    } catch (e) {
      console.error("Failed to save firewall settings", e);
    } finally {
      setTimeout(() => setSaving(false), 800);
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-zinc-400 text-sm animate-pulse">
        Loading firewall...
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Shield
                size={20}
                className="text-orange-600 dark:text-orange-500"
              />{" "}
              Network Firewall
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Control which domains the agent is permitted to interact with.
            </p>
          </div>

          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("allow")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "allow" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"}`}
            >
              Allow List
            </button>
            <button
              onClick={() => setActiveTab("deny")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "deny" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"}`}
            >
              Deny List
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Globe
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="e.g. *.example.com"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addUrl()}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-mono"
            />
          </div>
          <button
            onClick={addUrl}
            className="bg-zinc-900 dark:bg-white text-white dark:text-black px-4 rounded-xl hover:opacity-90 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[100px]">
          {(activeTab === "allow" ? allowList : denyList).map((url) => (
            <div
              key={url}
              className="flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 group hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
            >
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 font-mono">
                {url}
              </span>
              <button
                onClick={() => removeUrl(url)}
                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {(activeTab === "allow" ? allowList : denyList).length === 0 && (
            <div className="col-span-2 text-center py-8 text-sm text-zinc-400 italic">
              No rules defined for this list.
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-4 flex justify-end z-40">
        <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70 active:scale-95"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Save Firewall Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};
