# Architecture

## Overview

CineHall uses a **feature-sliced architecture** — code is organised by domain (movies, seats, booking) rather than by technical layer (components, services, utils). This keeps each feature self-contained and prevents the "god folder" problem where a single `components/` or `screens/` directory grows unbounded.

The app talks to a real backend, [cinema-hall-api](../../cinema-hall/cinema-hall-api) (Express 5 + raw Postgres + Razorpay) — the same one behind [cinema-hall-users](../../cinema-hall/cinema-hall-users), the web app this was ported from. A dedicated **service + mapper layer** (below) is what keeps that server's exact shapes from leaking into every screen.

---

## Full Folder Tree

```
MyApp/
├── .env / .env.example / .env.staging / .env.production
├── android/app/build.gradle       # react-native-config wired per build variant
├── metro.config.js                # resolver.unstable_enablePackageExports: false
│
src/
├── app/navigation/
│   ├── RootNavigator.tsx          # Stack navigator — owns the full screen hierarchy
│   ├── TabNavigator.tsx           # Bottom tab navigator — nested inside RootNavigator
│   └── index.ts
│
├── constants/
│   ├── theme.ts                   # DarkColors / LightColors token objects + Spacing/Radius/FontSize/Shadow
│   ├── config.ts                  # AppConfig (seat cap, currency), StorageKeys, mock-only SeatPricing
│   ├── env.ts                     # Typed react-native-config wrapper — throws on a missing API_BASE_URL
│   └── index.ts
│
├── types/
│   ├── models.ts                  # App-facing camelCase domain interfaces — what every screen imports
│   ├── api.ts                     # Exact snake_case cinema-hall-api response/request DTOs + ApiError
│   ├── navigation.ts              # RootStackParamList, TabParamList, CheckoutParams
│   └── index.ts
│
├── store/
│   ├── authStore.ts               # Zustand + persist — accessToken/refreshToken/customer, bootstrap()
│   ├── locationStore.ts           # Zustand + persist — district/state, 24h GPS cache
│   ├── bookingStore.ts            # Zustand — in-progress seat selection (pre-hold; Checkout+ is route-param-driven)
│   ├── themeStore.ts              # Zustand + persist — dark/light mode, active ColorTokens
│   └── index.ts
│
├── services/
│   ├── httpClient.ts              # fetch wrapper — error normalization, Bearer injection, refresh-on-401/403
│   ├── mappers.ts                 # api.ts DTO → models.ts app-model conversions (the ONLY place this happens)
│   ├── authService.ts             # /api/customer/*, /api/otp/*
│   ├── moviesService.ts           # /api/user/movies* (location-aware, falls back to global list)
│   ├── theatresService.ts         # Derives Theatre/Show from moviesService's showtimes call + /location/theatres
│   ├── showsService.ts            # GET /api/shows/get/:id — the seat-map endpoint
│   ├── seatsService.ts            # Thin mock/real switch in front of showsService (stable import path)
│   ├── bookingService.ts          # /api/booking/{hold,release,my-bookings,:id,by-payment/:id}
│   ├── paymentService.ts          # /api/payment/{create-order,verify}
│   ├── offersService.ts           # /api/offers/{active,validate}
│   ├── settingsService.ts         # GET /api/settings — convenience_fee_per_ticket, gst_percentage
│   ├── adsService.ts              # /api/ads/{active,click/:id}
│   ├── *.mock.ts                  # Original in-memory implementations, selected via Env.USE_MOCKS
│   └── index.ts
│
├── hooks/
│   ├── useMovies.ts, useTheatres.ts, useSeatLayout.ts   # loading/error/refetch, location-aware
│   ├── useRequireAuth.ts          # Guards an action behind login; queues + resumes it after sign-in
│   ├── useFavourites.ts           # AsyncStorage-backed favourite movies/theatres
│   ├── useDebouncedValue.ts       # Used by SearchScreen
│   ├── useTheme.ts, useCountdown.ts
│   └── index.ts
│
├── shared/
│   ├── ui/                        # Reusable, theme-aware primitives (Button, Card, Badge, BottomSheet, ...)
│   └── utils/formatters.ts        # formatPrice, formatShowDate, formatShowTime, ...
│
└── features/
    ├── onboarding/                # SplashScreen (waits on authStore.bootstrap), OnboardingScreen
    ├── auth/                      # LoginScreen, RegisterScreen, OtpScreen, ForgotPasswordScreen
    │   └── utils/                 # passwordPolicy.ts (mirrors the server's rules), googleAuth.ts
    ├── location/                  # LocationModal — GPS "detect" or manual state → district picker
    ├── movies/                    # MoviesScreen (Home tab), MovieDetailScreen, MovieCard
    ├── search/                    # SearchScreen
    ├── theatres/                  # ShowtimesScreen (per-movie), TheatresScreen (hall -> movies -> shows)
    ├── seats/
    │   ├── components/            # SeatGrid (pinch/pan zoom), SeatItem, SeatCountModal, SeatLegend, SectionHeader
    │   ├── screens/SeatSelectionScreen.tsx
    │   └── utils/seatSelection.ts # findBestAdjacentSeats — ported verbatim from the web app
    ├── booking/
    │   ├── screens/                # CheckoutScreen, PaymentScreen, RazorpayWebViewScreen, BookingSuccess/Failure
    │   ├── components/PriceBreakdown.tsx
    │   └── utils/                 # pricing.ts (pure fee/GST calc), razorpayCheckoutHtml.ts
    ├── profile/                    # ProfileScreen, MyBookingsScreen, TicketDetailScreen, Change/SetPasswordScreen
    └── offers/                     # OffersScreen
```

---

## Layer Responsibilities

### `src/app/`
Bootstrap and navigation wiring. Contains no business logic or UI primitives. `App.tsx` wraps the tree in `GestureHandlerRootView` (required by the seat map's pinch/pan gestures) → `SafeAreaProvider` → `NavigationContainer`.

### `src/constants/`
Magic numbers, strings, and environment config. `theme.ts` exports `DarkColors`/`LightColors` — no component should hardcode a colour hex; it must come from `useTheme().colors`. `env.ts` is the only file that reads `react-native-config` directly.

### `src/types/`
Two distinct layers on purpose:
- **`api.ts`** — snake_case, exactly what cinema-hall-api sends and expects. Field names here should never be "cleaned up" to look nicer; that's what mappers are for.
- **`models.ts`** — camelCase, what every screen and component actually imports. Pre-dates the real API integration; extended (not replaced) to carry the extra fields the server provides (seat `label`/`isBlocked`, refund status, offer redemption, etc.) so existing screens kept compiling through the port.

### `src/store/`
Global client state using Zustand. `authStore` and `locationStore` are `persist`-backed and own real session/GPS state. `bookingStore` only holds the *in-progress, pre-hold* seat selection — once seats are held server-side (`SeatSelectionScreen` → `POST /api/booking/hold`), `Checkout`/`Payment`/`BookingFailure` stop reading from the store and become **route-param-driven** (`CheckoutParams`, see `src/types/navigation.ts`), so a backgrounded app doesn't desync from the real 5-minute server hold. `themeStore` is unrelated to booking/auth — purely the persisted theme mode.

### `src/services/`
The data abstraction layer, real by default. Every file:
1. Exports typed `async` functions returning app models (`models.ts`), never raw DTOs.
2. Calls `httpClient` (never `fetch` directly) so error normalization and token refresh are consistent everywhere.
3. Runs its response through `mappers.ts` before returning.

```ts
// src/services/moviesService.ts
export async function getMovieById(id: string): Promise<Movie | undefined> {
  const res = await httpClient.get<GetMovieByIdResponse>(`/api/user/movies/${id}`, { skipAuth: true });
  return mapMovie(res.movie);
}
```

Every file has a `*.mock.ts` sibling with the original in-memory implementation (movies/theatres/seats/booking/offers). Each real function starts with `if (Env.USE_MOCKS) return mock.fn(...)` — flip `USE_MOCKS=true` in `.env` to develop UI with zero backend dependency.

### `src/services/httpClient.ts`

The single most load-bearing new file. Handles, in one place:
- **Error normalization** — cinema-hall-api returns errors in four different shapes (`{error}`, `{message}`, `{success:false,message}`, `{success:false,error}`) plus coded variants (`ACCOUNT_LOCKED`, `OTP_EXPIRED`, ...). All of them become one `ApiError { status, message, code?, hint?, lockedUntil?, results? }`.
- **Auth injection** — attaches `Authorization: Bearer <accessToken>` unless `skipAuth` is passed.
- **Refresh-and-retry on both 401 *and* 403** — the API uses 401 for a *missing* token and 403 for an *expired/invalid* one. Refreshing only on 401 (the more common assumption) would silently break every session after the 24h access-token lifetime. Concurrent 401/403s share a single in-flight refresh call.
- **`configureHttpClientAuth`** — `authStore.ts` wires itself in via this function at module load, rather than `httpClient.ts` importing the store directly (avoids a circular dependency: the store needs `httpClient` to call the API; `httpClient` needs the store's tokens).

### `src/services/mappers.ts`
The only place a `ApiXxx` DTO becomes an `Xxx` app model. Notable non-obvious mappings documented inline: cinema-hall-api uses **two different field-name sets** for a "theatre" depending on the endpoint (`cinema_hall_id/_name/_location` vs `hall_id/hall_name/location`); seat pricing resolves `price_override` before falling back to the screen's base `pricing`.

### `src/hooks/`
Wraps service calls with `loading`, `error`, and `refresh`/`refetch` state, and are location-aware where the underlying endpoint requires `district`/`state` (`useMovies`, `useTheatresForMovie`, `useShowsForMovie`). `useRequireAuth()` is the auth-gating primitive — see [docs/state-management.md](state-management.md#auth-store).

### `src/shared/`
Framework-agnostic, domain-agnostic code — unchanged in shape by the API integration. Nothing in `shared/` imports from `features/` or `services/`.

### `src/features/`
Domain-bounded modules. The rule: **a feature may import from `shared/`, `hooks/`, `services/`, `store/`, `constants/`, and `types/` — but never from another feature** (with the narrow exception of `@features/auth/utils/googleAuth` and `@features/location`, reused by `profile` and `movies`/`theatres` respectively, since they're small, self-contained utilities rather than screens).

---

## Dependency Rules

```
features  →  shared, hooks, services, store, constants, types
hooks     →  services, store, types
store     →  services, constants, types      (authStore/locationStore call services directly)
services  →  types, constants, mappers
shared    →  constants, hooks, types
```

No circular dependencies except the intentionally-inverted one between `httpClient.ts` and `authStore.ts`, resolved via `configureHttpClientAuth` (see above) rather than a direct import in either direction.

---

## Scaling Guide

### Adding a new feature backed by a new endpoint

1. Add the DTO shape to `src/types/api.ts`.
2. Add the mapper to `src/services/mappers.ts`.
3. Add the service function to a new or existing `src/services/<name>Service.ts`, calling `httpClient`.
4. Add a hook in `src/hooks/` if the screen needs loading/error state.
5. Create `src/features/<name>/` with the standard sub-structure (`components/`, `screens/`, `index.ts`) and register screens in `RootNavigator`/`TabNavigator` + `src/types/navigation.ts`.

### Adding a mock fallback for a new service

Create `<name>Service.mock.ts` with the same exported function signatures, then guard each real function with `if (Env.USE_MOCKS) return mock.fn(...)` at the top — see any existing service for the pattern.
