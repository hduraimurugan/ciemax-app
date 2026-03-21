# Architecture

## Overview

CineBook uses a **feature-sliced architecture** — code is organised by domain (movies, seats, booking) rather than by technical layer (components, services, utils). This keeps each feature self-contained and prevents the "god folder" problem where a single `components/` or `screens/` directory grows unbounded.

---

## Full Folder Tree

```
src/
├── app/
│   └── navigation/
│       ├── RootNavigator.tsx      # Stack navigator — owns the full screen hierarchy
│       ├── TabNavigator.tsx       # Bottom tab navigator — nested inside RootNavigator
│       └── index.ts
│
├── constants/
│   ├── theme.ts                   # Single source of truth for all design tokens
│   ├── config.ts                  # App-level config (app name, seat pricing, mock flags)
│   └── index.ts
│
├── types/
│   ├── models.ts                  # All domain TypeScript interfaces
│   ├── navigation.ts              # RootStackParamList, TabParamList
│   └── index.ts
│
├── store/
│   ├── bookingStore.ts            # Zustand store for the active booking flow
│   └── index.ts
│
├── services/
│   ├── moviesService.ts           # Mock: 8 movies, search, now-showing/coming-soon
│   ├── theatresService.ts         # Mock: 5 theatres, 17 shows
│   ├── seatsService.ts            # Mock: deterministic seat grid generator
│   ├── bookingService.ts          # Mock: in-memory booking CRUD
│   ├── offersService.ts           # Mock: 4 coupons + validator
│   └── index.ts
│
├── hooks/
│   ├── useMovies.ts               # Wraps moviesService with loading/error state
│   ├── useTheatres.ts             # useTheatresForMovie + useShowsForMovieTheatre
│   ├── useSeatLayout.ts           # Wraps seatsService with loading/error state
│   └── index.ts
│
├── shared/
│   ├── ui/
│   │   ├── Typography.tsx         # DisplayText, Heading1-3, Body, BodySmall, Caption, Label
│   │   ├── Button.tsx             # primary / secondary / ghost / danger / emerald, 3 sizes
│   │   ├── Card.tsx               # variant: default | glass | neon
│   │   ├── Badge.tsx              # default / accent / success / error / warning / info / violet / zinc
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── Loader.tsx
│   │   ├── AdBanner.tsx           # Auto-playing carousel (aspect-[5/1], dot indicators)
│   │   ├── CountdownTimer.tsx     # Amber→red pulsing countdown (used in OrderSummary)
│   │   ├── QRCode.tsx             # Wraps react-native-qrcode-svg
│   │   └── index.ts
│   └── utils/
│       ├── formatters.ts
│       └── index.ts
│
└── features/
    ├── movies/
    │   ├── components/
    │   │   ├── MovieCard.tsx
    │   │   └── MovieFilter.tsx
    │   ├── screens/
    │   │   ├── MoviesScreen.tsx
    │   │   └── MovieDetailScreen.tsx
    │   ├── types.ts
    │   └── index.ts               # Barrel export — public surface of this feature
    │
    ├── theatres/
    │   ├── components/
    │   │   ├── TheatreCard.tsx
    │   │   └── ShowTimeChip.tsx
    │   ├── screens/
    │   │   ├── TheatresScreen.tsx
    │   │   ├── AllTheatresScreen.tsx
    │   │   └── ShowSelectionScreen.tsx
    │   ├── types.ts
    │   └── index.ts
    │
    ├── seats/
    │   ├── components/
    │   │   ├── SeatGrid.tsx        # Pure renderer — no logic
    │   │   ├── SeatItem.tsx        # Single seat circle
    │   │   ├── SeatLegend.tsx      # Available / Selected / Booked key
    │   │   └── SectionHeader.tsx   # PREMIUM / GOLD / SILVER divider
    │   ├── screens/
    │   │   └── SeatSelectionScreen.tsx
    │   ├── types.ts
    │   └── index.ts
    │
    ├── booking/
    │   ├── components/
    │   │   └── PriceBreakdown.tsx
    │   ├── screens/
    │   │   ├── OrderSummaryScreen.tsx
    │   │   ├── PaymentScreen.tsx
    │   │   ├── BookingSuccessScreen.tsx
    │   │   └── BookingFailureScreen.tsx
    │   └── index.ts
    │
    ├── auth/
    │   ├── screens/
    │   │   ├── LoginScreen.tsx
    │   │   └── RegisterScreen.tsx
    │   └── index.ts
    │
    ├── profile/
    │   ├── screens/
    │   │   ├── ProfileScreen.tsx
    │   │   └── MyBookingsScreen.tsx
    │   └── index.ts
    │
    └── offers/
        ├── screens/
        │   └── OffersScreen.tsx
        └── index.ts
```

---

## Layer Responsibilities

### `src/app/`
Bootstrap and navigation wiring. Contains no business logic or UI primitives. `App.tsx` at the root imports only from here.

### `src/constants/`
The single source of truth for all magic numbers and strings. No component should hardcode a colour hex or pixel value — it must come from `theme.ts`.

### `src/types/`
Pure TypeScript — no runtime code. All domain interfaces (`Movie`, `Seat`, `Booking`, etc.) and navigation param lists live here. Every other layer imports from `@ctypes/*`.

### `src/store/`
Global client state using Zustand. Only used for **transient booking flow state** (the current selection in progress). Persisted or server-side state belongs in services.

### `src/services/`
The data abstraction layer. All functions are `async` and return typed interfaces. Currently mocked; replacing with real API calls requires changes only here — zero impact on hooks, store, or UI.

```
// Mock today
export async function getMovies(): Promise<Movie[]> {
  await delay(500);
  return MOCK_MOVIES;
}

// Real API tomorrow — same signature, same callers
export async function getMovies(): Promise<Movie[]> {
  const res = await fetch('/api/v1/movies');
  return res.json();
}
```

### `src/hooks/`
Wraps service calls with `loading`, `error`, and `refresh` state. Screens import hooks, not services directly. This keeps async lifecycle management out of components.

### `src/shared/`
Framework-agnostic, domain-agnostic code:
- `ui/` — reusable visual primitives driven entirely by `theme.ts`
- `utils/` — pure functions (formatters, date helpers)

Nothing in `shared/` imports from `features/`.

### `src/features/`
Domain-bounded modules. The rule: **a feature may import from `shared/`, `hooks/`, `services/`, `store/`, `constants/`, and `types/` — but never from another feature**.

Each feature exposes exactly one `index.ts` barrel. The navigator imports from `@features/movies`, never from `@features/movies/screens/MoviesScreen`.

---

## Barrel Export Pattern

Every folder with multiple files exposes an `index.ts`:

```ts
// src/features/movies/index.ts
export { MoviesScreen } from './screens/MoviesScreen';
export { MovieDetailScreen } from './screens/MovieDetailScreen';
export { MovieCard } from './components/MovieCard';
export type { MovieTab } from './types';
```

Consumers always import from the feature root:
```ts
import { MoviesScreen, MovieCard } from '@features/movies';
```

This gives you the freedom to move, rename, or refactor internal files without breaking any import outside the feature.

---

## Dependency Rules (enforced by architecture, not lint yet)

```
features  →  shared, hooks, services, store, constants, types
hooks     →  services, types
store     →  types
services  →  types, constants
shared    →  constants, types
```

No circular dependencies. No feature importing from another feature.

---

## Scaling Guide

### Adding a new feature

1. Create `src/features/<name>/` with the standard sub-structure:
   ```
   <name>/
     components/
     screens/
     hooks/       (feature-specific hooks, if needed)
     types.ts
     index.ts
   ```
2. Add mock data to `src/services/<name>Service.ts`
3. Add screens to `RootNavigator` or `TabNavigator`
4. Export from the feature's `index.ts`

### Adding a new screen to an existing feature

1. Create the screen file in `features/<name>/screens/`
2. Add it to `RootStackParamList` in `src/types/navigation.ts`
3. Register it in `RootNavigator.tsx`
4. Export it from the feature's `index.ts`

### Connecting a real backend

1. Replace mock data in `src/services/` — keep function signatures identical
2. Remove `MockDelay` calls
3. Add error handling / retry logic in hooks if needed
4. Add auth token injection (e.g. an axios interceptor) in a new `src/services/httpClient.ts`

No UI, store, or navigation changes required.
