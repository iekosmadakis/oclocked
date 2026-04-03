import { useState, useMemo } from 'react'
import { TZ_ABBREVIATIONS, convertTime, isValidTimezone } from '../utils/timezone'
import styles from './TimezoneConverter.module.css'

interface TimezoneConverterProps {
  use24h: boolean
}

const ABBR_ENTRIES = Object.entries(TZ_ABBREVIATIONS)

function currentHM(): { hour: number; minute: number } {
  const now = new Date()
  return { hour: now.getHours(), minute: now.getMinutes() }
}

function toHHMM(h: number, m: number): string {
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

function to12h(h: number, m: number): string {
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`
}

function parse12h(value: string): { hour: number; minute: number } | null {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i)
  if (!match) return null
  let h = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  if (match[3].toLowerCase() === 'pm' && h < 12) h += 12
  if (match[3].toLowerCase() === 'am' && h === 12) h = 0
  return { hour: h, minute: m }
}

/** Compact timezone converter with a dedicated time input. */
export function TimezoneConverter({ use24h }: TimezoneConverterProps) {
  const [fromTz, setFromTz] = useState('UTC')
  const [toTz, setToTz] = useState('EST')
  const [hm, setHm] = useState(currentHM)

  const fromIana = TZ_ABBREVIATIONS[fromTz] ?? fromTz
  const toIana = TZ_ABBREVIATIONS[toTz] ?? toTz

  const { hour, minute } = hm

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
        <div className={styles.timeInputWrap}>
          {use24h ? (
            <input
              type="time"
              className={styles.timeInput}
              value={toHHMM(hour, minute)}
              onChange={(e) => {
                const [h, m] = e.target.value.split(':').map(Number)
                if (!isNaN(h) && !isNaN(m)) setHm({ hour: h, minute: m })
              }}
            />
          ) : (
            <input
              type="text"
              className={styles.timeInput}
              value={to12h(hour, minute)}
              onChange={(e) => {
                const parsed = parse12h(e.target.value)
                if (parsed) setHm(parsed)
              }}
              placeholder="h:mm AM/PM"
            />
          )}
        </div>
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
