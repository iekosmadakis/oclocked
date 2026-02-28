import { useState, useEffect } from 'react'
import styles from './BaseTimePicker.module.css'

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function fmtTime(d: Date, use24h: boolean): string {
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24h,
  })
}

function fmtDateTime(d: Date, use24h: boolean): string {
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24h,
  })
}

interface BaseTimePickerProps {
  baseTime: Date
  onBaseTimeChange: (date: Date, isLive: boolean) => void
  use24h: boolean
  isLive?: boolean
}

export function BaseTimePicker({
  baseTime,
  onBaseTimeChange,
  use24h,
  isLive = true,
}: BaseTimePickerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [dateStr, setDateStr] = useState(() => fmtDate(baseTime))
  const [timeStr, setTimeStr] = useState(() => fmtTime(baseTime, use24h))

  useEffect(() => {
    if (isExpanded) {
      setDateStr(fmtDate(baseTime))
      setTimeStr(fmtTime(baseTime, use24h))
    }
  }, [isExpanded, baseTime, use24h])

  const handleUseNow = () => {
    const now = new Date()
    onBaseTimeChange(now, true)
    setDateStr(fmtDate(now))
    setTimeStr(fmtTime(now, use24h))
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
      /* invalid */
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
            <>Now · {fmtTime(baseTime, use24h)}</>
          ) : (
            fmtDateTime(baseTime, use24h)
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
