import { useMemo, useState, useEffect, useCallback } from 'react'
import type { TimezoneItem } from '../types/timezone'
import type { SortOption } from '../utils/timezone'
import { getDateInTimezone, isValidTimezone } from '../utils/timezone'
import { TimezoneCard } from './TimezoneCard'
import { FAVORITES_EVENT, REGION_ORDER } from '../constants'
import { getFavorites, toggleFavorite } from '../store/FavoritesStore'
import styles from './TimezoneGrid.module.css'

interface TimezoneGridProps {
  items: TimezoneItem[]
  baseTime: Date
  use24h: boolean
  sortBy: SortOption
  userTimezone: string
}

/** Timezone cards grouped by region with sorting and favorites. */
export function TimezoneGrid({
  items,
  baseTime,
  use24h,
  sortBy,
  userTimezone,
}: TimezoneGridProps) {
  const userDate = getDateInTimezone(baseTime, userTimezone)
  const [, setFavVersion] = useState(0)

  useEffect(() => {
    const handler = () => setFavVersion((v) => v + 1)
    window.addEventListener(FAVORITES_EVENT, handler)
    return () => window.removeEventListener(FAVORITES_EVENT, handler)
  }, [])

  const favSet = useMemo(() => new Set(getFavorites()), [/* eslint-disable-line react-hooks/exhaustive-deps */ getFavorites()])

  const { byRegion, validCount } = useMemo(() => {
    const validItems = items.filter(
      (item) => item.city?.trim() && isValidTimezone(item.id)
    )
    const map = new Map<string, TimezoneItem[]>()
    for (const item of validItems) {
      const region = item.region || 'Other'
      if (!map.has(region)) map.set(region, [])
      map.get(region)!.push(item)
    }
    const sortFn = (a: TimezoneItem, b: TimezoneItem) =>
      sortBy === 'default'
        ? a.popularityRank - b.popularityRank || a.city.localeCompare(b.city)
        : a.city.localeCompare(b.city)
    map.forEach((arr) => arr.sort(sortFn))
    return { byRegion: map, validCount: validItems.length }
  }, [items, sortBy])

  const handleToggleFavorite = useCallback((id: string) => {
    toggleFavorite(id)
    window.dispatchEvent(new Event(FAVORITES_EVENT))
  }, [])

  if (validCount === 0) {
    return (
      <div className={styles.empty}>
        <p>No timezones to display.</p>
        <p className={styles.emptyHint}>Add some from Search.</p>
      </div>
    )
  }

  const regionOrder =
    sortBy === 'default'
      ? REGION_ORDER.filter((r) => byRegion.has(r))
      : [...byRegion.keys()].sort() as string[]

  return (
    <div className={styles.wrapper}>
      {regionOrder.map((region) => {
        const regionItems = byRegion.get(region)
        if (!regionItems?.length) return null
        return (
          <section key={region} className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.region}>{region}</h3>
              <div className={styles.ruler} />
            </div>
            <div className="grid">
              {regionItems.map((item) => (
                <TimezoneCard
                  key={`${item.id}-${item.city}`}
                  item={item}
                  baseTime={baseTime}
                  use24h={use24h}
                  userDate={userDate}
                  userTimezone={userTimezone}
                  isFavorite={favSet.has(item.id)}
                  onToggleFavorite={() => handleToggleFavorite(item.id)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
