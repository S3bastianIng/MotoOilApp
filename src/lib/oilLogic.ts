export interface OilChangeEntry {
  id: string;
  /** ISO date string (YYYY-MM-DD). */
  date: string;
  /** Odometer reading in km at the time of the change. */
  km: number;
  /** Optional oil brand, e.g. "Motul". */
  brand?: string;
  /** Optional oil type/viscosity, e.g. "10W-40". */
  oilType?: string;
  oilFilterChanged: boolean;
  airFilterChanged: boolean;
}

export interface MaintenanceSettings {
  /** Km between oil changes. Default 2500. */
  oilInterval: number;
  /** Km between oil filter changes. Default 5000. */
  oilFilterKm: number;
  /** Km between air filter changes. Default 7500. */
  airFilterKm: number;
  /** Current odometer reading in km. */
  currentKm: number;
}

export const DEFAULT_SETTINGS: MaintenanceSettings = {
  oilInterval: 2500,
  oilFilterKm: 5000,
  airFilterKm: 7500,
  currentKm: 11500,
};

/** Example entry used to seed the app on first run. */
export const SEED_ENTRY: OilChangeEntry = {
  id: 'seed-1',
  date: '2026-09-01',
  km: 10000,
  brand: 'Motul',
  oilType: '10W-40',
  oilFilterChanged: true,
  airFilterChanged: false,
};

/**
 * How many oil changes make one oil filter change, derived from km intervals.
 * Default: round(5000 / 2500) = 2.
 */
export function oilFilterEveryN(settings: MaintenanceSettings): number {
  if (settings.oilInterval <= 0) return 2;
  return Math.max(1, Math.round(settings.oilFilterKm / settings.oilInterval));
}

/**
 * How many oil changes make one air filter change, derived from km intervals.
 * Default: round(7500 / 2500) = 3.
 */
export function airFilterEveryN(settings: MaintenanceSettings): number {
  if (settings.oilInterval <= 0) return 3;
  return Math.max(1, Math.round(settings.airFilterKm / settings.oilInterval));
}

/** Entries sorted ascending by km (oldest first). Assumes valid data. */
export function sortByKm(entries: OilChangeEntry[]): OilChangeEntry[] {
  return [...entries].sort((a, b) => a.km - b.km);
}

/** Km of the most recent oil change, or 0 when there is no history. */
export function lastChangeKm(entries: OilChangeEntry[]): number {
  if (entries.length === 0) return 0;
  return sortByKm(entries)[entries.length - 1].km;
}

/** Km of the next scheduled oil change. */
export function nextOilKm(entries: OilChangeEntry[], settings: MaintenanceSettings): number {
  return lastChangeKm(entries) + settings.oilInterval;
}

/** Km driven since the last oil change, based on the current odometer. */
export function kmSinceLastChange(entries: OilChangeEntry[], settings: MaintenanceSettings): number {
  return settings.currentKm - lastChangeKm(entries);
}

/** Km remaining until the next oil change (negative when overdue). */
export function kmRemaining(entries: OilChangeEntry[], settings: MaintenanceSettings): number {
  return nextOilKm(entries, settings) - settings.currentKm;
}

export type OilStatus = 'OK' | 'URGENT' | 'DUE';

/**
 * Overall oil status:
 * - DUE when remaining <= 0 (overdue)
 * - URGENT when remaining <= 300 km
 * - OK otherwise
 */
export function oilStatus(entries: OilChangeEntry[], settings: MaintenanceSettings): OilStatus {
  const remaining = kmRemaining(entries, settings);
  if (remaining <= 0) return 'DUE';
  if (remaining <= 300) return 'URGENT';
  return 'OK';
}

interface FilterProgress {
  /** Number of oil changes since the filter was last changed. */
  changesSince: number;
  /** Km driven since the filter was last changed (measured at last oil change). */
  kmSince: number;
}

function filterProgress(
  entries: OilChangeEntry[],
  flag: 'oilFilterChanged' | 'airFilterChanged',
): FilterProgress {
  const sorted = sortByKm(entries);
  if (sorted.length === 0) return { changesSince: 0, kmSince: 0 };
  let lastFlagIndex = -1;
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    if (sorted[i][flag]) {
      lastFlagIndex = i;
      break;
    }
  }
  if (lastFlagIndex === -1) {
    return {
      changesSince: sorted.length,
      kmSince: sorted[sorted.length - 1].km - sorted[0].km,
    };
  }
  return {
    changesSince: sorted.length - 1 - lastFlagIndex,
    kmSince: sorted[sorted.length - 1].km - sorted[lastFlagIndex].km,
  };
}

/**
 * Oil filter due on the NEXT oil change when
 * (changesSinceOilFilter + 1) >= oilFilterEveryN OR kmSinceOilFilter >= oilFilterKm.
 */
export function isOilFilterDueNext(
  entries: OilChangeEntry[],
  settings: MaintenanceSettings,
): boolean {
  const progress = filterProgress(entries, 'oilFilterChanged');
  return (
    progress.changesSince + 1 >= oilFilterEveryN(settings) ||
    progress.kmSince >= settings.oilFilterKm
  );
}

/**
 * Air filter due on the NEXT oil change when
 * (changesSinceAirFilter + 1) >= airFilterEveryN OR kmSinceAirFilter >= airFilterKm.
 */
export function isAirFilterDueNext(
  entries: OilChangeEntry[],
  settings: MaintenanceSettings,
): boolean {
  const progress = filterProgress(entries, 'airFilterChanged');
  return (
    progress.changesSince + 1 >= airFilterEveryN(settings) ||
    progress.kmSince >= settings.airFilterKm
  );
}

/** Build a new entry with an auto-generated date of today (YYYY-MM-DD). */
export function buildEntry(input: {
  km: number;
  brand?: string;
  oilType?: string;
  oilFilterChanged: boolean;
  airFilterChanged: boolean;
}): OilChangeEntry {
  const today = new Date().toISOString().slice(0, 10);
  const suffix = Date.now().toString(36);
  return {
    id: `entry-${suffix}`,
    date: today,
    km: input.km,
    brand: input.brand?.trim() ? input.brand.trim() : undefined,
    oilType: input.oilType?.trim() ? input.oilType.trim() : undefined,
    oilFilterChanged: input.oilFilterChanged,
    airFilterChanged: input.airFilterChanged,
  };
}
