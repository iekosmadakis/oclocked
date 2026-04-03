import { useState, useEffect, useCallback } from 'react'
import { AppShell } from './components/AppShell'
import type { TabId } from './components/SegmentedTabs'
import type { TimezoneItem } from './types/timezone'
import type { SortOption } from './utils/timezone'
import { getSettings } from './store/SettingsStore'

/** Resolves user IANA timezone via Intl API. */
function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'
  } catch {
    return 'UTC'
  }
}

/** Resolves system theme to concrete light or dark. */
function resolveTheme(theme: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return theme
}

/** Applies theme by setting data-theme on the document root. */
function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme)
}

/** Root component: state, theme, base time, and AppShell. */
export function App() {
  const [baseTime, setBaseTime] = useState(() => new Date())
  const [isLive, setIsLive] = useState(true)
  const [settings, setSettings] = useState(getSettings)
  const [activeTab, setActiveTab] = useState<TabId>('popular')
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [customTimezones, setCustomTimezones] = useState<TimezoneItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userTimezone] = useState(getUserTimezone)

  const theme = resolveTheme(settings.theme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (settings.theme === 'system') {
        applyTheme(mq.matches ? 'dark' : 'light')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [settings.theme])

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!isLive) return
    /* 1s when visible, 60s when tab hidden (saves CPU/battery) */
    const tick = () => setBaseTime(new Date())
    let id: ReturnType<typeof setInterval> | null = null
    const schedule = (ms: number) => {
      if (id) clearInterval(id)
      id = setInterval(tick, ms)
    }
    const onVisibilityChange = () => {
      schedule(document.hidden ? 60000 : 1000)
    }
    onVisibilityChange()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      if (id) clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [isLive])

  const handleBaseTimeChange = useCallback((date: Date, isLive: boolean) => {
    setBaseTime(date)
    setIsLive(isLive)
  }, [])

  const handleAddTimezone = useCallback((item: TimezoneItem) => {
    setCustomTimezones((prev) =>
      prev.some((t) => t.id === item.id) ? prev : [...prev, item]
    )
  }, [])

  return (
    <AppShell
      baseTime={baseTime}
      onBaseTimeChange={handleBaseTimeChange}
      isLive={isLive}
      use24h={settings.use24h}
      theme={settings.theme}
      workStart={settings.workStart}
      workEnd={settings.workEnd}
      onSettingsChange={setSettings}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      sortBy={sortBy}
      onSortChange={setSortBy}
      customTimezones={customTimezones}
      onAddTimezone={handleAddTimezone}
      isLoading={isLoading}
      userTimezone={userTimezone}
    />
  )
}
