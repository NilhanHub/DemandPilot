# DemandPilot Agent Operating Rules

Read this file before changing anything in this repository.

## Project Shape

- DemandPilot is a React + Vite + TypeScript + Tailwind app with Firebase and a small Node/Express server surface.
- Important Firebase-related files include `src/lib/firebase.ts`, `firestore.rules`, and `firebase-applet-config.json`.
- Treat visible integration surfaces as unverified until the code and tests prove they are wired.

## First Pass

- Run `git status --short` and preserve unrelated user changes.
- Inspect `package.json`, lockfiles, Vite/Tailwind/TypeScript config, Firebase files, routes/components, tests, and README notes before editing.
- Use `rg`/`rg --files` for searches and prefer existing scripts over new ad hoc commands.
- Use the `react-vite-firebase-webapps` skill for React/Vite/Firebase work.

## Secret and Live-State Hygiene

- Never print raw env values, Firebase secrets, API keys, OAuth tokens, cookies, or service-account JSON.
- Report env facts as present, absent, placeholder, secret reference, or unknown.
- Inspect Firebase state read-only first. Ask before changing Auth users, Firestore data/rules, Storage, Hosting, or project settings unless the user explicitly requested the mutation.
- For Firebase Auth local work, authorized domains are `localhost` and `127.0.0.1`; host and port are tested separately in the local app URL.

## Verification Defaults

- Prefer `npm run lint`, `npm test`, `npm run build`, and `npm run typecheck` when available and relevant.
- For targeted changes, run the closest existing test script and explain any skipped broader checks.
- For UI changes, verify rendered behavior with Browser first; use Playwright when Browser is unavailable or a test artifact requires it.
