"use client";

import React from "react";
import { generalSettingsStore } from "@extension/storage";
import { Save, Loader2, Settings2 } from "lucide-react";

const InputRow = ({
  label,
  desc,
  children,
}: {
  label: string;
  desc: string;
  children?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
    <div className="max-w-[70%]">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
        {label}
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
        {desc}
      </p>
    </div>
    {children}
  </div>
);

export const AgentGeneralSettings: React.FC = () => {
  const [settings, setSettings] = React.useState({
    maxSteps: 20,
    maxActionsPerStep: 5,
    maxFailures: 3,
    useVision: true,
    displayHighlights: true,
    planningInterval: 1,
    minWaitPageLoad: 1000,
    replayHistoricalTasks: false,
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  React.useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const s = await generalSettingsStore.getSettings();
        setSettings({
          maxSteps: s.maxSteps,
          maxActionsPerStep: s.maxActionsPerStep,
          maxFailures: s.maxFailures,
          useVision: s.useVision,
          displayHighlights: s.displayHighlights,
          planningInterval: s.planningInterval,
          minWaitPageLoad: s.minWaitPageLoad,
          replayHistoricalTasks: s.replayHistoricalTasks || false,
        });
      } catch (e) {
        console.error("Failed to load general settings", e);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Auto-save on toggle for better UX, except for numbers where user might be typing
    if (typeof value === "boolean") {
      try {
        await generalSettingsStore.updateSettings(newSettings);
      } catch (e) {
        console.error("Failed to auto-save setting", e);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await generalSettingsStore.updateSettings(settings);
      // Show brief success state
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error("Failed to save general settings", e);
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-zinc-400 text-sm animate-pulse">
        Loading settings...
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-lg text-orange-600 dark:text-orange-500">
            <Settings2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Execution Parameters
            </h2>
            <p className="text-xs text-zinc-500">
              Fine-tune how the agent interacts with web pages.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <InputRow
            label="Max Steps"
            desc="Maximum number of reasoning steps the agent can take per task."
          >
            <input
              type="number"
              value={settings.maxSteps}
              onChange={(e) =>
                handleChange("maxSteps", parseInt(e.target.value))
              }
              className="w-24 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </InputRow>

          <InputRow
            label="Max Actions per Step"
            desc="Limit atomic actions in a single planning cycle to prevent loops."
          >
            <input
              type="number"
              value={settings.maxActionsPerStep}
              onChange={(e) =>
                handleChange("maxActionsPerStep", parseInt(e.target.value))
              }
              className="w-24 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </InputRow>

          <InputRow
            label="Failure Tolerance"
            desc="Stop task automatically after this many consecutive failures."
          >
            <input
              type="number"
              value={settings.maxFailures}
              onChange={(e) =>
                handleChange("maxFailures", parseInt(e.target.value))
              }
              className="w-24 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </InputRow>

          <InputRow
            label="Enable Vision"
            desc="Allow agent to 'see' page screenshots. Improves accuracy but uses more tokens."
          >
            <button
              onClick={() => handleChange("useVision", !settings.useVision)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${settings.useVision ? "bg-orange-500" : "bg-zinc-200 dark:bg-zinc-700"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${settings.useVision ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </InputRow>

          <InputRow
            label="Display Highlights"
            desc="Draw bounding boxes around interacting elements in the browser view."
          >
            <button
              onClick={() =>
                handleChange("displayHighlights", !settings.displayHighlights)
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${settings.displayHighlights ? "bg-orange-500" : "bg-zinc-200 dark:bg-zinc-700"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${settings.displayHighlights ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </InputRow>

          <InputRow
            label="Replay History"
            desc="Store task history for later playback and debugging."
          >
            <button
              onClick={() =>
                handleChange(
                  "replayHistoricalTasks",
                  !settings.replayHistoricalTasks,
                )
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${settings.replayHistoricalTasks ? "bg-orange-500" : "bg-zinc-200 dark:bg-zinc-700"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${settings.replayHistoricalTasks ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </InputRow>

          <InputRow
            label="Page Load Wait (ms)"
            desc="Minimum time to wait after navigation events."
          >
            <input
              type="number"
              value={settings.minWaitPageLoad}
              onChange={(e) =>
                handleChange("minWaitPageLoad", parseInt(e.target.value))
              }
              step={50}
              className="w-24 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </InputRow>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          id="save-settings-btn"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70 active:scale-95"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          {saving
            ? "Saving Changes..."
            : saveSuccess
              ? "Saved Successfully!"
              : "Save General Settings"}
        </button>
      </div>
    </div>
  );
};
