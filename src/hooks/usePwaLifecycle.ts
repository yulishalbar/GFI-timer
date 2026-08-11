import { useCallback, useEffect, useRef, useState } from "react";
import { registerSW } from "virtual:pwa-register";

type UpdateServiceWorker = (reloadPage?: boolean) => Promise<void>;

export interface PwaLifecycle {
  applyUpdate: () => Promise<void>;
  dismissUpdate: () => void;
  isApplyingUpdate: boolean;
  isOfflineReady: boolean;
  isUpdateAvailable: boolean;
}

export function usePwaLifecycle(): PwaLifecycle {
  const updateServiceWorker = useRef<UpdateServiceWorker | null>(null);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(
    () => "serviceWorker" in navigator && navigator.serviceWorker.controller !== null
  );
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    updateServiceWorker.current = registerSW({
      immediate: true,
      onNeedRefresh: () => setIsUpdateAvailable(true),
      onOfflineReady: () => setIsOfflineReady(true),
      onRegisteredSW: (_scriptUrl, registration) => {
        if (registration?.active) {
          setIsOfflineReady(true);
        }
      },
      onRegisterError: (error: unknown) => {
        console.error("Service worker registration failed", error);
      }
    });

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.ready.then(() => setIsOfflineReady(true));
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    if (updateServiceWorker.current === null) {
      return;
    }
    setIsApplyingUpdate(true);
    try {
      await updateServiceWorker.current(true);
    } catch (error: unknown) {
      setIsApplyingUpdate(false);
      console.error("Service worker update failed", error);
    }
  }, []);

  return {
    applyUpdate,
    dismissUpdate: () => setIsUpdateAvailable(false),
    isApplyingUpdate,
    isOfflineReady,
    isUpdateAvailable
  };
}
