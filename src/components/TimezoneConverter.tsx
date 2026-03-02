import { useState, useMemo } from 'react'
import { TZ_ABBREVIATIONS, convertTime, isValidTimezone } from '../utils/timezone'
import styles from './TimezoneConverter.module.css'

interface TimezoneConverterProps {
  use24h: boolean
}

const ABBR_ENTRIES = Object.entries(TZ_ABBREVIATIONS)

function currentHHMM(): string {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

/** Compact timezone converter with a dedicated time input. */
export function TimezoneConverter({ use24h }: TimezoneConverterProps) {
  const [fromTz, setFromTz] = useState('UTC')
  const [toTz, setToTz] = useState('EST')
  const [time, setTime] = useState(currentHHMM)

  const fromIana = TZ_ABBREVIATIONS[fromTz] ?? fromTz
  const toIana = TZ_ABBREVIATIONS[toTz] ?? toTz

  const [hour, minute] = time.split(':').map(Number)

  const result = useMemo(() => {
    if (isNaN(hour) || isNaN(minute)) return '--:--'
    if (!isValidTimezone(fromIana) || !isValidTimezone(toIana)) return '--:--'
    return convertTime(hour, minute, fromIana, toIana, use24h)
  }, [hour, minute, fromIana, toIana, use24h])

  const handleSwap = () => {
    setFromTz(toTz)
    setToTz(fromTz)
  }

  return (
    <div className={styles.converter}>
      <div className={styles.header}>
        <span className={styles.title}>Convert</span>
      </div>
      <div className={styles.timeRow}>
        <label className={styles.label}>Time</label>
        <input
          type="time"
          className={styles.timeInput}
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>From</label>
          <select
            className={styles.select}
            value={fromTz}
            onChange={(e) => setFromTz(e.target.value)}
          >
            {ABBR_ENTRIES.map(([abbr, iana]) => (
              <option key={`from-${abbr}`} value={abbr}>
                {abbr === 'CST_CN' ? 'CST (CN)' : abbr} — {iana.split('/').pop()?.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className={styles.swap} onClick={handleSwap} aria-label="Swap timezones">
          ⇄
        </button>
        <div className={styles.field}>
          <label className={styles.label}>To</label>
          <select
            className={styles.select}
            value={toTz}
            onChange={(e) => setToTz(e.target.value)}
          >
            {ABBR_ENTRIES.map(([abbr, iana]) => (
              <option key={`to-${abbr}`} value={abbr}>
                {abbr === 'CST_CN' ? 'CST (CN)' : abbr} — {iana.split('/').pop()?.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.result}>
        <span className={styles.resultTime}>{result}</span>
        <span className={styles.resultLabel}>
          {fromTz === 'CST_CN' ? 'CST (CN)' : fromTz} → {toTz === 'CST_CN' ? 'CST (CN)' : toTz}
        </span>
      </div>
    </div>
  )
}
