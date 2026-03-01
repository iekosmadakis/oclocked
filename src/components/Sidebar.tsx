import { REGION_ORDER } from '../constants'
import { POPULAR_TIMEZONES } from '../data/popularTimezones'
import { getUtcOffset } from '../utils/timezone'
import { TimezoneConverter } from './TimezoneConverter'
import styles from './Sidebar.module.css'

interface SidebarProps {
  baseTime: Date
  use24h: boolean
}

const timezonesByRegion = POPULAR_TIMEZONES.reduce(
  (acc, t) => {
    if (!acc[t.region]) acc[t.region] = new Set<string>()
    acc[t.region].add(t.id)
    return acc
  },
  {} as Record<string, Set<string>>
)

const SIDEBAR_REGIONS = REGION_ORDER.filter((r) => r !== 'Other')

/** Sidebar with timezone converter and popular timezones by region. */
export function Sidebar({ baseTime, use24h }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.converterSection}>
        <TimezoneConverter baseTime={baseTime} use24h={use24h} />
      </div>
      <h3 className={styles.title}>Popular timezones</h3>
      {SIDEBAR_REGIONS.map((region) => {
        const ids = Array.from(timezonesByRegion[region] ?? []).sort()
        if (ids.length === 0) return null
        return (
          <section key={region} className={styles.section}>
            <h4 className={styles.region}>{region}</h4>
            <ul className={styles.list}>
              {ids.map((id) => (
                <li key={id} className={styles.item}>
                  <code className={styles.tzId}>{id}</code>
                  <span className={styles.offset}>{getUtcOffset(baseTime, id)}</span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </aside>
  )
}
