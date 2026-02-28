/** Custom event dispatched when favorites change (triggers grid refresh). */
export const FAVORITES_EVENT = 'oclocked-favorites-update'

/** Display order for region sections in the grid and sidebar. */
export const REGION_ORDER = ['Europe', 'Americas', 'Asia', 'Africa', 'Oceania', 'Other'] as const

/** localStorage keys (oclocked- prefix for consistency). */
export const STORAGE_KEYS = {
  favorites: 'oclocked-favorites',
  settings: 'oclocked-settings',
} as const

/** Legacy keys for migration from previous "zonest" naming. */
export const LEGACY_STORAGE_KEYS = {
  favorites: 'zonest-favorites',
  settings: 'zonest-settings',
} as const
