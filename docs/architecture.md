# Architecture

## Overview

CineHall uses a **feature-sliced architecture** — code is organised by domain (movies, seats, booking) rather than by technical layer (components, services, utils). This keeps each feature self-contained and prevents the "god folder" problem where a single `components/` or `screens/` directory grows unbounded.

---

## Full Folder Tree

```
MyApp/
├── metro.config.js                # resolver.unstable_enablePackageExports: false
│                                  # (forces CJS build of lucide-react-native)
│
src/
├── app/
│   └── navigation/
│       ├── RootNavigator.tsx      # Stack navigator — owns the full screen hierarchy
│       ├── TabNavigator.tsx       # Bottom tab navigator — nested inside RootNavigator
│       └── index.ts
│
├── constants/
│   ├── theme.ts                   # DarkColors / LightColors token objects + Spacing/Radius/FontSize/Shadow
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
│   ├── themeStore.ts              # Zustand + persist — dark/light mode, active ColorTokens
│   └── index.ts
│
├── services/
│   ├── moviesService.ts           # Mock: 3 movies (Spider-Man/Odyssey/Jana Nayagan), search
│   ├── theatresService.ts         # Mock: 3 cinemas, showtimes generated per movie × 7 dates
│   ├── seatsService.ts            # Mock: deterministic seat grid generator
│   ├── bookingService.ts          # Mock: in-memory booking CRUD
│   ├── offersService.ts           # Mock: 4 coupons (incl. FIRST50) + validator
│   └── index.ts
│
├── hooks/
│   ├── useMovies.ts               # Wraps moviesService with loading/error state
│   ├── useTheatres.ts             # useTheatresForMovie, useShowsForMovie, useShowsForMovieTheatre
│   ├── useSeatLayout.ts           # Wraps seatsService with loading/error state
│   ├── useTheme.ts                # Thin selector over themeStore: { colors, mode, toggleTheme }
│   ├── useCountdown.ts            # Generic tick-down hook (seconds, onExpire) — shared by
│   │                               # CountdownTimer, OtpScreen's resend timer, Checkout's session timer
│   └── index.ts
│
├── shared/
│   ├── ui/
│   │   ├── Typography.tsx         # DisplayText, Heading1-3, Body, BodySmall, Caption, Label
│   │   ├── Button.tsx             # primary / secondary / ghost / danger / emerald, 3 sizes
│   │   ├── Card.tsx               # variant: default | glass | neon
│   │   ├── Badge.tsx              # default / accent / success / error / warning / info / violet / zinc / gold / silver / premium
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── Loader.tsx
│   │   ├── AdBanner.tsx           # Auto-playing carousel (aspect-[5/1], dot indicators)
│   │   ├── CountdownTimer.tsx     # Amber→red pulsing countdown, built on useCountdown
│   │   ├── QRCode.tsx             # Wraps react-native-qrcode-svg
│   │   └── index.ts
│   └── utils/
│       ├── formatters.ts
│       └── index.ts
│
└── features/
    ├── onboarding/
    │   ├── screens/
    │   │   ├── SplashScreen.tsx        # 2200ms auto-advance to Onboarding
    │   │   └── OnboardingScreen.tsx    # 3-slide carousel, Skip/Next/Get Started
    │   └── index.ts
    │
    ├── auth/
    │   ├── screens/
    │   │   ├── LoginScreen.tsx         # Email input → Otp (no password, no signup tab)
    │   │   ├── OtpScreen.tsx           # 6-digit boxes, 30s resend countdown
    │   │   └── RegisterScreen.tsx      # ⚠ unrouted — no design equivalent, kept for reference
    │   └── index.ts                    # exports LoginScreen, OtpScreen only
    │
    ├── movies/
    │   ├── components/
    │   │   ├── MovieCard.tsx           # variant: 'rating' | 'soon' | 'plain'
    │   │   └── MovieFilter.tsx         # ⚠ built but not wired into any screen
    │   ├── screens/
    │   │   ├── MoviesScreen.tsx        # Home tab — hero carousel + Now Showing/Coming Soon/Recommended
    │   │   └── MovieDetailScreen.tsx
    │   ├── types.ts
    │   └── index.ts
    │
    ├── search/
    │   ├── screens/
    │   │   └── SearchScreen.tsx        # Recent Searches + Trending chips ⇄ live 2-col results grid
    │   └── index.ts
    │
    ├── theatres/
    │   ├── components/
    │   │   ├── TheatreCard.tsx         # ⚠ unrouted — used only by the pre-CineHall screens below
    │   │   └── ShowTimeChip.tsx        # ⚠ unrouted — same
    │   ├── screens/
    │   │   ├── ShowtimesScreen.tsx     # Date strip + per-cinema showtime chips (routed)
    │   │   ├── TheatresScreen.tsx      # ⚠ unrouted — superseded by ShowtimesScreen
    │   │   ├── AllTheatresScreen.tsx   # ⚠ unrouted — old "Theatres" tab, no design equivalent
    │   │   └── ShowSelectionScreen.tsx # ⚠ unrouted — superseded by ShowtimesScreen
    │   ├── types.ts
    │   └── index.ts
    │
    ├── seats/
    │   ├── components/
    │   │   ├── SeatGrid.tsx        # Pure renderer — no logic
    │   │   ├── SeatItem.tsx        # Single seat square
    │   │   ├── SeatLegend.tsx      # Available / Premium / Selected / Booked key
    │   │   └── SectionHeader.tsx   # PREMIUM / STANDARD divider
    │   ├── screens/
    │   │   └── SeatSelectionScreen.tsx
    │   ├── types.ts
    │   └── index.ts
    │
    ├── booking/
    │   ├── components/
    │   │   └── PriceBreakdown.tsx
    │   ├── screens/
    │   │   ├── CheckoutScreen.tsx      # Routed as `Checkout` — single promo-code input (design)
    │   │   ├── OrderSummaryScreen.tsx  # ⚠ unrouted — superseded by CheckoutScreen (had an offer carousel)
    │   │   ├── PaymentScreen.tsx       # Card / UPI / Wallet tabs + processing sub-state
    │   │   ├── BookingSuccessScreen.tsx
    │   │   └── BookingFailureScreen.tsx
    │   └── index.ts
    │
    ├── profile/
    │   ├── screens/
    │   │   ├── ProfileScreen.tsx       # Tab root — avatar, menu, Dark Mode toggle
    │   │   ├── MyBookingsScreen.tsx    # Tab root — Upcoming/Past, cards navigate to TicketDetail
    │   │   └── TicketDetailScreen.tsx  # Full ticket view + Cancel Booking confirm panel
    │   └── index.ts
    │
    └── offers/
        ├── screens/
        │   └── OffersScreen.tsx        # ⚠ unrouted — no design equivalent, promo entry lives in Checkout
        └── index.ts
```

Files marked **⚠ unrouted** compile (they're theme-aware and type-safe) but are not registered in `RootNavigator`/`TabNavigator` — kept on disk rather than deleted per the redesign's "no destructive delete" policy. See [docs/navigation.md](navigation.md) for exactly which screens are live.

---

## Layer Responsibilities

### `src/app/`
Bootstrap and navigation wiring. Contains no business logic or UI primitives. `App.tsx` at the root imports only from here (plus `useTheme` for `StatusBar` styling).

### `src/constants/`
The single source of truth for all magic numbers and strings. `theme.ts` exports `DarkColors`/`LightColors` (typed as `ColorTokens`) instead of a single static `Colors` object — no component should import a flat `Colors` constant or hardcode a colour hex; it must come from `useTheme().colors`.

### `src/types/`
Pure TypeScript — no runtime code. All domain interfaces (`Movie`, `Seat`, `Booking`, etc.) and navigation param lists live here. Every other layer imports from `@ctypes/*`.

### `src/store/`
Global client state using Zustand. `bookingStore` holds **transient booking flow state** (the current selection in progress); `themeStore` holds the **persisted theme mode** and the currently active `ColorTokens` object. Neither talks to a server — persisted or server-side state belongs in services.

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
Wraps service calls with `loading`, `error`, and `refresh` state. Screens import hooks, not services directly. This keeps async lifecycle management out of components. `useTheme` and `useCountdown` are the two theming/timer utility hooks introduced for the CineHall redesign — see [docs/design-system.md](design-system.md) and [docs/state-management.md](state-management.md).

### `src/shared/`
Framework-agnostic, domain-agnostic code:
- `ui/` — reusable visual primitives, all theme-aware via `useTheme()` + a `makeStyles(colors)` factory
- `utils/` — pure functions (formatters, date helpers)

Nothing in `shared/` imports from `features/`.

### `src/features/`
Domain-bounded modules. The rule: **a feature may import from `shared/`, `hooks/`, `services/`, `store/`, `constants/`, and `types/` — but never from another feature**.

Each feature exposes exactly one `index.ts` barrel. The navigator imports from `@features/movies`, never from `@features/movies/screens/MoviesScreen`.

---

## Theming Pattern (new)

Every themed file follows the same shape — a pure wrap around the pre-existing static `StyleSheet.create`, not a rewrite of the style bodies:

```tsx
// Before (single static dark theme)
import { Colors } from '@constants/theme';
const styles = StyleSheet.create({ screen: { backgroundColor: Colors.background } });

// After (dark/light aware)
import { ColorTokens } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';

export function Screen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return <View style={styles.screen} />;
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({ screen: { backgroundColor: Colors.background } });
```

Because the static `Colors` export was removed from `theme.ts`, any file that still imports it fails `tsc` immediately — this was used deliberately during the redesign as a "build until clean" checklist rather than risking silently-stale colors.

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

This gives you the freedom to move, rename, or refactor internal files without breaking any import outside the feature. Note: unrouted screens (e.g. `TheatresScreen`, `OffersScreen`) are still exported from their feature's `index.ts` for discoverability — they're simply never imported by `RootNavigator`/`TabNavigator`.

---

## Dependency Rules (enforced by architecture, not lint yet)

```
features  →  shared, hooks, services, store, constants, types
hooks     →  services, store, types
store     →  constants, types
services  →  types, constants
shared    →  constants, hooks, types
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
2. Add it to `RootStackParamList` (or `TabParamList`) in `src/types/navigation.ts`
3. Register it in `RootNavigator.tsx` (or `TabNavigator.tsx`)
4. Export it from the feature's `index.ts`
5. If it needs theme colors, use the `useTheme()` + `makeStyles(colors)` pattern above — never import a static `Colors` object

### Connecting a real backend

1. Replace mock data in `src/services/` — keep function signatures identical
2. Remove `MockDelay` calls
3. Add error handling / retry logic in hooks if needed
4. Add auth token injection (e.g. an axios interceptor) in a new `src/services/httpClient.ts`

No UI, store, or navigation changes required.
