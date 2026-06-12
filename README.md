# DemandPilot

A keyword-to-content pipeline tool for managing multi-brand demand generation workflows. Built with Vite, React, TypeScript, Firebase Auth, Firestore, and a lightweight local Express API for server-side connector calls.

## Current Features

- **Keyword Lab**: Manually add and organize keyword targets by brand, geography, audience, and intent. Stored in Firestore.
- **Campaign Builder (MVP)**: Features a simplified campaign workflow where users provide a brand, output type, keyword source (paste/screenshot/CSV), and intent instruction. Text and CSV sources route through the local Express AI proxy when `GEMINI_API_KEY` is configured server-side; otherwise a manual draft fallback is provided. Screenshot parsing is not active.
- **LinkedIn Publisher**: Write, preview, copy, and track LinkedIn posts with a manual publishing workflow. Paste the live LinkedIn URL to record publishing status.
- **Content Library**: Browse, search, filter, and edit all saved content drafts and published posts. Archive and status management included.
- **Calendar / Timeline**: Visual monthly calendar showing content planned or created dates with brand-color-coded chips.
- **Brand Settings**: Configure brand voice, audience, CTAs, and forbidden content for ApexHRM, CV Pro, and 1BT.
- **Integration Hub / Connectors**: View all current and planned integrations with honest status indicators (Live, Access Pending, Manual Export, Disconnected).

## Tech Stack

- **Frontend**: React 19 + TypeScript 5.8 + Vite 6
- **Local API**: Express server for secure AI and publishing connector calls
- **Styling**: Tailwind CSS v4
- **Authentication**: Firebase Auth (Google Sign-In)
- **Database**: Cloud Firestore (per-user collections)
- **UI Libraries**: Framer Motion, Lucide React, Sonner (toasts)
- **Routing**: React Router DOM v7

## Architecture

- Firebase Auth handles user identity via Google OAuth
- All user data (keywords, content, connectors, brand settings) is stored in Firestore under `users/{uid}/`
- Real-time Firestore listeners keep the UI synced
- Vite serves the frontend on port `3000` and proxies `/api/*` to the local Express server on port `3001`
- Server-side API routes keep Gemini and publishing credentials out of the Vite frontend bundle

## Running Locally

```bash
npm ci
npm run dev
```

The dev server starts the Express API on `http://localhost:3001` and the Vite app on `http://localhost:3000`.

Optional server-only environment variables are read from `.env`:

```bash
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
LINKEDIN_ACCESS_TOKEN=...
LINKEDIN_AUTHOR_URN=...
WORDPRESS_BASE_URL=...
WORDPRESS_USERNAME=...
WORDPRESS_APP_PASSWORD=...
X_BEARER_TOKEN=...
```

If credentials are omitted, the relevant API route returns `not_configured` and the UI keeps the manual workflow available.

## Building

```bash
npm run build
```

Production output goes to `dist/`.

## Linting / Type Checking

```bash
npm run lint
```

Runs `tsc --noEmit` to type-check without emitting files.

## Testing

```bash
npm test
```

Runs Vitest unit tests.

## Evidence Policy

All command logs, extraction tests, and audits are saved to the local `Evidence/` folder. This folder and its contents (including ZIPs) **MUST NOT** be committed to the repository to maintain repo hygiene.

## Known Limitations

- **LinkedIn publishing is manual**: There is no LinkedIn API integration. Users copy post content and paste it into LinkedIn directly.
- **Google Keep export is gated**: The Keep API requires Workspace Admin verification. The connector is visible but not active.
- **Google Workspace connectors are pending**: Drive, Sheets, Docs, Gmail, Calendar connectors are shown as "Access Pending" and do not function yet.
- **AI generation requires server configuration**: Campaign Builder uses the local Express AI proxy only when `GEMINI_API_KEY` is configured server-side. The frontend does not use or require `VITE_GEMINI_API_KEY`.
- **AI constraints**: When active, AI generation uses *only* user-provided keywords. It does not use live trend data, search volumes, or live LinkedIn analytics.
- **Screenshot parsing is inactive**: OCR and image parsing for keyword screenshots are planned but not configured yet. The UI provides a manual paste fallback.
- **No analytics**: Search Console, GA4, and Google Ads integrations are planned but not connected. There is no live data.
- **Single-chunk bundle**: The production build outputs a single large JS bundle. Code splitting is recommended for production scale.

## Planned Features

- Secure backend setup for Gemini AI generation
- Google Workspace integration (Drive, Sheets, Docs)
- LinkedIn API posting (when approved)
- Search Console / GA4 analytics import
- Multi-user team workflows
- Content scheduling and automated publishing

## Project Structure

```
├── src/
│   ├── App.tsx              # Root component with auth + routing
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles (Tailwind)
│   ├── components/          # Shared UI components
│   │   ├── Layout.tsx       # App shell with sidebar
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   └── ui/              # Reusable UI primitives
│   ├── lib/                 # Utilities
│   │   ├── firebase.ts      # Firebase init + auth
│   │   ├── keep.ts          # Google Keep API (gated)
│   │   └── utils.ts         # Tailwind merge helper
│   ├── pages/               # Route pages
│   ├── store/               # React context (AppContext)
│   └── types/               # TypeScript type definitions
├── firebase-applet-config.json
├── firestore.rules
├── server.js               # Local Express API for AI and publisher connectors
└── package.json
```
