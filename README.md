# Pocket Balance

Pocket Balance is a small Expo app for local expense tracking on iPhone.

## Project Surface Status

Pocket Balance currently targets a local-first MVP:

- no auth
- no backend dependency
- no sync
- no push notifications
- no IAP/paywall
- no social auth
- on-device storage only

## Current App Shape

- `/` redirects into the expense tracker tabs.
- `/` in tabs shows the current balance, starting balance editor, and recent transactions.
- `/transactions` creates income/expense records and lists the full transaction history.
- `/categories` manages categories and nested subcategories for both income and expense flows.
- Data is stored on-device through Expo SecureStore.
- App screens should use `src/components/screen.tsx` for safe-area handling, standard spacing, scroll/non-scroll layout, keyboard avoidance, and consistent optional back navigation.

## Stack

- Expo SDK 55
- React Native
- TypeScript
- Expo Router
- Expo SecureStore
- Zod
- Native ShadCN-style UI primitives in `src/components/ui`

## Commands

```bash
bun run dev
bun run android
bun run ios
bun run typecheck
bun run lint
```

## Development Build

1. Sign up or log in to an Expo account.
2. Check EAS CLI availability with `bunx eas-cli --version`.
3. Log in with `bunx eas-cli login`.
4. Link the project with `bunx eas-cli project:init`.
5. Build a development build:

```bash
bunx eas-cli build --profile development --platform android
bunx eas-cli build --profile development --platform ios
```

`expo-dev-client` is installed for local iPhone development. If you want daily use without a Mac dev server, build and install a release app instead of using the dev client.

## Repo Shape

- `src/app` contains routes and screens.
- `src/lib/budget.tsx` owns the app state and storage orchestration.
- `src/lib/budget-store.ts` contains storage, schemas, and budget calculations.
- `src/components/ui` contains the native UI primitives still used by the app.
- `tests` contains focused Bun tests for local logic and UI helpers.

## Practice

The source of truth is local on-device state in `src/lib/budget.tsx`.

Mobile UI primitives live in `src/components/ui` and keep a consistent file naming scheme across the app. They are React Native-first implementations using native style props, controlled/uncontrolled values, and native touch patterns instead of DOM-style props such as `className` or `asChild`.

Render visible text through `src/components/ui/typography.tsx`. `Typography` owns the mobile type scale from `h1` through `h6` plus body, caption, label, button, link, and code text variants; screens and UI primitives should not import React Native `Text` directly or use legacy text wrappers.

## Current Upstream Documentation

For Expo, React Native, routing, secure storage, or EAS questions, consult the current upstream documentation linked here first. This README describes this app's conventions; upstream docs are authoritative for platform behavior.

- [Expo docs](https://docs.expo.dev/)
- [Expo SDK 55 docs](https://docs.expo.dev/versions/latest/)
- [Expo Router docs](https://docs.expo.dev/router/introduction/)
- [Expo SecureStore docs](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Expo EAS docs](https://docs.expo.dev/eas/)
- [EAS Build docs](https://docs.expo.dev/build/introduction/)
- [React Native docs](https://reactnative.dev/docs/getting-started)
- [Zod docs](https://zod.dev/)
