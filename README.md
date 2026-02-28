# OClocked

A minimal timezone dashboard for viewing and comparing time zones across the world.

## Overview

OClocked provides a clean interface to browse cities by region, compare local times, and manage favorite timezones. All lists are ordered by city population (metro area) unless sorted alphabetically.

## Features

- **Popular tab**: Curated cities (Europe 21, Americas 21, Asia 12, Africa 9, Oceania 6)
- **All tab**: Extended list (Europe 84, Americas 51, Asia 40, Africa 27, Oceania 15)
- **Favorites**: Save timezones for quick access; persisted in localStorage
- **Search**: Add any IANA timezone via inline search
- **Base time**: Live mode or custom date/time; 12h and 24h format
- **Sort**: By population or alphabetical
- **Theme**: Light, dark, or system preference
- **Responsive**: Collapsible sidebar on smaller screens; mobile-friendly layout

## Tech Stack

- React, TypeScript
- Vite
- Intl API
- CSS Modules, CSS custom properties
- localStorage (for favorites and settings)

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
  constants.ts    Shared constants (events, region order, storage keys)
  data/           Timezone lists (popular, all) and lookup map
  store/          localStorage stores (favorites, settings) with legacy migration
  types/          TypeScript interfaces
  utils/          Timezone formatting, validation, and search
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
