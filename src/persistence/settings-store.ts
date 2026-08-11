import type { StoredSettingsV1 } from "./schema";
import { parseStoredSettings } from "./schema";

export const SETTINGS_STORAGE_KEY = "gfi-timer:settings:v1";
export const DEFAULT_SETTINGS: StoredSettingsV1 = {
  version: 1,
  soundEnabled: true,
  expandedDescriptions: true
};

type StorageAccess = Pick<Storage, "getItem" | "setItem">;

export function loadStoredSettings(storage: StorageAccess = window.localStorage): StoredSettingsV1 {
  try {
    const serialized = storage.getItem(SETTINGS_STORAGE_KEY);
    if (serialized === null) {
      return DEFAULT_SETTINGS;
    }
    return parseStoredSettings(JSON.parse(serialized) as unknown) ?? DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(
  settings: StoredSettingsV1,
  storage: StorageAccess = window.localStorage
): boolean {
  try {
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}
