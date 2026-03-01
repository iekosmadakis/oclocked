import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { getTimezoneSearchList, searchTimezones } from '../utils/timezone'
import { FAVORITES_EVENT } from '../constants'
import { addFavorite, getFavorites } from '../store/FavoritesStore'
import { useClickOutside } from '../hooks/useClickOutside'
import type { TimezoneItem } from '../types/timezone'
import styles from './SearchBar.module.css'

interface SearchBarProps {
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

/** Search input with dropdown to add IANA timezones. */
export function SearchBar({ onAddTimezone }: SearchBarProps) {
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
                  {alreadyAdded ? (
                    <span className={styles.added}>Added</span>
                  ) : (
                    <span className={styles.add}>Add</span>
                  )}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
