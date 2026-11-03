# CycleHabits

A PWA for tracking daily habits — vitamins, workouts, routines, and any recurring activity.

## Features

- Create and manage habits with configurable frequency and date range
- Daily dashboard with progress and activity log
- History and statistics
- Push notifications (via OneSignal) scheduled per habit
- Multi-language support: Portuguese, English, and Spanish
- PWA — installable on mobile and desktop

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 + awake-ui |
| Data | Firebase Firestore + TanStack Query |
| Auth | Firebase Authentication |
| Notifications | OneSignal + Firebase Cloud Functions |
| Deploy | Cloudflare Pages + Firebase Functions |

## Getting started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Create a `.env` file at the root with your Firebase and OneSignal credentials (see `CLAUDE.md`).

> Push notifications only work in production (`https://cyclehabits.app`) — OneSignal validates the registered domain.

## Deployment

The frontend is automatically deployed to Cloudflare Pages on every push to the main branch.

Cloud Functions are deployed manually:

```bash
cd functions && firebase deploy --only functions
```

## License

Personal project — all rights reserved.
