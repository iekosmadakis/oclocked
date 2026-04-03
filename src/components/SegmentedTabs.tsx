import styles from './SegmentedTabs.module.css'

export type TabId = 'popular' | 'favorites' | 'all' | 'planner'

interface SegmentedTabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  favoritesCount: number
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'all', label: 'All' },
  { id: 'planner', label: 'Planner' },
]

/** Tab bar for Popular, Favorites, All timezone lists, and Planner. */
export function SegmentedTabs({
  activeTab,
  onTabChange,
  favoritesCount,
}: SegmentedTabsProps) {
  return (
    <div className={styles.wrapper} role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''} ${tab.id === 'planner' ? styles.planner : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.id === 'planner' && <span className={styles.plannerIcon} aria-hidden>▦</span>}
          {tab.label}
          {tab.id === 'favorites' && favoritesCount > 0 && (
            <span className={styles.badge}>{favoritesCount}</span>
          )}
        </button>
      ))}
    </div>
  )
}
