import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { getTimezoneSearchList, searchTimezones, getTimeInTimezone, getTimeDiffHours } from '../utils/timezone'
import { FAVORITES_EVENT } from '../constants'
import { addFavorite, getFavorites } from '../store/FavoritesStore'
import { useClickOutside } from '../hooks/useClickOutside'
import type { TimezoneItem } from '../types/timezone'
import styles from './SearchBar.module.css'

interface SearchBarProps {
  baseTime: Date
  use24h: boolean
  onAddTimezone: (item: TimezoneItem) => void
}

function tzToItem(id: string, city: string): TimezoneItem {
  return {
    id,
    city: city.replace(/\b\w/g, (c) => c.toUpperCase()),
    region: id.split('/')[0] ?? 'Other',
    popularityRank: 999,
  }
}

const USER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone

function formatDiff(hours: number): string {
  if (hours === 0) return 'same'
  const sign = hours > 0 ? '+' : ''
  return Number.isInteger(hours) ? `${sign}${hours}h` : `${sign}${hours.toFixed(1)}h`
}

/** Search input with dropdown to add IANA timezones. */
export function SearchBar({ baseTime, use24h, onAddTimezone }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [allTimezones, setAllTimezones] = useState<{ id: string; city: string }[]>([])
  const [focused, setFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getTimezoneSearchList().then(setAllTimezones)
  }, [])

  useClickOutside(wrapperRef, useCallback(() => setFocused(false), []))

  const results = useMemo(
    () => searchTimezones(query, allTimezones, 20),
    [query, allTimezones]
  )

  const showResults = focused && query.trim().length > 0
  const favSet = useMemo(() => new Set(getFavorites()), [/* eslint-disable-line react-hooks/exhaustive-deps */ getFavorites()])

  const handleAdd = useCallback(
    (id: string, city: string) => {
      addFavorite(id)
      onAddTimezone(tzToItem(id, city))
      window.dispatchEvent(new Event(FAVORITES_EVENT))
      setQuery('')
    },
    [onAddTimezone]
  )

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.searchBox}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search city or timezone"
          className={styles.input}
          aria-label="Search timezones"
          aria-autocomplete="list"
          aria-expanded={showResults}
        />
      </div>
      {showResults && (
        <div className={styles.results} role="listbox">
          {results.length === 0 ? (
            <p className={styles.empty}>No timezones found</p>
          ) : (
            results.map((tz) => {
              const alreadyAdded = favSet.has(tz.id)
              const diff = getTimeDiffHours(baseTime, tz.id, USER_TZ)
              return (
                <button
                  key={`${tz.id}|${tz.city}`}
                  type="button"
                  role="option"
                  className={styles.row}
                  onClick={() => handleAdd(tz.id, tz.city)}
                  disabled={alreadyAdded}
                >
                  <div className={styles.info}>
                    <span className={styles.city}>{tz.city}</span>
                    <span className={styles.id}>{tz.id}</span>
                  </div>
                  <div className={styles.right}>
                    {diff !== null && (
                      <span className={`${styles.diff} ${diff === 0 ? styles.diffSame : diff > 0 ? styles.diffAhead : styles.diffBehind}`}>
                        {formatDiff(diff)}
                      </span>
                    )}
                    <span className={styles.time}>{getTimeInTimezone(baseTime, tz.id, use24h)}</span>
                    {alreadyAdded ? (
                      <span className={styles.added}>Added</span>
                    ) : (
                      <span className={styles.add}>Add</span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
