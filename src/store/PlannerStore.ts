import { STORAGE_KEYS } from '../constants'

/** Returns the list of timezone IDs saved in the meeting planner. */
export function getPlannerTimezones(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.planner)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/** Persists the planner timezone list to localStorage. */
export function savePlannerTimezones(ids: string[]): void {
  localStorage.setItem(STORAGE_KEYS.planner, JSON.stringify(ids))
}
