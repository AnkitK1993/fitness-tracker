# Fitness Tracker

Personal fitness tracker with multi-user support: body-weight trends, strength sessions
(push / pull / legs / core / custom splits with an exercise library, rep- and time-based sets),
cardio logging with live Bluetooth heart-rate capture, charts, and a weekly dashboard.

Built with React + Vite + TypeScript, Firebase (Auth + Firestore), and recharts.

## One-time setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Build → Authentication → Sign-in method**: enable **Email/Password**.
3. **Build → Firestore Database**: create a database (production mode).
4. **Project settings → Your apps**: add a **Web app**, copy the config values.
5. Copy `.env.example` to `.env.local` and paste the values.
6. Publish security rules: paste `firestore.rules` in the Firestore **Rules** tab
   (or `firebase deploy --only firestore` with the Firebase CLI).

## Develop

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build          # typecheck + production bundle in dist/
firebase deploy        # optional: Firebase Hosting + rules + indexes
```

## Notes

- All measurements are stored in metric (kg / km); the kg↔lb and km↔mi setting only changes display.
- The per-exercise progress chart needs one composite index (`firestore.indexes.json`).
  Without the CLI, Firestore prints a one-click index-creation link in the browser console
  the first time you open the Progress chart.
- Live heart rate uses Web Bluetooth (standard BLE Heart Rate Service — chest straps,
  Polar/Garmin HR broadcast mode). Chrome/Edge on desktop or Android only; on other browsers
  the app falls back to manual heart-rate entry. Apple Watch/Fitbit don't expose BLE HR to browsers.
