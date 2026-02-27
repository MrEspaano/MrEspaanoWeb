"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const register = async () => {
        try {
          await navigator.serviceWorker.register("/sw.js");
        } catch {
          // Silent fail keeps app usable when SW registration is blocked.
        }
      };

      void register();
    }
  }, []);

  return null;
}
