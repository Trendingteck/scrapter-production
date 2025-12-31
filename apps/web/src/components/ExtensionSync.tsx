"use client";

import { Button } from "@extension/ui";
import {
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useExtensionSync } from "@/hooks/useExtensionSync";

export function ExtensionSync({ sessionToken }: { sessionToken: string }) {
  const { status, retry, extensionId } = useExtensionSync(sessionToken);

  if (status === "connected") {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-800">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Extension Synced</span>
      </div>
    );
  }

  if (status === "checking") {
    return <div className="text-xs text-zinc-400">Checking extension...</div>;
  }

  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-400">
            Extension disconnected
          </h4>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            window.open(
              `https://chrome.google.com/webstore/detail/${extensionId}`,
            )
          }
          className="h-7 text-xs bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50"
        >
          <ExternalLink className="w-3 h-3 mr-1.5" /> Install
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={retry}
          className="h-7 text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
