import { describe, expect, it } from "vitest";
import { parseStoredSession, parseStoredSettings } from "./schema";
import {
  LEGACY_SESSION_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  clearStoredSession,
  loadStoredSession,
  restoreTimerState,
  saveStoredSession
} from "./session-store";
import { compileClass } from "../domain/compile-class";

const validRunningSession = {
  version: 1,
  classId: "mat-pilates-07-24",
  classVersion: 1,
  startedAtEpochMs: 1_000,
  elapsedMsFloor: 500,
  status: "running",
  stepIndex: 2,
  targetEndEpochMs: 8_000,
  savedAtEpochMs: 1_500
};

describe("persistence schema", () => {
  it("accepts valid versioned settings and session variants", () => {
    expect(
      parseStoredSettings({ version: 1, soundEnabled: true, expandedDescriptions: false })
    ).not.toBeNull();
    expect(parseStoredSession(validRunningSession)).not.toBeNull();
    expect(
      parseStoredSession({
        ...validRunningSession,
        version: 2,
        stepDurationMs: 12_000
      })
    ).not.toBeNull();
    expect(
      parseStoredSession({
        ...validRunningSession,
        status: "paused",
        remainingMs: 3_000,
        targetEndEpochMs: undefined
      })
    ).toBeNull();
    const base = { ...validRunningSession } as Record<string, unknown>;
    delete base.targetEndEpochMs;
    expect(parseStoredSession({ ...base, status: "paused", remainingMs: 3_000 })).not.toBeNull();
  });

  it("rejects unknown versions, fields, invalid JSON values, and malformed numbers", () => {
    expect(parseStoredSettings({ version: 2, soundEnabled: true, expandedDescriptions: false })).toBeNull();
    expect(parseStoredSettings({ ...validRunningSession })).toBeNull();
    expect(parseStoredSession({ ...validRunningSession, stepIndex: -1 })).toBeNull();
    expect(parseStoredSession({ ...validRunningSession, elapsedMsFloor: Number.NaN })).toBeNull();
    expect(parseStoredSession({ ...validRunningSession, extra: true })).toBeNull();
  });

  it("restores paused state exactly and reconciles a delayed running session", () => {
    const timeline = compileClass({
      schemaVersion: 1,
      id: "recovery-test",
      version: 1,
      title: "Recovery test",
      phases: [{
        id: "main",
        name: "Main",
        items: [
          { type: "exercise", id: "one", name: "One", durationSeconds: 5 },
          { type: "exercise", id: "two", name: "Two", durationSeconds: 5 }
        ]
      }]
    });
    const running = parseStoredSession({
      ...validRunningSession,
      classId: "recovery-test",
      stepIndex: 0,
      targetEndEpochMs: 2_000
    });
    expect(running).not.toBeNull();
    if (running !== null) {
      expect(restoreTimerState(running, timeline.steps, 4_000)).toEqual({
        status: "running",
        stepIndex: 1,
        targetEndEpochMs: 7_000,
        stepDurationMs: 5_000
      });
    }
  });

  it("restores adjusted paused time and migrates reads away from the legacy key", () => {
    const timeline = compileClass({
      schemaVersion: 1,
      id: "recovery-test",
      version: 1,
      title: "Recovery test",
      phases: [
        {
          id: "main",
          name: "Main",
          items: [{ type: "exercise", id: "one", name: "One", durationSeconds: 5 }]
        }
      ]
    });
    const adjusted = parseStoredSession({
      version: 2,
      classId: "recovery-test",
      classVersion: 1,
      startedAtEpochMs: 1_000,
      elapsedMsFloor: 2_000,
      status: "paused",
      stepIndex: 0,
      stepDurationMs: 15_000,
      remainingMs: 13_000,
      savedAtEpochMs: 3_000
    });
    expect(adjusted).not.toBeNull();
    if (adjusted !== null) {
      expect(restoreTimerState(adjusted, timeline.steps, 20_000)).toEqual({
        status: "paused",
        stepIndex: 0,
        remainingMs: 13_000,
        stepDurationMs: 15_000
      });
    }

    const values = new Map<string, string>([
      [LEGACY_SESSION_STORAGE_KEY, JSON.stringify(validRunningSession)]
    ]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key)
    };
    expect(loadStoredSession(storage).status).toBe("valid");
    expect(
      saveStoredSession(
        {
          version: 2,
          classId: "recovery-test",
          classVersion: 1,
          startedAtEpochMs: 1_000,
          elapsedMsFloor: 2_000,
          status: "paused",
          stepIndex: 0,
          stepDurationMs: 15_000,
          remainingMs: 13_000,
          savedAtEpochMs: 3_000
        },
        storage
      )
    ).toBe(true);
    expect(values.has(SESSION_STORAGE_KEY)).toBe(true);
    clearStoredSession(storage);
    expect(values.size).toBe(0);
  });
});
