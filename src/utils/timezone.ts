export type SortOption = 'default' | 'alphabetical'

const TIMEZONE_ALIASES: Record<string, string> = {
  'Asia/Beijing': 'Asia/Shanghai',
  'Pacific/Wellington': 'Pacific/Auckland',
}

function resolveTimezoneId(id: string): string {
  return TIMEZONE_ALIASES[id] ?? id
}

function formatInZone(
  date: Date,
  timezoneId: string,
  options: Intl.DateTimeFormatOptions
): string {
  const id = resolveTimezoneId(timezoneId)
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: id }).format(date)
}

function formatPartsInZone(
  date: Date,
  timezoneId: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormatPart[] {
  const id = resolveTimezoneId(timezoneId)
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: id }).formatToParts(date)
}

export function isValidTimezone(_date: Date, timezoneId: string): boolean {
  try {
    const id = resolveTimezoneId(timezoneId)
    new Intl.DateTimeFormat('en-US', { timeZone: id }).format(new Date())
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
    const id = resolveTimezoneId(timezoneId)
    const y = date.getFullYear()
    const jan = new Date(y, 0, 15)
    const jul = new Date(y, 6, 15)
    const janOff = getOffsetMinutes(jan, id)
    const julOff = getOffsetMinutes(jul, id)
    const nowOff = getOffsetMinutes(date, id)
    if (janOff === null || julOff === null || nowOff === null) return false
    const std = Math.min(janOff, julOff)
    return nowOff !== std
  } catch {
    return false
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
  } catch {
    /* fall through */
  }
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
