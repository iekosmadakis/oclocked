import { useState, useCallback, useRef } from 'react'
import styles from './TimeSlider.module.css'

interface TimeSliderProps {
  baseTime: Date
  onBaseTimeChange: (date: Date, isLive: boolean) => void
  isLive: boolean
  use24h: boolean
}

function formatHour(half: number, use24h: boolean): string {
  const h = Math.floor(half / 2)
  const m = half % 2 === 0 ? '00' : '30'
  if (use24h) return `${h.toString().padStart(2, '0')}:${m}`
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${m} ${period}`
}

/** Draggable time slider for shifting base time across 24h. */
export function TimeSlider({
  baseTime,
  onBaseTimeChange,
  isLive,
  use24h,
}: TimeSliderProps) {
  const [active, setActive] = useState(false)
  const originRef = useRef<Date | null>(null)

  const currentHalf = baseTime.getHours() * 2 + (baseTime.getMinutes() >= 30 ? 1 : 0)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!originRef.current) originRef.current = new Date(baseTime)
      setActive(true)
      const half = parseInt(e.target.value, 10)
      const h = Math.floor(half / 2)
      const m = half % 2 === 0 ? 0 : 30
      const d = new Date(baseTime)
      d.setHours(h, m, 0, 0)
      onBaseTimeChange(d, false)
    },
    [baseTime, onBaseTimeChange]
  )

  const handleReset = useCallback(() => {
    setActive(false)
    originRef.current = null
    onBaseTimeChange(new Date(), true)
  }, [onBaseTimeChange])

  return (
    <div className={`${styles.slider} ${active || !isLive ? styles.active : ''}`}>
      <div className={styles.track}>
        <label className={styles.label}>
          <span className={styles.labelText}>Meeting planner</span>
          <span className={styles.time}>{formatHour(currentHalf, use24h)}</span>
        </label>
        <input
          type="range"
          min={0}
          max={47}
          step={1}
          value={currentHalf}
          onChange={handleChange}
          className={styles.range}
          aria-label="Adjust time"
        />
      </div>
      {(active || !isLive) && (
        <button type="button" className={styles.reset} onClick={handleReset}>
          Reset
        </button>
      )}
    </div>
  )
}
