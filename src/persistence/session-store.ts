import type { StoredSessionV1 } from "./schema";
import { parseStoredSession } from "./schema";
import type { RuntimeStep } from "../domain/timeline";
import { reconcileTimer, type TimerState } from "../domain/timer-state";

export const SESSION_STORAGE_KEY = "gfi-timer:session:v1";

export type StoredSessionReadResult =
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "valid"; session: StoredSessionV1 };

type StorageAccess = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function loadStoredSession(storage: StorageAccess = window.localStorage): StoredSessionReadResult {
  try {
    const serialized = storage.getItem(SESSION_STORAGE_KEY);
    if (serialized === null) {
      return { status: "empty" };
    }
    const session = parseStoredSession(JSON.parse(serialized) as unknown);
    return session === null ? { status: "invalid" } : { status: "valid", session };
  } catch {
    return { status: "invalid" };
  }
}

export function saveStoredSession(
  session: StoredSessionV1,
  storage: StorageAccess = window.localStorage
): boolean {
  try {
    storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function clearStoredSession(storage: StorageAccess = window.localStorage): void {
  try {
    storage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Storage denial must not prevent an active timer from running.
  }
}

export function restoreTimerState(
  session: StoredSessionV1,
  steps: readonly RuntimeStep[],
  nowEpochMs: number
): TimerState | null {
  if (steps[session.stepIndex] === undefined) {
    return null;
  }
  if (session.status === "paused") {
    const durationMs = steps[session.stepIndex]?.durationMs ?? 0;
    if (session.remainingMs > durationMs) {
      return null;
    }
    return {
      status: "paused",
      stepIndex: session.stepIndex,
      remainingMs: session.remainingMs
    };
  }
  return reconcileTimer(
    {
      status: "running",
      stepIndex: session.stepIndex,
      targetEndEpochMs: session.targetEndEpochMs
    },
    steps,
    nowEpochMs
  );
}
