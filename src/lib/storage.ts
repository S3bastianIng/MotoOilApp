import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_SETTINGS,
  MaintenanceSettings,
  OilChangeEntry,
  SEED_ENTRY,
} from './oilLogic';

const ENTRIES_KEY = '@motooil/entries';
const SETTINGS_KEY = '@motooil/settings';

function isValidEntry(value: unknown): value is OilChangeEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.date === 'string' &&
    typeof entry.km === 'number' &&
    Number.isFinite(entry.km) &&
    typeof entry.oilFilterChanged === 'boolean' &&
    typeof entry.airFilterChanged === 'boolean'
  );
}

function isValidSettings(value: unknown): value is MaintenanceSettings {
  if (typeof value !== 'object' || value === null) return false;
  const settings = value as Record<string, unknown>;
  return (
    typeof settings.oilInterval === 'number' &&
    typeof settings.oilFilterKm === 'number' &&
    typeof settings.airFilterKm === 'number' &&
    typeof settings.currentKm === 'number' &&
    Number.isFinite(settings.oilInterval) &&
    Number.isFinite(settings.oilFilterKm) &&
    Number.isFinite(settings.airFilterKm) &&
    Number.isFinite(settings.currentKm) &&
    settings.oilInterval > 0 &&
    settings.oilFilterKm > 0 &&
    settings.airFilterKm > 0 &&
    settings.currentKm >= 0
  );
}

function sanitizeSettings(raw: unknown): MaintenanceSettings {
  if (isValidSettings(raw)) return raw;
  if (typeof raw === 'object' && raw !== null) {
    const partial = raw as Partial<MaintenanceSettings>;
    return {
      oilInterval:
        typeof partial.oilInterval === 'number' && partial.oilInterval > 0
          ? partial.oilInterval
          : DEFAULT_SETTINGS.oilInterval,
      oilFilterKm:
        typeof partial.oilFilterKm === 'number' && partial.oilFilterKm > 0
          ? partial.oilFilterKm
          : DEFAULT_SETTINGS.oilFilterKm,
      airFilterKm:
        typeof partial.airFilterKm === 'number' && partial.airFilterKm > 0
          ? partial.airFilterKm
          : DEFAULT_SETTINGS.airFilterKm,
      currentKm:
        typeof partial.currentKm === 'number' && partial.currentKm >= 0
          ? partial.currentKm
          : DEFAULT_SETTINGS.currentKm,
    };
  }
  return { ...DEFAULT_SETTINGS };
}

/** Load entries, seeding one example entry on first run. */
export async function loadEntries(): Promise<OilChangeEntry[]> {
  const raw = await AsyncStorage.getItem(ENTRIES_KEY);
  if (raw === null) {
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify([SEED_ENTRY]));
    return [SEED_ENTRY];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [SEED_ENTRY];
    const valid = parsed.filter(isValidEntry);
    return valid;
  } catch {
    return [SEED_ENTRY];
  }
}

/** Load settings, falling back to defaults on first run or corrupt data. */
export async function loadSettings(): Promise<MaintenanceSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (raw === null) {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return { ...DEFAULT_SETTINGS };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return sanitizeSettings(parsed);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveEntries(entries: OilChangeEntry[]): Promise<void> {
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export async function saveSettings(settings: MaintenanceSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
