"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Cpu,
  Key,
  Sparkles,
  Bot,
  AlertTriangle,
  Save,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { usePersistedState } from "@/hooks/usePersistedState";
import {
  agentModelStore,
  llmProviderStore,
  AgentNameEnum,
  ProviderTypeEnum,
  MANAGED_MODELS,
  MANAGED_MODEL_IDS,
} from "@extension/storage";

// --- Icons ---
const ProviderIcons: Record<string, React.ReactNode> = {
  openai: (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6 fill-current text-zinc-900 dark:text-white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464z" />
    </svg>
  ),
  anthropic: (
    <svg
      viewBox="0 0 92.2 65"
      className="w-6 h-6 fill-current text-zinc-900 dark:text-white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M66.5,0H52.4l25.7,65h14.1L66.5,0z M25.7,0L0,65h14.4l5.3-13.6h26.9L51.8,65h14.4L40.5,0C40.5,0,25.7,0,25.7,0z M24.3,39.3l8.8-22.8l8.8,22.8H24.3z" />
    </svg>
  ),
  gemini: (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 24c0-6.627-5.373-12-12-12 6.627 0 12-5.373 12-12 0 6.627 5.373 12 12 12-6.627 0-12 5.373-12 12z"
        fill="url(#gemini-gradient)"
      />
      <defs>
        <linearGradient id="gemini-gradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#4E87F6" />
          <stop offset="100%" stopColor="#DE5C59" />
        </linearGradient>
      </defs>
    </svg>
  ),
};

interface ModelOption {
  label: string;
  value: string;
  provider: string;
}

interface ProviderConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  isExpanded: boolean;
  apiKey: string;
  availableModels: string[];
  activeModels: string[];
}

const CustomModelSelect = ({
  value,
  onChange,
  options,
  disabled = false,
}: {
  value: string;
  onChange: (val: string) => void;
  options: ModelOption[];
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || {
    label: value,
    value,
    provider: "Custom",
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between bg-white dark:bg-zinc-900 border rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none transition-all ${
          disabled
            ? "opacity-50 cursor-not-allowed border-zinc-200 dark:border-zinc-800"
            : "border-zinc-200 dark:border-zinc-700 hover:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span
            className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
              selectedOption?.provider === "scrapter"
                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 border-orange-200 dark:border-orange-800"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"
            }`}
          >
            {selectedOption?.provider === "scrapter"
              ? "PRO"
              : selectedOption?.provider || "Custom"}
          </span>
          <span className="font-medium truncate">
            {selectedOption?.label || value}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl shadow-orange-500/5 z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 p-1">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${value === opt.value ? "bg-orange-50 dark:bg-orange-500/10" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span
                  className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    opt.provider === "scrapter"
                      ? "text-orange-600 bg-orange-100 dark:bg-orange-900/20"
                      : "text-zinc-500 bg-zinc-100 dark:bg-zinc-800"
                  }`}
                >
                  {opt.provider === "scrapter" ? "PRO" : opt.provider}
                </span>
                <span
                  className={`text-sm ${value === opt.value ? "font-semibold text-orange-700 dark:text-orange-400" : "text-zinc-700 dark:text-zinc-300"}`}
                >
                  {opt.label}
                </span>
              </div>
              {value === opt.value && (
                <Check
                  size={14}
                  className="text-orange-600 dark:text-orange-500"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AgentModelSettings: React.FC = () => {
  const [gatewayMode, setGatewayMode] = usePersistedState<"managed" | "custom">(
    "settings-gateway-mode",
    "managed",
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeModel, setActiveModel] = usePersistedState<string>(
    "settings-active-model",
    MANAGED_MODEL_IDS.AUTO,
  );

  const [providers, setProviders] = useState<ProviderConfig[]>([
    {
      id: "openai",
      name: "OpenAI",
      icon: ProviderIcons.openai,
      enabled: false,
      isExpanded: false,
      apiKey: "",
      availableModels: ["gpt-4o", "gpt-4o-mini"],
      activeModels: [],
    },
    {
      id: "anthropic",
      name: "Anthropic",
      icon: ProviderIcons.anthropic,
      enabled: false,
      isExpanded: false,
      apiKey: "",
      availableModels: ["claude-3-5-sonnet-20240620"],
      activeModels: [],
    },
    {
      id: "gemini",
      name: "Google",
      icon: ProviderIcons.gemini,
      enabled: false,
      isExpanded: false,
      apiKey: "",
      availableModels: ["gemini-2.0-flash-exp", "gemini-1.5-pro"],
      activeModels: [],
    },
  ]);

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 1. Load Agent Model Configuration
        const modelConfig = await agentModelStore.getAgentModel(
          AgentNameEnum.Agent,
        );

        if (modelConfig) {
          setActiveModel(modelConfig.modelName);
          // Decide gateway mode based on whether the provider is 'scrapter' or 'custom'
          setGatewayMode(
            modelConfig.provider === "scrapter" ? "managed" : "custom",
          );
        } else {
          // Default for new users
          setActiveModel(MANAGED_MODEL_IDS.AUTO);
          setGatewayMode("managed");
          // Persist default immediately to avoid transient states
          await agentModelStore.setAgentModel(AgentNameEnum.Agent, {
            provider: "scrapter",
            modelName: MANAGED_MODEL_IDS.AUTO,
          });
        }

        // 2. Load Provider Keys
        const storedProviders = await llmProviderStore.getAllProviders();
        setProviders((prev) =>
          prev.map((p) => ({
            ...p,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiKey: (storedProviders[p.id] as any)?.apiKey || "",
            enabled: !!(storedProviders[p.id] as any)?.apiKey,
            activeModels: p.availableModels,
          })),
        );
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleProviderExpand = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isExpanded: !p.isExpanded } : p)),
    );
  };

  const updateProviderKey = (id: string, key: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, apiKey: key, enabled: !!key } : p,
      ),
    );
  };

  const toggleKeyVis = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getAvailableModels = (): ModelOption[] => {
    if (gatewayMode === "managed") {
      return MANAGED_MODELS.map((m) => ({
        label: m.label,
        value: m.id,
        provider: m.provider,
      }));
    }
    return providers.flatMap((p) =>
      p.activeModels.map((model) => ({
        label: model,
        value: model,
        provider: p.name,
      })),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Save Keys first
      for (const p of providers) {
        if (p.apiKey) {
          await llmProviderStore.updateProvider(p.id as ProviderTypeEnum, {
            apiKey: p.apiKey,
          });
        }
      }

      // 2. Determine correct provider ID based on mode
      let providerId = "scrapter";

      if (gatewayMode === "custom") {
        // Find which provider belongs to the activeModel string
        const prov = providers.find((p) =>
          p.activeModels.includes(activeModel),
        );
        if (prov) {
          providerId = prov.id;
        } else {
          // Fallback if something weird happens in custom mode
          providerId = "gemini";
        }
      }

      // 3. Save Agent Config
      await agentModelStore.setAgentModel(AgentNameEnum.Agent, {
        provider: providerId as any,
        modelName: activeModel,
        parameters: { temperature: 0.7 },
      });

      console.log("Saved config:", { providerId, activeModel });
    } catch (e) {
      console.error("Failed to save settings", e);
    } finally {
      setTimeout(() => setSaving(false), 600);
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-zinc-400 animate-pulse">
        Loading configuration...
      </div>
    );

  const currentModelOptions = getAvailableModels();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* 1. Core Agent Settings */}
      <section className="bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-500 rounded-xl">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Active Agent Model
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              The brain powering your Scrapter agent.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <CustomModelSelect
              value={activeModel}
              onChange={(val) => setActiveModel(val)}
              options={currentModelOptions}
            />
            {gatewayMode === "managed" && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                <Sparkles size={14} className="text-blue-500 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  <strong>Recommendation:</strong>{" "}
                  {activeModel === MANAGED_MODEL_IDS.AUTO
                    ? "Scrapter Auto (Gemini 2.5) is optimized for speed."
                    : "Scrapter Best (Gemini 3.0) is optimized for complex reasoning."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Provider Settings */}
      <section className="bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Lock size={18} className="text-zinc-500" /> Gateway
                Configuration
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Choose between our managed gateway or your own API keys.
              </p>
            </div>

            <div className="flex bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl self-start">
              <button
                onClick={() => {
                  setGatewayMode("managed");
                  setActiveModel(MANAGED_MODEL_IDS.AUTO);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${gatewayMode === "managed" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"}`}
              >
                Managed
              </button>
              <button
                onClick={() => setGatewayMode("custom")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${gatewayMode === "custom" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"}`}
              >
                Custom (BYOK)
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {gatewayMode === "managed" ? (
            <div className="text-center py-12 px-6 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600 dark:text-orange-500">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                Scrapter Managed Gateway
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
                We handle API keys and rate limits. Usage consumes your monthly
                credits.
                <br />
                Current default: <strong>Scrapter Auto</strong>.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 uppercase font-bold tracking-wider px-2">
                Provider Configuration
              </p>
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className={`border rounded-xl transition-all duration-200 overflow-hidden ${provider.apiKey ? "border-orange-200 dark:border-orange-900/30 bg-orange-50/10" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a]"}`}
                >
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    onClick={() => toggleProviderExpand(provider.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`text-zinc-400 transition-transform duration-200 ${provider.isExpanded ? "rotate-90" : ""}`}
                      >
                        <ChevronRight size={16} />
                      </div>
                      {provider.icon}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-900 dark:text-white">
                            {provider.name}
                          </span>
                          {provider.apiKey && (
                            <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <Check size={8} /> KEY SET
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {provider.isExpanded && (
                    <div className="px-4 pb-6 pt-2 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20">
                      <div className="mb-2">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                          API Secret Key
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key size={14} className="text-zinc-400" />
                          </div>
                          <input
                            type={showKeys[provider.id] ? "text" : "password"}
                            placeholder={`sk-...`}
                            value={provider.apiKey}
                            onChange={(e) =>
                              updateProviderKey(provider.id, e.target.value)
                            }
                            className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-zinc-400"
                          />
                          <button
                            onClick={() => toggleKeyVis(provider.id)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
                          >
                            {showKeys[provider.id] ? (
                              <EyeOff size={14} />
                            ) : (
                              <Eye size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Save Button */}
      <div className="sticky bottom-4 flex justify-end z-40">
        <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70 active:scale-95"
          >
            {saving ? (
              <Sparkles className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
};
