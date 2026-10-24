# NómadaLingo

A social app for nomads to meet people, discover events, and chat — built with Expo.

Available in **Spanish** and **English**.

## Features

- **Home** — a feed of what's happening around you
- **Events** — browse and open event details
- **People** — discover other nomads and view profiles
- **Inbox** — direct messages with a per-conversation chat screen
- **Profile** — edit your profile, manage privacy, delete your account
- **Auth** — email sign-in with verification, plus Sign in with Apple on iOS
- **Onboarding** — guided first-run setup
- **Installable web app** — PWA build with offline support

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Expo SDK 57 / React Native 0.86 |
| Routing | Expo Router (file-based, typed routes) |
| Language | TypeScript |
| Styling | uniwind (Tailwind CSS v4 for React Native) + HeroUI Native |
| Data | TanStack Query + Zustand |
| Backend | Supabase (`@supabase/supabase-js`) |
| Maps | `react-native-maps` on native, `pigeon-maps` on web |
| Analytics | PostHog (web) |

## Getting started

```sh
npm install
npx expo start
```

### Environment variables

The app talks to Supabase and needs two public values. Create a `.env` file in
the project root:

```sh
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key
```

`EXPO_PUBLIC_*` variables are inlined into the bundle at build time, so they must
be present both locally and in the EAS environment used for production builds.

Set them on EAS with:

```sh
eas env:set --name EXPO_PUBLIC_SUPABASE_URL --value "https://..." --environment production --visibility plaintext
eas env:set --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "..." --environment production --visibility sensitive
```

## Backend

The database schema, row-level security policies, triggers and RPCs live in
`supabase/migrations/`. Apply them to a Supabase project with:

```sh
supabase link --project-ref <ref>
supabase db push
```

Account deletion runs as an Edge Function (required by the App Store):

```sh
supabase functions deploy delete-account
```

Events and member profiles are managed in the Supabase Table Editor.

## Running on a device

The project ships a development client (`expo-dev-client`), so native builds can
load JavaScript from your local Metro server:

```sh
npx expo start --dev-client
```

Build a development client with EAS:

```sh
eas build --profile development --platform ios
eas build --profile development --platform android
```

## Building and launching

The app uses a **static** `app.json` manifest so that hosted workflows (such as
Expo Launch) can read and update app settings.

Launch it from GitHub at [launch.expo.dev](https://launch.expo.dev/), or build
and submit from the CLI:

```sh
eas build --profile production --platform ios
eas submit --profile production --platform ios
```

Build profiles live in `eas.json`:

| Profile | Purpose |
| --- | --- |
| `development` | Dev client + internal distribution |
| `preview` | Internal distribution for testing |
| `production` | Store builds |

## Web

```sh
npm run export:web     # static SPA export into dist/
npm run build:pwa      # export + Workbox service worker for offline support
```

Deploy the exported bundle to any static host, or to EAS Hosting:

```sh
npx expo export --platform web
eas deploy --prod
```

## Project structure

```
app/                 Expo Router routes
  (auth)/            Sign-in, verification, onboarding
  (tabs)/            Home, Events, People, Inbox, Profile
  chat/[id].tsx      Conversation
  event/[id].tsx     Event detail
  person/[id].tsx    Person detail
  settings/          Account, privacy, terms, support
components/          Shared UI
lib/                 Auth, data access, i18n, analytics, brand tokens
scripts/             Brand asset generation, CSS linting
public/              PWA icons and static files
assets/              Images and generated native brand assets
```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run ios` / `npm run android` | Run a native build locally |
| `npm run export:web` | Export the web SPA |
| `npm run build:pwa` | Export web + generate the service worker |
| `npm run lint` | Lint with oxlint (type-aware) |
| `npm run format` | Format with oxfmt |
