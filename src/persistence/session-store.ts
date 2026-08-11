import type { StoredSession, StoredSessionV2 } from "./schema";
import { parseStoredSession } from "./schema";
import type { RuntimeStep } from "../domain/timeline";
import {
  MAX_STEP_EXTENSION_MS,
  reconcileTimer,
  type TimerState
} from "../domain/timer-state";

export const SESSION_STORAGE_KEY = "gfi-timer:session:v2";
export const LEGACY_SESSION_STORAGE_KEY = "gfi-timer:session:v1";

export type StoredSessionReadResult =
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "valid"; session: StoredSession };

type StorageAccess = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function loadStoredSession(storage: StorageAccess = window.localStorage): StoredSessionReadResult {
  try {
    const serialized =
      storage.getItem(SESSION_STORAGE_KEY) ?? storage.getItem(LEGACY_SESSION_STORAGE_KEY);
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
  session: StoredSessionV2,
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
    storage.removeItem(LEGACY_SESSION_STORAGE_KEY);
  } catch {
    // Storage denial must not prevent an active timer from running.
  }
}

export function restoreTimerState(
  session: StoredSession,
  steps: readonly RuntimeStep[],
  nowEpochMs: number
): TimerState | null {
  if (steps[session.stepIndex] === undefined) {
    return null;
  }
  const authoredDurationMs = steps[session.stepIndex]?.durationMs ?? 0;
  const legacyRemainingMs =
    session.status === "paused"
      ? session.remainingMs
      : Math.max(0, session.targetEndEpochMs - nowEpochMs);
  const stepDurationMs =
    session.version === 2
      ? session.stepDurationMs
      : Math.max(authoredDurationMs, legacyRemainingMs);
  if (
    stepDurationMs <= 0 ||
    stepDurationMs > authoredDurationMs + MAX_STEP_EXTENSION_MS ||
    legacyRemainingMs > stepDurationMs
  ) {
    return null;
  }
  if (session.status === "paused") {
    return {
      status: "paused",
      stepIndex: session.stepIndex,
      remainingMs: session.remainingMs,
      stepDurationMs
    };
  }
  return reconcileTimer(
    {
      status: "running",
      stepIndex: session.stepIndex,
      targetEndEpochMs: session.targetEndEpochMs,
      stepDurationMs
    },
    steps,
    nowEpochMs
  );
}
