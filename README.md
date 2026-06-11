# DemandPilot

A keyword-to-content pipeline tool for managing multi-brand demand generation workflows. Built with Vite, React, TypeScript, Firebase Auth, and Firestore.

## Current Features

- **Keyword Lab**: Manually add and organize keyword targets by brand, geography, audience, and intent. Stored in Firestore.
- **Content Studio**: Generate content drafts from selected keywords. Supports multiple content types (LinkedIn Post, SEO Article, Ad Copy, Podcast Script, etc.).
- **LinkedIn Publisher**: Write, preview, copy, and track LinkedIn posts with a manual publishing workflow. Paste the live LinkedIn URL to record publishing status.
- **Content Library**: Browse, search, filter, and edit all saved content drafts and published posts. Archive and status management included.
- **Calendar / Timeline**: Visual monthly calendar showing content planned or created dates with brand-color-coded chips.
- **Brand Settings**: Configure brand voice, audience, CTAs, and forbidden content for ApexHRM, CV Pro, and 1BT.
- **Integration Hub / Connectors**: View all current and planned integrations with honest status indicators (Live, Access Pending, Manual Export, Disconnected).

## Tech Stack

- **Frontend**: React 19 + TypeScript 5.8 + Vite 6
- **Styling**: Tailwind CSS v4
- **Authentication**: Firebase Auth (Google Sign-In)
- **Database**: Cloud Firestore (per-user collections)
- **UI Libraries**: Framer Motion, Lucide React, Sonner (toasts)
- **Routing**: React Router DOM v7

## Architecture

- Firebase Auth handles user identity via Google OAuth
- All user data (keywords, content, connectors, brand settings) is stored in Firestore under `users/{uid}/`
- Real-time Firestore listeners keep the UI synced
- No server-side processing — fully client-side SPA

## Running Locally

```bash
npm ci
npm run dev
```

The dev server starts at `http://localhost:3000`.

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

## Known Limitations

- **LinkedIn publishing is manual**: There is no LinkedIn API integration. Users copy post content and paste it into LinkedIn directly.
- **Google Keep export is gated**: The Keep API requires Workspace Admin verification. The connector is visible but not active.
- **Google Workspace connectors are pending**: Drive, Sheets, Docs, Gmail, Calendar connectors are shown as "Access Pending" and do not function yet.
- **No AI generation backend**: Content generation uses template-based drafts from user-provided keywords. Real AI generation (Gemini) is planned but not yet integrated.
- **No analytics**: Search Console, GA4, and Google Ads integrations are planned but not connected.
- **Single-chunk bundle**: The production build outputs a single large JS bundle. Code splitting is recommended for production scale.

## Planned Features

- Gemini AI-powered content generation
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
└── package.json
```
