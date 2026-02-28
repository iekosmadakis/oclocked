import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import styles from './BaseTimePicker.module.css'

interface BaseTimePickerProps {
  baseTime: Date
  onBaseTimeChange: (date: Date, isLive: boolean) => void
  use24h: boolean
  isLive?: boolean
}

/** Picker for base time: live "Now" or custom date/time. */
export function BaseTimePicker({
  baseTime,
  onBaseTimeChange,
  use24h,
  isLive = true,
}: BaseTimePickerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [dateStr, setDateStr] = useState(format(baseTime, 'yyyy-MM-dd'))
  const [timeStr, setTimeStr] = useState(
    format(baseTime, use24h ? 'HH:mm' : 'h:mm a')
  )

  useEffect(() => {
    if (isExpanded) {
      setDateStr(format(baseTime, 'yyyy-MM-dd'))
      setTimeStr(format(baseTime, use24h ? 'HH:mm' : 'h:mm a'))
    }
  }, [isExpanded, baseTime, use24h])

  const handleUseNow = () => {
    const now = new Date()
    onBaseTimeChange(now, true)
    setDateStr(format(now, 'yyyy-MM-dd'))
    setTimeStr(format(now, use24h ? 'HH:mm' : 'h:mm a'))
    setIsExpanded(false)
  }

  const handleApply = () => {
    try {
      const [y, m, day] = dateStr.split('-').map(Number)
      let hours: number
      let minutes: number
      if (use24h) {
        const [h, min] = timeStr.split(':').map(Number)
        hours = h ?? 0
        minutes = min ?? 0
      } else {
        const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i)
        if (match) {
          hours = parseInt(match[1], 10)
          minutes = parseInt(match[2], 10)
          if (match[3].toLowerCase() === 'pm' && hours < 12) hours += 12
          if (match[3].toLowerCase() === 'am' && hours === 12) hours = 0
        } else {
          hours = 0
          minutes = 0
        }
      }
      const date = new Date(y, m - 1, day, hours, minutes, 0, 0)
      if (!isNaN(date.getTime())) {
        onBaseTimeChange(date, false)
        setIsExpanded(false)
      }
    } catch {
      // Invalid date
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className={styles.label}>Base time</span>
        <span className={styles.value}>
          {isLive ? (
            <>Now · {format(baseTime, use24h ? 'HH:mm' : 'h:mm a')}</>
          ) : (
            format(baseTime, use24h ? 'MMM d, HH:mm' : 'MMM d, h:mm a')
          )}
        </span>
      </button>
      {isExpanded && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setIsExpanded(false)}
            aria-hidden
          />
          <div className={styles.dropdown}>
            <div className={styles.row}>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className={styles.input}
              />
              <input
                type={use24h ? 'time' : 'text'}
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                placeholder={use24h ? undefined : 'h:mm am/pm'}
                className={styles.input}
              />
            </div>
            <div className={styles.actions}>
              <button type="button" onClick={handleUseNow} className={styles.btn}>
                Use now
              </button>
              <button
                type="button"
                onClick={handleApply}
                className={styles.btnPrimary}
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
