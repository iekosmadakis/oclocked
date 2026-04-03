import { BaseTimePicker } from './BaseTimePicker'
import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { Settings } from './Settings'
import type { Settings as SettingsType } from '../store/SettingsStore'
import type { TimezoneItem } from '../types/timezone'
import styles from './TopBar.module.css'

interface TopBarProps {
  baseTime: Date
  onBaseTimeChange: (date: Date, isLive: boolean) => void
  use24h: boolean
  isLive?: boolean
  theme: 'light' | 'dark' | 'system'
  workStart: number
  workEnd: number
  onSettingsChange: (s: SettingsType) => void
  onAddTimezone: (item: TimezoneItem) => void
}

/** Header with logo, search bar, base time picker, and settings. */
export function TopBar({
  baseTime,
  onBaseTimeChange,
  use24h,
  isLive = true,
  theme,
  workStart,
  workEnd,
  onSettingsChange,
  onAddTimezone,
}: TopBarProps) {
  return (
    <header className={styles.bar}>
      <Logo />
      <div className={styles.searchSlot}>
        <SearchBar baseTime={baseTime} use24h={use24h} onAddTimezone={onAddTimezone} />
      </div>
      <div className={styles.controls}>
        <BaseTimePicker
          baseTime={baseTime}
          onBaseTimeChange={onBaseTimeChange}
          use24h={use24h}
          isLive={isLive}
        />
        <Settings use24h={use24h} theme={theme} workStart={workStart} workEnd={workEnd} onSettingsChange={onSettingsChange} />
      </div>
    </header>
  )
}
