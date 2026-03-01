import { useState, useEffect, useMemo } from 'react'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { SegmentedTabs, type TabId } from './SegmentedTabs'
import { SortSelect } from './SortSelect'
import { TimezoneGrid } from './TimezoneGrid'
import { TimeSlider } from './TimeSlider'
import { SkeletonCard } from './SkeletonCard'
import type { TimezoneItem } from '../types/timezone'
import type { SortOption } from '../utils/timezone'
import type { Settings as SettingsType } from '../store/SettingsStore'
import { POPULAR_TIMEZONES, ALL_TIMEZONES, ALL_LOOKUP } from '../data/popularTimezones'
import { FAVORITES_EVENT } from '../constants'
import { getFavorites } from '../store/FavoritesStore'
import styles from './AppShell.module.css'

interface AppShellProps {
  baseTime: Date
  onBaseTimeChange: (date: Date, isLive: boolean) => void
  isLive?: boolean
  use24h: boolean
  theme: 'light' | 'dark' | 'system'
  onSettingsChange: (s: SettingsType) => void
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  sortBy: SortOption
  onSortChange: (v: SortOption) => void
  customTimezones: TimezoneItem[]
  onAddTimezone: (item: TimezoneItem) => void
  isLoading: boolean
  userTimezone: string
}

function getDisplayItems(
  activeTab: TabId,
  favorites: string[],
  customTimezones: TimezoneItem[]
): TimezoneItem[] {
  if (activeTab === 'popular') return POPULAR_TIMEZONES

  if (activeTab === 'favorites') {
    const favSet = new Set(favorites)
    const fromCustom = customTimezones.filter((t) => favSet.has(t.id))
    const favItems = favorites
      .map(
        (id) =>
          ALL_LOOKUP.get(id) ?? fromCustom.find((t) => t.id === id) ?? null
      )
      .filter((t): t is TimezoneItem => t != null)
    const missing = favorites.filter((id) => !favItems.some((t) => t.id === id))
    const extra = missing.map((id) => ({
      id,
      city: id.split('/').pop()?.replace(/_/g, ' ') ?? id,
      region: id.split('/')[0] ?? 'Other',
      popularityRank: 999,
    }))
    return [...favItems, ...extra]
  }

  const seen = new Set<string>()
  const all: TimezoneItem[] = []
  for (const t of [...ALL_TIMEZONES, ...customTimezones]) {
    const key = `${t.id}|${t.city}`
    if (!seen.has(key)) {
      seen.add(key)
      all.push(t)
    }
  }
  return all
}

/** Main layout: TopBar, toolbar, time slider, content grid, and sidebar. */
export function AppShell({
  baseTime,
  onBaseTimeChange,
  use24h,
  isLive = true,
  theme,
  onSettingsChange,
  activeTab,
  onTabChange,
  sortBy,
  onSortChange,
  customTimezones,
  onAddTimezone,
  isLoading,
  userTimezone,
}: AppShellProps) {
  const [, setFavVersion] = useState(0)
  useEffect(() => {
    const handler = () => setFavVersion((v) => v + 1)
    window.addEventListener(FAVORITES_EVENT, handler)
    return () => window.removeEventListener(FAVORITES_EVENT, handler)
  }, [])

  const favorites = getFavorites()
  const displayItems = useMemo(
    () => getDisplayItems(activeTab, favorites, customTimezones),
    [activeTab, favorites, customTimezones]
  )

  return (
    <div className={styles.shell}>
      <TopBar
        baseTime={baseTime}
        onBaseTimeChange={onBaseTimeChange}
        use24h={use24h}
        isLive={isLive}
        theme={theme}
        onSettingsChange={onSettingsChange}
        onAddTimezone={onAddTimezone}
      />
      <main className={styles.layout}>
        <div className={styles.content}>
          <div className={styles.toolbar}>
            <SegmentedTabs
              activeTab={activeTab}
              onTabChange={onTabChange}
              favoritesCount={favorites.length}
            />
            <SortSelect value={sortBy} onChange={onSortChange} />
          </div>
          <TimeSlider
            baseTime={baseTime}
            onBaseTimeChange={onBaseTimeChange}
            isLive={isLive}
            use24h={use24h}
          />
          {isLoading ? (
            <div className="grid">
              {Array.from({ length: 12 }, (_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
              ))}
            </div>
          ) : (
            <TimezoneGrid
              items={displayItems}
              baseTime={baseTime}
              use24h={use24h}
              sortBy={sortBy}
              userTimezone={userTimezone}
            />
          )}
        </div>
        <Sidebar baseTime={baseTime} use24h={use24h} />
      </main>
      <footer className={styles.footer}>
        <p className={styles.tagline}>Because time is precious. Time zone math shouldn't be.</p>
        <p className={styles.copyright}>Copyright © 2026 Ioannis E. Kosmadakis</p>
      </footer>
    </div>
  )
}
