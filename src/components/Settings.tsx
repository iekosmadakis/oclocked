import { useState } from 'react'
import type { Settings as SettingsType } from '../store/SettingsStore'
import { getSettings, saveSettings } from '../store/SettingsStore'
import styles from './Settings.module.css'

interface SettingsProps {
  use24h: boolean
  theme: 'light' | 'dark' | 'system'
  workStart: number
  workEnd: number
  onSettingsChange: (s: SettingsType) => void
}

function formatHour(h: number, use24h: boolean): string {
  if (use24h) return `${h.toString().padStart(2, '0')}:00`
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

/** Settings dropdown: time format, theme, and work hours. */
export function Settings({ use24h, theme, workStart, workEnd, onSettingsChange }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const update = (updates: Partial<SettingsType>) => {
    const s = { ...getSettings(), ...updates }
    saveSettings(s)
    onSettingsChange(s)
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Settings"
      >
        ⚙
      </button>
      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} aria-hidden />
          <div className={styles.dropdown}>
            <div className={styles.section}>
              <span className={styles.label}>Time format</span>
              <div className={styles.toggleGroup}>
                <button
                  type="button"
                  className={!use24h ? styles.active : ''}
                  onClick={() => update({ use24h: false })}
                >
                  12h
                </button>
                <button
                  type="button"
                  className={use24h ? styles.active : ''}
                  onClick={() => update({ use24h: true })}
                >
                  24h
                </button>
              </div>
            </div>
            <div className={styles.section}>
              <span className={styles.label}>Theme</span>
              <div className={styles.toggleGroup}>
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={theme === t ? styles.active : ''}
                    onClick={() => update({ theme: t })}
                  >
                    {t === 'system' ? 'System' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.section}>
              <span className={styles.label}>Work hours</span>
              <div className={styles.rangeRow}>
                <select
                  className={styles.hourSelect}
                  value={String(workStart)}
                  onChange={(e) => update({ workStart: Number(e.target.value) })}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={String(i)}>{formatHour(i, use24h)}</option>
                  ))}
                </select>
                <span className={styles.rangeSep}>–</span>
                <select
                  className={styles.hourSelect}
                  value={String(workEnd)}
                  onChange={(e) => update({ workEnd: Number(e.target.value) })}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={String(i)}>{formatHour(i, use24h)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
