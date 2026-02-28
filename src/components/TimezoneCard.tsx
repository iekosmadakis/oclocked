import type { TimezoneItem } from '../types/timezone'
import {
  getTimeInTimezone,
  getDateInTimezone,
  getUtcOffset,
  isDaytime,
  isDst,
} from '../utils/timezone'
import styles from './TimezoneCard.module.css'

interface TimezoneCardProps {
  item: TimezoneItem
  baseTime: Date
  use24h: boolean
  userDate: string
  isFavorite: boolean
  onToggleFavorite: () => void
}

/** Card displaying a single timezone with time, offset, DST, and favorite toggle. */
export function TimezoneCard({
  item,
  baseTime,
  use24h,
  userDate,
  isFavorite,
  onToggleFavorite,
}: TimezoneCardProps) {
  const time = getTimeInTimezone(baseTime, item.id, use24h)
  const date = getDateInTimezone(baseTime, item.id)
  const offset = getUtcOffset(baseTime, item.id)
  const day = isDaytime(baseTime, item.id)
  const dst = isDst(baseTime, item.id)
  const showDate = date !== userDate

  return (
    <article className={styles.card} data-timezone={item.id}>
      <div className={styles.header}>
        <h3 className={styles.city}>{item.city}</h3>
        <button
          type="button"
          className={`${styles.fav} ${isFavorite ? styles.favActive : ''}`}
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>
      <div className={styles.time}>{time}</div>
      <div className={styles.meta}>
        <span className={styles.offset}>{offset}</span>
        {dst && <span className={styles.dst}>DST</span>}
      </div>
      <div className={styles.footer}>
        <span
          className={styles.dayNight}
          title={day ? 'Day' : 'Night'}
          aria-hidden
        >
          {day ? '☀' : '☽'}
        </span>
        <span className={styles.tzId}>{item.id}</span>
        {showDate && <span className={styles.date}>{date}</span>}
      </div>
    </article>
  )
}
