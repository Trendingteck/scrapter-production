import { useState, useEffect } from "react";

const EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID;

type SyncStatus = "checking" | "connected" | "missing";

export function useExtensionSync(sessionToken: string | undefined) {
  const [status, setStatus] = useState<SyncStatus>("checking");

  const sync = () => {
    if (!EXTENSION_ID || !sessionToken) {
      setStatus("missing");
      return;
    }

    // @ts-ignore - Chrome API check
    if (
      typeof window !== "undefined" &&
      window.chrome &&
      window.chrome.runtime
    ) {
      try {
        // @ts-ignore
        window.chrome.runtime.sendMessage(
          EXTENSION_ID,
          { type: "AUTH_SYNC", token: sessionToken },
          // @ts-ignore
          (response) => {
            // @ts-ignore
            if (window.chrome.runtime.lastError || !response?.success) {
              setStatus("missing");
            } else {
              setStatus("connected");
            }
          },
        );
      } catch (e) {
        setStatus("missing");
      }
    } else {
      setStatus("missing");
    }
  };

  useEffect(() => {
    sync();
  }, [sessionToken]);

  return { status, retry: sync, extensionId: EXTENSION_ID };
}
