export interface StoredSettingsV1 {
  version: 1;
  soundEnabled: boolean;
  expandedDescriptions: boolean;
}

interface StoredSessionBaseV1 {
  version: 1;
  classId: string;
  classVersion: number;
  startedAtEpochMs: number;
  elapsedMsFloor: number;
  stepIndex: number;
  savedAtEpochMs: number;
}

export type StoredSessionV1 =
  | (StoredSessionBaseV1 & {
      status: "running";
      targetEndEpochMs: number;
    })
  | (StoredSessionBaseV1 & {
      status: "paused";
      remainingMs: number;
    });

interface StoredSessionBaseV2 {
  version: 2;
  classId: string;
  classVersion: number;
  startedAtEpochMs: number;
  elapsedMsFloor: number;
  stepIndex: number;
  stepDurationMs: number;
  savedAtEpochMs: number;
}

export type StoredSessionV2 =
  | (StoredSessionBaseV2 & {
      status: "running";
      targetEndEpochMs: number;
    })
  | (StoredSessionBaseV2 & {
      status: "paused";
      remainingMs: number;
    });

export type StoredSession = StoredSessionV1 | StoredSessionV2;

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegativeFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function hasExactKeys(value: RecordValue, keys: readonly string[]): boolean {
  const actualKeys = Object.keys(value).sort();
  return (
    actualKeys.length === keys.length &&
    [...keys].sort().every((key, index) => key === actualKeys[index])
  );
}

export function parseStoredSettings(value: unknown): StoredSettingsV1 | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["version", "soundEnabled", "expandedDescriptions"]) ||
    value.version !== 1 ||
    typeof value.soundEnabled !== "boolean" ||
    typeof value.expandedDescriptions !== "boolean"
  ) {
    return null;
  }
  return value as unknown as StoredSettingsV1;
}

export function parseStoredSession(value: unknown): StoredSession | null {
  if (!isRecord(value) || (value.version !== 1 && value.version !== 2)) {
    return null;
  }

  const commonKeys = [
    "version",
    "classId",
    "classVersion",
    "startedAtEpochMs",
    "elapsedMsFloor",
    "status",
    "stepIndex",
    "savedAtEpochMs"
  ];
  const statusKey = value.status === "running" ? "targetEndEpochMs" : "remainingMs";
  const versionKeys = value.version === 2 ? ["stepDurationMs"] : [];
  if (
    (value.status !== "running" && value.status !== "paused") ||
    !hasExactKeys(value, [...commonKeys, ...versionKeys, statusKey]) ||
    typeof value.classId !== "string" ||
    value.classId.length === 0 ||
    !Number.isInteger(value.classVersion) ||
    typeof value.classVersion !== "number" ||
    value.classVersion <= 0 ||
    !isNonNegativeFiniteNumber(value.startedAtEpochMs) ||
    !isNonNegativeFiniteNumber(value.elapsedMsFloor) ||
    !Number.isInteger(value.stepIndex) ||
    typeof value.stepIndex !== "number" ||
    value.stepIndex < 0 ||
    (value.version === 2 &&
      (!isNonNegativeFiniteNumber(value.stepDurationMs) || value.stepDurationMs === 0)) ||
    !isNonNegativeFiniteNumber(value.savedAtEpochMs) ||
    !isNonNegativeFiniteNumber(value[statusKey])
  ) {
    return null;
  }

  return value as unknown as StoredSession;
}
