# OClocked

Timezone dashboard built with React, TypeScript, and the Intl API. Compare times, plan meetings across zones, and convert between timezones — all client-side with zero backend.

## Features

- **Timezone grid** — Popular, Favorites, and All tabs with cards showing local time, UTC offset, DST status, and day/night indicator
- **Meeting Planner** — 24h timeline for visualizing work hour overlap across up to 6 timezones, with configurable work hours
- **Converter** — Quick conversion between common timezone abbreviations (EST, UTC, PST, CET, JST, etc.)
- **Click-to-copy** — Click any card's time to copy; Shift+click for UTC offset format
- **Search** — Find and add any IANA timezone
- **Time shift** — Drag slider to compare times across all zones simultaneously
- **Preferences** — 12h/24h format, light/dark/system theme, custom work hours — all persisted in localStorage

## Stack

- **React 19** with strict mode, `memo`, and hook-based state management
- **TypeScript 5.9** with strict compiler flags (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`)
- **Vite 7** for dev server (HMR) and production bundling
- **CSS Modules** with custom properties for theming (light/dark/system)
- **Intl API** (`DateTimeFormat`, `supportedValuesOf`) for timezone resolution, offset calculation, and DST detection — no third-party date libraries
- **localStorage** for client-side persistence (settings, favorites, planner state)

## Getting Started

```bash
npm install
npm run dev       # dev server on localhost
npm run build     # type-check + production build to dist/
```

Deploy `dist/` to any static host. Requires SPA redirect (`/* -> /index.html`).

## License

This project is licensed under the **GNU General Public License v3.0 (GPLv3)**.

Copyright (c) 2026 Ioannis E. Kosmadakis

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
