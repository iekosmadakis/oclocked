# OClocked

A timezone dashboard for viewing, comparing, and converting time zones across the world.

## Overview

OClocked provides a dense, developer-focused interface to browse cities by region, compare local times, convert between timezones, and plan meetings across time zones. All lists are ordered by city population (metro area) unless sorted alphabetically.

## Features

- **Popular tab**: Curated cities across Europe, Americas, Africa, Asia, and Oceania
- **All tab**: Extended list of cities across all regions
- **Favorites**: Save timezones for quick access; persisted in localStorage
- **Search**: Add any IANA timezone via inline search
- **Timezone converter**: Convert between common timezone abbreviations (EST, UTC, PST, etc.) in the sidebar
- **Meeting planner**: Drag a time slider to shift all cards simultaneously and find overlapping hours
- **Time difference**: Each card shows relative offset from your local time (+3h, -5h, same)
- **Base time**: Live mode or custom date/time; 12h and 24h format
- **Sort**: By population or alphabetical
- **Theme**: Light, dark, or system preference
- **Responsive**: Collapsible sidebar on desktop; mobile-friendly layout

## Tech Stack

- React, TypeScript
- Vite
- Intl API
- CSS Modules, CSS custom properties
- localStorage

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output is written to `dist/`. Preview locally:

```bash
npm run preview
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run TypeScript check only |

## Deployment

Deploy the `dist/` directory to any static host. Configure redirects so all routes serve `index.html` (SPA).

**Redirect rules:**

- **Apache** (`.htaccess`): `RewriteRule ^ index.html [L]`
- **Nginx**: `try_files $uri $uri/ /index.html;`
- **Netlify** (`_redirects`): `/* /index.html 200`
- **Firebase** (`firebase.json`): `"rewrites": [{"source": "**", "destination": "/index.html"}]`

For subdirectory deployment, set `base` in `vite.config.ts` before building.

## Project Structure

```
src/
  components/     UI components (TopBar, TimezoneGrid, Sidebar, etc.)
  hooks/          Shared hooks (useClickOutside)
  constants.ts    Shared constants (events, region order, storage keys)
  data/           Timezone lists (popular, all) and lookup map
  store/          localStorage stores (favorites, settings) with legacy migration
  types/          TypeScript interfaces
  utils/          Timezone formatting, conversion, validation, and search
  App.tsx         Root component
  main.tsx        Entry point
  index.css       Global styles and design tokens
```

## License

This project is licensed under the **GNU General Public License v3.0 (GPLv3)**.

Copyright (c) 2026 Ioannis E. Kosmadakis

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see https://www.gnu.org/licenses/.
