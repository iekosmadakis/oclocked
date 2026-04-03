export type SortOption = 'default' | 'alphabetical'

/** Common timezone abbreviations mapped to IANA IDs. */
export const TZ_ABBREVIATIONS: Record<string, string> = {
  UTC: 'UTC',
  GMT: 'Europe/London',
  EST: 'America/New_York',
  CST: 'America/Chicago',
  MST: 'America/Denver',
  PST: 'America/Los_Angeles',
  CET: 'Europe/Paris',
  EET: 'Europe/Athens',
  IST: 'Asia/Kolkata',
  JST: 'Asia/Tokyo',
  KST: 'Asia/Seoul',
  CST_CN: 'Asia/Shanghai',
  AEST: 'Australia/Sydney',
  NZST: 'Pacific/Auckland',
  BRT: 'America/Sao_Paulo',
  SGT: 'Asia/Singapore',
  HKT: 'Asia/Hong_Kong',
  GST: 'Asia/Dubai',
}

function formatInZone(
  date: Date,
  timezoneId: string,
  options: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: timezoneId }).format(date)
}

function formatPartsInZone(
  date: Date,
  timezoneId: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormatPart[] {
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: timezoneId }).formatToParts(date)
}

export function isValidTimezone(timezoneId: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezoneId }).format(new Date())
    return true
  } catch {
    return false
  }
}

export function getTimeInTimezone(
  date: Date,
  timezoneId: string,
  use24h: boolean
): string {
  try {
    return formatInZone(date, timezoneId, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !use24h,
    })
  } catch {
    return '--:--'
  }
}

export function getDateInTimezone(date: Date, timezoneId: string): string {
  try {
    return formatInZone(date, timezoneId, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '--'
  }
}

function getOffsetMinutes(date: Date, timezoneId: string): number | null {
  try {
    const parts = formatPartsInZone(date, timezoneId, {
      timeZoneName: 'longOffset',
    })
    const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value
    if (!tzPart || !tzPart.startsWith('GMT')) return null
    if (tzPart === 'GMT') return 0
    const match = tzPart.match(/GMT([+-])(\d{1,2}):?(\d{2})?/)
    if (!match) return null
    const sign = match[1] === '+' ? 1 : -1
    const hours = parseInt(match[2], 10)
    const mins = match[3] ? parseInt(match[3], 10) : 0
    return sign * (hours * 60 + mins)
  } catch {
    return null
  }
}

export function getUtcOffset(date: Date, timezoneId: string): string {
  const mins = getOffsetMinutes(date, timezoneId)
  if (mins === null) return 'UTC'
  const sign = mins >= 0 ? '+' : '-'
  const abs = Math.abs(mins)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `UTC${sign}${pad(h)}:${pad(m)}`
}

/** Returns the offset difference in hours between two timezones (target - user). */
export function getTimeDiffHours(
  date: Date,
  targetTz: string,
  userTz: string
): number | null {
  const targetOff = getOffsetMinutes(date, targetTz)
  const userOff = getOffsetMinutes(date, userTz)
  if (targetOff === null || userOff === null) return null
  return (targetOff - userOff) / 60
}

export function isDaytime(date: Date, timezoneId: string): boolean {
  try {
    const parts = formatPartsInZone(date, timezoneId, { hour: 'numeric' })
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '12', 10)
    return hour >= 6 && hour < 18
  } catch {
    return true
  }
}

export function isDst(date: Date, timezoneId: string): boolean {
  try {
    const y = date.getFullYear()
    const jan = new Date(y, 0, 15)
    const jul = new Date(y, 6, 15)
    const janOff = getOffsetMinutes(jan, timezoneId)
    const julOff = getOffsetMinutes(jul, timezoneId)
    const nowOff = getOffsetMinutes(date, timezoneId)
    if (janOff === null || julOff === null || nowOff === null) return false
    const std = Math.min(janOff, julOff)
    return nowOff !== std
  } catch {
    return false
  }
}

/** Converts an hour:minute from one timezone to another via offset arithmetic. */
export function convertTime(
  hour: number,
  minute: number,
  fromTz: string,
  toTz: string,
  use24h: boolean
): string {
  try {
    const ref = new Date()
    const fromOff = getOffsetMinutes(ref, fromTz)
    const toOff = getOffsetMinutes(ref, toTz)
    if (fromOff === null || toOff === null) return '--:--'

    let totalMin = hour * 60 + minute + (toOff - fromOff)
    totalMin = ((totalMin % 1440) + 1440) % 1440
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60

    if (use24h) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    }
    const period = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`
  } catch {
    return '--:--'
  }
}

export async function getTimezoneSearchList(): Promise<{ id: string; city: string }[]> {
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
  } catch { /* fall through */ }
  const { ALL_TIMEZONES } = await import('../data/popularTimezones')
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
