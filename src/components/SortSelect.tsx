import { useState, useEffect, useRef } from 'react'
import type { SortOption } from '../utils/timezone'
import styles from './SortSelect.module.css'

const OPTIONS: { value: SortOption; label: string; title?: string }[] = [
  { value: 'default', label: 'By population', title: 'Ordered by city population (city size)' },
  { value: 'alphabetical', label: 'Alphabetical' },
]

interface SortSelectProps {
  value: SortOption
  onChange: (v: SortOption) => void
}

/** Dropdown for selecting timezone sort order (by population, alphabetical). */
export function SortSelect({ value, onChange }: SortSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const current = OPTIONS.find((o) => o.value === value)
  const label = current?.label ?? value
  const sortHint = current?.title

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={sortHint ?? 'Sort timezones'}
        title={sortHint}
      >
        <span className={styles.label}>{label}</span>
        <span className={styles.caret} aria-hidden />
      </button>
      {isOpen && (
        <div
          className={styles.dropdown}
          role="listbox"
          aria-activedescendant={`sort-${value}`}
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              id={`sort-${opt.value}`}
              aria-selected={value === opt.value}
              className={`${styles.option} ${value === opt.value ? styles.optionActive : ''}`}
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
