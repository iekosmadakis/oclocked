import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  getTimezoneSearchList,
  searchTimezones,
  getTimeInTimezone,
  getUtcOffset,
  getOffsetMinutes,
  isValidTimezone,
} from '../utils/timezone'
import { getPlannerTimezones, savePlannerTimezones } from '../store/PlannerStore'
import { useClickOutside } from '../hooks/useClickOutside'
import styles from './MeetingPlanner.module.css'

interface MeetingPlannerProps {
  baseTime: Date
  use24h: boolean
  userTimezone: string
  workStart: number
  workEnd: number
}

const MAX_ZONES = 6
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function formatHourLabel(h: number, use24h: boolean): string {
  if (use24h) return h.toString().padStart(2, '0')
  if (h === 0) return '12a'
  if (h < 12) return `${h}a`
  if (h === 12) return '12p'
  return `${h - 12}p`
}

interface OverlapRange {
  startHour: number
  endHour: number
  durationHours: number
}

function computeOverlap(
  zones: string[],
  baseTime: Date,
  userTimezone: string,
  workStart: number,
  workEnd: number
): OverlapRange | null {
  if (zones.length < 2) return null

  const userOff = getOffsetMinutes(baseTime, userTimezone)
  if (userOff === null) return null

  const workRangesInUserMinutes: [number, number][] = []

  for (const tz of zones) {
    const off = getOffsetMinutes(baseTime, tz)
    if (off === null) return null
    const diff = off - userOff
    const start = workStart * 60 + diff
    const end = workEnd * 60 + diff
    workRangesInUserMinutes.push([start, end])
  }

  let overlapStart = -Infinity
  let overlapEnd = Infinity
  for (const [s, e] of workRangesInUserMinutes) {
    overlapStart = Math.max(overlapStart, s)
    overlapEnd = Math.min(overlapEnd, e)
  }

  if (overlapStart >= overlapEnd) return null

  const startHour = overlapStart / 60
  const endHour = overlapEnd / 60
  return {
    startHour,
    endHour,
    durationHours: endHour - startHour,
  }
}

function getLocalHourForColumn(
  column: number,
  zoneOffset: number,
  userOffset: number
): number {
  const diff = zoneOffset - userOffset
  const localMinute = column * 60 + diff
  return ((localMinute % 1440) + 1440) % 1440 / 60
}

function formatOverlapTime(hours: number, use24h: boolean): string {
  const h = Math.floor(((hours % 24) + 24) % 24)
  const m = Math.round((hours - Math.floor(hours)) * 60)
  if (use24h) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`
}

/** Meeting planner with 24h timeline showing work hour overlap across timezones. */
export function MeetingPlanner({ baseTime, use24h, userTimezone, workStart, workEnd }: MeetingPlannerProps) {
  const [zones, setZones] = useState<string[]>(getPlannerTimezones)
  const [query, setQuery] = useState('')
  const [allTimezones, setAllTimezones] = useState<{ id: string; city: string }[]>([])
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getTimezoneSearchList().then(setAllTimezones)
  }, [])

  useEffect(() => {
    savePlannerTimezones(zones)
  }, [zones])

  useClickOutside(searchRef, useCallback(() => setSearchFocused(false), []), searchFocused)

  const results = useMemo(
    () => searchTimezones(query, allTimezones, 8).filter((tz) => !zones.includes(tz.id)),
    [query, allTimezones, zones]
  )

  const showResults = searchFocused && query.trim().length > 0

  const addZone = useCallback((id: string) => {
    if (zones.length >= MAX_ZONES || zones.includes(id)) return
    if (!isValidTimezone(id)) return
    setZones((prev) => [...prev, id])
    setQuery('')
  }, [zones])

  const removeZone = useCallback((id: string) => {
    setZones((prev) => prev.filter((z) => z !== id))
  }, [])

  const userOff = getOffsetMinutes(baseTime, userTimezone)
  const overlap = useMemo(
    () => computeOverlap(zones, baseTime, userTimezone, workStart, workEnd),
    [zones, baseTime, userTimezone, workStart, workEnd]
  )

  const currentHour = baseTime.getHours() + baseTime.getMinutes() / 60

  return (
    <div className={styles.planner}>
      <div className={styles.header}>
        <div className={styles.searchArea} ref={searchRef}>
          <input
            type="search"
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder={zones.length >= MAX_ZONES ? 'Max 6 cities' : 'Add city...'}
            disabled={zones.length >= MAX_ZONES}
            aria-label="Add city to planner"
          />
          {showResults && results.length > 0 && (
            <div className={styles.searchResults}>
              {results.map((tz) => (
                <button
                  key={tz.id}
                  type="button"
                  className={styles.searchRow}
                  onClick={() => addZone(tz.id)}
                >
                  <span className={styles.searchCity}>{tz.city}</span>
                  <span className={styles.searchId}>{tz.id}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {zones.length > 0 && (
          <div className={styles.chips}>
            {zones.map((id) => (
              <span key={id} className={styles.chip}>
                <span className={styles.chipLabel}>
                  {id.split('/').pop()?.replace(/_/g, ' ')}
                </span>
                <button
                  type="button"
                  className={styles.chipRemove}
                  onClick={() => removeZone(id)}
                  aria-label={`Remove ${id}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {overlap && (
        <div className={styles.overlapSummary}>
          <span className={styles.overlapIcon}>●</span>
          Overlap: {formatOverlapTime(overlap.startHour, use24h)} – {formatOverlapTime(overlap.endHour, use24h)} base time ({overlap.durationHours}h)
        </div>
      )}

      {zones.length === 0 && (
        <div className={styles.empty}>
          <p>Add cities to compare work hours</p>
          <p className={styles.emptyHint}>The timeline shows work hour overlap across zones</p>
        </div>
      )}

      {zones.length > 0 && (
        <div className={styles.timeline}>
          <div className={styles.barsArea}>
            {zones.map((tz) => {
              const off = getOffsetMinutes(baseTime, tz)
              const city = tz.split('/').pop()?.replace(/_/g, ' ') ?? tz
              return (
                <div key={tz} className={styles.row}>
                  <div className={styles.label}>
                    <span className={styles.labelCity}>{city}</span>
                    <span className={styles.labelTime}>
                      {getTimeInTimezone(baseTime, tz, use24h)}
                    </span>
                    <span className={styles.labelOffset}>
                      {getUtcOffset(baseTime, tz)}
                    </span>
                  </div>
                  <div className={styles.bar}>
                    {HOURS.map((h) => {
                      const localH = userOff !== null && off !== null
                        ? getLocalHourForColumn(h, off, userOff)
                        : h
                      const localHour = Math.floor(localH)
                      const isWork = localH >= workStart && localH < workEnd

                      return (
                        <div
                          key={h}
                          className={`${styles.seg} ${isWork ? styles.segWork : styles.segNight}`}
                          data-hour={`${formatHourLabel(localHour, use24h)} ${city}`}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
            <div className={styles.nowLineArea}>
              <div
                className={styles.nowMarker}
                style={{ left: `${(currentHour / 24) * 100}%` }}
              />
            </div>
          </div>

          <div className={styles.hourLabels}>
            <div className={styles.labelSpacer} />
            <div className={styles.hourTrackWrap}>
              <span className={styles.yourTime}>Base time</span>
              <div className={styles.hourTrack}>
                {HOURS.filter((h) => h % 3 === 0).map((h) => (
                  <span
                    key={h}
                    className={styles.hourTick}
                    style={{ left: `${(h / 24) * 100}%` }}
                  >
                    {formatHourLabel(h, use24h)}
                  </span>
                ))}
                <span
                  className={styles.hourTick}
                  style={{ left: '100%' }}
                >
                  {use24h ? '24' : '12a'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {zones.length === 1 && (
        <p className={styles.hint}>Add another timezone to see overlap</p>
      )}
    </div>
  )
}
