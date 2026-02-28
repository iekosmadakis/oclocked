import { formatInTimeZone, getTimezoneOffset, toZonedTime } from 'date-fns-tz'
import { ALL_TIMEZONES } from '../data/popularTimezones'

export type SortOption = 'default' | 'alphabetical'

/** Deprecated IANA IDs mapped to canonical equivalents. */
const TIMEZONE_ALIASES: Record<string, string> = {
  'Asia/Beijing': 'Asia/Shanghai',
  'Pacific/Wellington': 'Pacific/Auckland',
}

/** Resolves deprecated IDs to canonical IANA timezone. */
function resolveTimezoneId(id: string): string {
  return TIMEZONE_ALIASES[id] ?? id
}

/** Returns true if the timezone ID is valid (can format a date). */
export function isValidTimezone(date: Date, timezoneId: string): boolean {
  try {
    formatInTimeZone(date, resolveTimezoneId(timezoneId), 'HH:mm')
    return true
  } catch {
    return false
  }
}

/** Format time in a timezone (no seconds). */
export function getTimeInTimezone(
  date: Date,
  timezoneId: string,
  use24h: boolean
): string {
  try {
    const id = resolveTimezoneId(timezoneId)
    const pattern = use24h ? 'HH:mm' : 'h:mm a'
    return formatInTimeZone(date, id, pattern)
  } catch {
    return '--:--'
  }
}

/** Format date in a timezone (e.g. "Mon, Jan 15"). */
export function getDateInTimezone(date: Date, timezoneId: string): string {
  try {
    return formatInTimeZone(date, resolveTimezoneId(timezoneId), 'EEE, MMM d')
  } catch {
    return '--'
  }
}

/** Get UTC offset string (e.g. "UTC+02:00"). */
export function getUtcOffset(date: Date, timezoneId: string): string {
  try {
    const id = resolveTimezoneId(timezoneId)
    const offsetMs = getTimezoneOffset(id, date)
    if (!Number.isFinite(offsetMs)) return 'UTC'
    const offsetMins = Math.round(offsetMs / (60 * 1000))
    if (!Number.isFinite(offsetMins)) return 'UTC'
    const sign = offsetMins >= 0 ? '+' : '-'
    const absMins = Math.abs(offsetMins)
    const hours = Math.floor(absMins / 60)
    const mins = absMins % 60
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `UTC${sign}${pad(hours)}:${pad(mins)}`
  } catch {
    return 'UTC'
  }
}

/** True if 06:00–18:00 local time in that zone. */
export function isDaytime(date: Date, timezoneId: string): boolean {
  try {
    const zoned = toZonedTime(date, resolveTimezoneId(timezoneId))
    const hour = zoned.getHours()
    return hour >= 6 && hour < 18
  } catch {
    return true
  }
}

/** True if DST is in effect. */
export function isDst(date: Date, timezoneId: string): boolean {
  try {
    const id = resolveTimezoneId(timezoneId)
    const jan = new Date(date.getFullYear(), 0, 15)
    const jul = new Date(date.getFullYear(), 6, 15)
    const janOffset = getTimezoneOffset(id, jan)
    const julOffset = getTimezoneOffset(id, jul)
    const currentOffset = getTimezoneOffset(id, date)
    const stdOffset = Math.min(janOffset, julOffset)
    return currentOffset !== stdOffset
  } catch {
    return false
  }
}

/** Fallback list when Intl.supportedValuesOf is unavailable. */
function getFallbackTimezoneList(): { id: string; city: string }[] {
  const seen = new Set<string>()
  const list: { id: string; city: string }[] = []
  for (const t of ALL_TIMEZONES) {
    const key = `${t.id}|${t.city}`
    if (!seen.has(key)) {
      seen.add(key)
      list.push({ id: t.id, city: t.city })
    }
  }
  return list
}

/** All IANA timezones for search (uses Intl when available, fallback otherwise). */
export function getTimezoneSearchList(): { id: string; city: string }[] {
  try {
    if (typeof Intl.supportedValuesOf === 'function') {
      const ids = Intl.supportedValuesOf('timeZone')
      if (ids.length > 0) {
        return ids.map((id) => ({
          id,
          city: id.split('/').pop()?.replace(/_/g, ' ') ?? id,
        }))
      }
    }
  } catch {
    /* fall through to fallback */
  }
  return getFallbackTimezoneList()
}

/** Filter timezones by query (city or ID). */
export function searchTimezones(
  query: string,
  allTimezones: { id: string; city: string }[],
  limit = 20
): { id: string; city: string }[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return allTimezones
    .filter(
      (tz) =>
        tz.id.toLowerCase().includes(q) || tz.city.toLowerCase().includes(q)
    )
    .slice(0, limit)
}
