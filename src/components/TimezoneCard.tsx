import { memo } from 'react'
import type { TimezoneItem } from '../types/timezone'
import {
  getTimeInTimezone,
  getDateInTimezone,
  getUtcOffset,
  getTimeDiffHours,
  isDaytime,
  isDst,
} from '../utils/timezone'
import styles from './TimezoneCard.module.css'

interface TimezoneCardProps {
  item: TimezoneItem
  baseTime: Date
  use24h: boolean
  userDate: string
  userTimezone: string
  isFavorite: boolean
  onToggleFavorite: () => void
}

function formatDiff(hours: number): string {
  if (hours === 0) return 'same'
  const sign = hours > 0 ? '+' : ''
  return Number.isInteger(hours) ? `${sign}${hours}h` : `${sign}${hours.toFixed(1)}h`
}

function diffClass(hours: number): string {
  if (hours === 0) return styles.diffSame
  return hours > 0 ? styles.diffAhead : styles.diffBehind
}

/** Card displaying a single timezone with time, offset, diff, and favorite toggle. */
export const TimezoneCard = memo(function TimezoneCard({
  item,
  baseTime,
  use24h,
  userDate,
  userTimezone,
  isFavorite,
  onToggleFavorite,
}: TimezoneCardProps) {
  const time = getTimeInTimezone(baseTime, item.id, use24h)
  const date = getDateInTimezone(baseTime, item.id)
  const offset = getUtcOffset(baseTime, item.id)
  const day = isDaytime(baseTime, item.id)
  const dst = isDst(baseTime, item.id)
  const diffHours = getTimeDiffHours(baseTime, item.id, userTimezone)
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
        {diffHours !== null && (
          <span className={`${styles.diff} ${diffClass(diffHours)}`}>
            {formatDiff(diffHours)}
          </span>
        )}
        {dst && <span className={styles.dst}>DST</span>}
      </div>
      <div className={styles.footer}>
        <span className={styles.dayNight} title={day ? 'Day' : 'Night'} aria-hidden>
          {day ? '☀' : '☽'}
        </span>
        <span className={styles.tzId}>{item.id}</span>
        {showDate && <span className={styles.date}>{date}</span>}
      </div>
    </article>
  )
})
