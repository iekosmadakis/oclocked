import { STORAGE_KEYS, LEGACY_STORAGE_KEYS } from '../constants'

export interface Settings {
  use24h: boolean
  theme: 'light' | 'dark' | 'system'
}

const DEFAULTS: Settings = {
  use24h: true,
  theme: 'system',
}

let migrated = false

/** Migrates settings from legacy key to current key (one-time). */
function migrateFromLegacy(): void {
  if (migrated) return
  migrated = true
  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEYS.settings)
    if (legacy) {
      localStorage.setItem(STORAGE_KEYS.settings, legacy)
      localStorage.removeItem(LEGACY_STORAGE_KEYS.settings)
    }
  } catch {
    /* ignore */
  }
}

/** Returns user settings from localStorage, with defaults for missing values. */
export function getSettings(): Settings {
  try {
    migrateFromLegacy()
    const raw = localStorage.getItem(STORAGE_KEYS.settings)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw) as Partial<Settings>
    return { ...DEFAULTS, ...parsed }
  } catch {
    return { ...DEFAULTS }
  }
}

/** Persists user settings to localStorage. */
export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings))
}
