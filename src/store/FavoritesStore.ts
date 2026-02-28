import { STORAGE_KEYS, LEGACY_STORAGE_KEYS } from '../constants'

let migrated = false

/** Migrates data from legacy key to current key (one-time). */
function migrateFromLegacy(): void {
  if (migrated) return
  migrated = true
  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEYS.favorites)
    if (legacy) {
      localStorage.setItem(STORAGE_KEYS.favorites, legacy)
      localStorage.removeItem(LEGACY_STORAGE_KEYS.favorites)
    }
  } catch {
    /* ignore */
  }
}

/** Returns the list of favorited timezone IDs from localStorage. */
export function getFavorites(): string[] {
  try {
    migrateFromLegacy()
    const raw = localStorage.getItem(STORAGE_KEYS.favorites)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/** Adds a timezone ID to favorites. */
export function addFavorite(id: string): void {
  const favs = getFavorites()
  if (!favs.includes(id)) {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify([...favs, id]))
  }
}

/** Removes a timezone ID from favorites. */
export function removeFavorite(id: string): void {
  const favs = getFavorites().filter((f) => f !== id)
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favs))
}

/** Returns true if the timezone ID is in favorites. */
export function isFavorite(id: string): boolean {
  return getFavorites().includes(id)
}

/** Toggles a timezone ID in favorites. */
export function toggleFavorite(id: string): void {
  if (isFavorite(id)) removeFavorite(id)
  else addFavorite(id)
}
