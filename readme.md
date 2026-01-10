# Waymarker

Create beautiful, personalized map posters from your adventures. Upload GPX routes, connect Strava, customize styles, and export high-resolution prints.

**Live site**: [waymarker.eu](https://waymarker.eu) *(coming soon)*

## Features

- **11 Map Styles** with 15+ color palettes
- **GPX Route Upload** with color, width, opacity & dash patterns
- **Strava Connect** - Import activities directly from your account
- **3D Terrain** elevation with MapTiler terrain-rgb tiles
- **3D Buildings** with style presets & perspective controls
- **High-res Export** up to 7200x10800px (24x36" at 300 DPI)
- **Social Features** - Feed, likes, comments, sharing

## Gallery

| ![Chesapeake Bay](frontend/public/examples/chesapeke-poster.png) | ![Denver](frontend/public/examples/denver-poster.png) |
|:---:|:---:|
| **Chesapeake Bay** | **Denver** |
| ![Hawaii](frontend/public/examples/hawaii-poster.png) | ![Reggio Calabria](frontend/public/examples/reggio-calabria-poster.png) |
| **Hawaii** | **Reggio Calabria** |

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Map**: MapLibre GL JS + React Map GL
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Tiles**: OpenFreeMap / MapTiler

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPTILER_KEY=your-maptiler-key
```

## Attribution

This project is a fork of [carto-art](https://github.com/kkingsbe/carto-art) by [Kyle Kingsberry](https://github.com/kkingsbe).

## License

[AGPL-3.0](LICENSE) - See the original project for the full license terms.
