# CycleHabits — CLAUDE.md

Instructions for Claude Code to work on this project.

## Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind v4
- **UI**: `@awakr/awake-ui` (custom design system)
- **State/Data**: TanStack Query v5 + Firebase Firestore
- **Auth**: Firebase Authentication
- **i18n**: i18next (pt, en, es) — files in `src/locales/`
- **Router**: React Router v7
- **Push notifications**: OneSignal (`react-onesignal`) + Firebase Cloud Functions
- **Deploy**: Cloudflare Pages (frontend) + Firebase Functions (backend)
- **Tests**: Vitest

## Project structure

```
src/
  pages/          # dashboard, habits, history, login, profile, settings, stats
  hooks/          # Firestore mutations and queries
  contexts/       # AuthContext, HabitsContext
  lib/
    firebase/     # auth.ts, profile.ts, firestore client
    onesignal.ts  # OneSignal SDK initialization
  locales/        # pt.json, en.json, es.json
  types/          # habit.ts and other shared types
  components/     # reusable components
functions/
  src/
    index.ts                  # Cloud Functions entry point
    habitNotifications.ts     # onHabitWrite + weeklyNotificationRefresh
    lib/onesignal.ts          # OneSignal REST API client
```

## Firestore

Habit path: `/users/{userId}/habits/{habitId}`

Relevant habit fields:
- `name`, `description`, `frequency`, `category`
- `startDate`, `expiresAt`, `startTime`, `endTime`
- `notification: boolean`, `notificationTime?: string` (HH:MM, America/Sao_Paulo timezone)
- `notificationSchedule: Record<string, string>` — map of YYYY-MM-DD → OneSignal notification ID
- `userId`, `createdAt`, `archivedAt`

## Conventions

- Clean code at all times — no commented-out code, no unnecessary logic
- Components in PascalCase, hooks in camelCase with `use` prefix
- Each hook is responsible for a single data operation
- All UI text via `t('key')` from i18next — never hardcoded
- Mobile layout must never be affected by desktop changes
- Frontend environment variables: `VITE_` prefix in `.env`
- Functions environment variables: `functions/.env` (no prefix)
- Secrets (e.g. REST API keys): Firebase Secret Manager via `defineSecret`

## Commands

```bash
# Frontend
npm run dev          # dev server
npm run build        # production build
npm run test         # run tests with Vitest
npm run lint         # ESLint

# Cloud Functions
cd functions
npm run build        # compile TypeScript
firebase deploy --only functions   # deploy functions

# Secrets
firebase functions:secrets:set ONESIGNAL_REST_API_KEY
firebase functions:secrets:access ONESIGNAL_REST_API_KEY
```

## Environment variables

Frontend (`.env`):
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_ONESIGNAL_APP_ID
```

Functions (`functions/.env`):
```
ONESIGNAL_APP_ID
```

Secret Manager:
```
ONESIGNAL_REST_API_KEY
```
