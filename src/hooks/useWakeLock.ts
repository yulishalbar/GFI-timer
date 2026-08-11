import { useEffect, useState } from "react";

type WakeLockStatus = "requesting" | "active" | "unavailable" | "released" | "error";

export function useWakeLock(active: boolean): WakeLockStatus {
  const supported = "wakeLock" in navigator;
  const [status, setStatus] = useState<WakeLockStatus>(
    supported ? "requesting" : "unavailable"
  );

  useEffect(() => {
    if (!active || !supported) {
      return undefined;
    }

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const requestWakeLock = async () => {
      if (document.visibilityState !== "visible" || sentinel?.released === false) {
        return;
      }
      setStatus("requesting");
      try {
        const requested = await navigator.wakeLock.request("screen");
        if (cancelled) {
          await requested.release();
          return;
        }
        sentinel = requested;
        setStatus("active");
        requested.addEventListener("release", () => {
          sentinel = null;
          if (!cancelled) {
            setStatus("released");
          }
        }, { once: true });
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    void requestWakeLock();

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (sentinel?.released === false) {
        void sentinel.release();
      }
    };
  }, [active, supported]);

  return active ? status : "released";
}
