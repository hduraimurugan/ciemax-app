# Architecture

## Overview

Cinemax App uses a **feature-sliced architecture** — code is organised by domain (movies, seats, booking) rather than by technical layer (components, services, utils). This keeps each feature self-contained and prevents the "god folder" problem where a single `components/` or `screens/` directory grows unbounded.

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
│   ├── indiaLocations.ts          # Generated: all India states/UTs + districts (country-state-city dataset, same source as the web app)
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
│   ├── notificationStore.ts       # Zustand, not persisted — in-app notification list/unread count + push token
│   └── index.ts
│
├── services/
│   ├── httpClient.ts              # fetch wrapper — error normalization, Bearer injection, refresh-on-401/403
│   ├── mappers.ts                 # api.ts DTO → models.ts app-model conversions (the ONLY place this happens)
│   ├── queryCache.ts              # In-memory TTL cache + in-flight request dedup for GET data
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
│   ├── notificationService.ts     # /api/notifications/{list,unread-count,:id/read,read-all,preferences,device-token}
│   ├── pushService.ts             # FCM token lifecycle — enablePush/disablePush/syncPushStateOnLaunch
│   ├── *.mock.ts                  # Original in-memory implementations, selected via Env.USE_MOCKS
│   └── index.ts
│
├── hooks/
│   ├── useMovies.ts, useTheatres.ts, useSeatLayout.ts   # loading/error/refetch, location-aware, cache-seeded + skeleton-driven
│   ├── useRequireAuth.ts          # Guards an action behind login; queues + resumes it after sign-in
│   ├── useFavourites.ts           # AsyncStorage-backed favourite movies/theatres
│   ├── useDebouncedValue.ts       # Used by SearchScreen
│   ├── usePushNotifications.ts    # Mounted once in App.tsx — wires FCM/notifee listeners, tap-to-navigate, badge refresh
│   ├── useTheme.ts, useCountdown.ts
│   └── index.ts
│
├── shared/
│   ├── ui/                        # Reusable, theme-aware primitives (Button, Card, Badge, BottomSheet, Skeleton, ...)
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
    ├── offers/                     # OffersScreen
    └── notifications/              # NotificationsScreen — in-app notification list
```

---

## Layer Responsibilities

### `src/app/`
Bootstrap and navigation wiring. Contains no business logic or UI primitives. `App.tsx` wraps the tree in `SafeAreaProvider` → `NavigationContainer`; the seat map owns its gesture detector configuration locally. `App.tsx` also calls `usePushNotifications()` once at the root, and passes `navigationRef` (`src/app/navigation/navigationRef.ts`) to `NavigationContainer` — a stable ref that lets code outside the component tree (a push-notification tap handler) navigate before/independent of any screen being focused.

### `src/constants/`
Magic numbers, strings, and environment config. `theme.ts` exports `DarkColors`/`LightColors` — no component should hardcode a colour hex; it must come from `useTheme().colors`. `env.ts` is the only file that reads `react-native-config` directly. `indiaLocations.ts` is generated output (not hand-maintained) — see [docs/features.md](features.md#location) for how it's produced and why it's checked in instead of fetched at runtime.

### `src/types/`
Two distinct layers on purpose:
- **`api.ts`** — snake_case, exactly what cinema-hall-api sends and expects. Field names here should never be "cleaned up" to look nicer; that's what mappers are for.
- **`models.ts`** — camelCase, what every screen and component actually imports. Pre-dates the real API integration; extended (not replaced) to carry the extra fields the server provides (seat `label`/`isBlocked`, refund status, offer redemption, etc.) so existing screens kept compiling through the port.

### `src/store/`
Global client state using Zustand. `authStore` and `locationStore` are `persist`-backed and own real session/GPS state. `bookingStore` only holds the *in-progress, pre-hold* seat selection — once seats are held server-side (`SeatSelectionScreen` → `POST /api/booking/hold`), `Checkout`/`Payment`/`BookingFailure` stop reading from the store and become **route-param-driven** (`CheckoutParams`, see `src/types/navigation.ts`), so a backgrounded app doesn't desync from the real 5-minute server hold. `themeStore` is unrelated to booking/auth — purely the persisted theme mode. `notificationStore` is **not** `persist`-backed — its list/unread-count/push-token are all re-derivable from the server on next fetch, and `authStore.logout()`/`onSessionExpired` both call its `reset()` so one account never sees another's notifications or a stale badge.

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
- **Refresh-and-retry on both 401 *and* 403** — the API uses 401 for a *missing* token and 403 for an *expired/invalid* one. Refreshing only on 401 (the more common assumption) would silently break every session after the 24h access-token lifetime. Concurrent 401/403s share a single in-flight refresh call (`attemptRefresh()`). Only a confirmed `401`/`403` from the refresh endpoint is treated as an invalid refresh token — `refreshTokens` returns `null` and `onSessionExpired()` wipes the session. A transient refresh failure (network error, timeout, 5xx) is rethrown instead of swallowed, so the session survives and the next 401-triggered call retries the refresh (`d907acb`).
- **`configureHttpClientAuth`** — `authStore.ts` wires itself in via this function at module load, rather than `httpClient.ts` importing the store directly (avoids a circular dependency: the store needs `httpClient` to call the API; `httpClient` needs the store's tokens).

`httpClient` exposes `get`/`post`/`put`/`patch`/`del` — `patch` was added alongside `del` gaining an optional body (used by `notificationService.markRead`/`markAllRead` and `unregisterDeviceToken`, respectively).

### `src/services/mappers.ts`
The only place a `ApiXxx` DTO becomes an `Xxx` app model. Notable non-obvious mappings documented inline: cinema-hall-api uses **two different field-name sets** for a "theatre" depending on the endpoint (`cinema_hall_id/_name/_location` vs `hall_id/hall_name/location`); seat pricing resolves `price_override` before falling back to the screen's base `pricing`; PostgreSQL numeric fields such as ratings and booking amounts may arrive as strings and are converted to numbers before entering app models or arithmetic.

### `src/services/queryCache.ts`

A tiny in-memory cache + in-flight request dedup for GET-ish data — deliberately **not** a data-fetching library. It exists to let a screen render already-fetched data synchronously on mount (instead of flashing a skeleton for data fetched moments ago) and to collapse concurrent calls for the same key into a single network request (e.g. `ShowtimesScreen`'s `useTheatresForMovie` + `useShowsForMovie` hitting the same endpoint). The cache lives for the app's lifetime and is wiped on logout — `authStore.logout()` (and the `onSessionExpired` hook) call `clearCache()` so one account never sees another's cached bookings/offers.

- `getCached(key, ttlMs)` / `getStale(key)` — synchronous reads; a `getCached` past its TTL returns `undefined` so callers treat it as a cold start.
- `dedupedFetch(key, fn)` — runs `fn()` once per key; concurrent callers share the same in-flight promise. Rejections aren't cached, so a failed fetch can be retried immediately.
- `cachedFetch(key, fn, ttlMs)` — the common "seed from cache, then revalidate" wrapper: returns `{ cached, promise }`, letting a hook set state synchronously from `cached` while `promise` refreshes in the background.
- `invalidate(prefix)` / `clearCache()` — drop entries whose key starts with `prefix` (used after mutations) or everything (used on logout).
- `CacheTTL` — per-key freshness windows: `movies` 5m, `movieDetail` 15m, `theatres` 5m, `showtimes` 5m, `offers` 30m, `settings` 30m, `bookings` 1m, `seatLayout` 15s.

Services use it two ways. Read paths like `getNowShowingMovies`, `getActiveOffers`, and `getSettings` wrap their fetch in `cachedFetch` and return the fresh-enough cached value immediately while revalidating in the background; each also exposes a synchronous `getCachedX()` peek (`getCachedMovie`, `getCachedUserBookings`, `getCachedTheatresWithShows`, ...) so hooks and screens can seed their initial `useState` without awaiting. Mutation paths invalidate related entries: `bookingService.holdSeats`/`releaseSeats` call `invalidate('seat-layout:...')` so held seats show as unavailable immediately, and `paymentService.verifyPayment` calls `invalidate('bookings')` so a new booking appears in My Bookings without waiting out the TTL.

### `src/hooks/`
Wraps service calls with `loading`, `error`, and `refresh`/`refetch` state, and are location-aware where the underlying endpoint requires `district`/`state` (`useMovies`, `useTheatresForMovie`, `useShowsForMovie`). `useRequireAuth()` is the auth-gating primitive — see [docs/state-management.md](state-management.md#auth-store). `usePushNotifications()` is mounted once, at the root, and is the other stateful primitive in this folder — see below.

### Push notifications (Notifee + `@react-native-firebase/messaging`)

Three files split the concern:

- **`index.js`** registers `setBackgroundMessageHandler` at module scope, before `AppRegistry.registerComponent` — required so FCM can wake the JS engine for a backgrounded/killed-app message (a headless JS task). The handler body is intentionally empty: no store/UI access is possible there (no component tree is mounted), and the system tray notification itself is rendered automatically by Android's FCM SDK from the push payload's `notification` block, independent of this handler.
- **`src/hooks/usePushNotifications.ts`** is mounted once in `App.tsx` and wires everything that needs live listeners: foreground FCM messages → a `notifee.displayNotification` banner (FCM shows nothing on its own while the app is open); tap-to-open (backgrounded tap via `onNotificationOpenedApp`, killed-app launch via `getInitialNotification`, foreground banner tap via `notifee.onForegroundEvent`) → `navigateToNotifications()` (v1 always lands on the notification list, not a specific booking); FCM token rotation (`onTokenRefresh`) → silent re-registration; and an `AppState` listener that refreshes the unread badge on foreground — the RN equivalent of the web app's page-visibility polling, without a `setInterval`. It also calls `syncPushStateOnLaunch()` once auth resolves to `'authed'`.
- **`src/services/pushService.ts`** owns the token lifecycle as plain async functions, not hook state: `enablePush()` (requests the Android 13+/API 33+ runtime `POST_NOTIFICATIONS` permission, then registers the FCM token — only ever called from an explicit user action, the Profile screen toggle, never an unsolicited prompt on app load), `disablePush()` (unregisters server-side + deletes the local FCM token; can't revoke the OS-level grant — there's no Android API for an app to do that to itself), and `syncPushStateOnLaunch()` (checks the *actual* OS permission grant on cold start rather than trusting a remembered flag, since `notificationStore.pushEnabled` isn't persisted and the user could have revoked the permission via system Settings between sessions).

`src/app/navigation/navigationRef.ts` is what lets the tap handlers navigate — see `src/app/` above.

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
3. Add the service function to a new or existing `src/services/<name>Service.ts`, calling `httpClient`. If it's a read path, wrap it in `queryCache`'s `cachedFetch` and expose a `getCachedX()` peek (see above).
4. Add a hook in `src/hooks/` if the screen needs loading/error state — seed initial state from `getCached`, drive a `<Name>Skeleton` from the cold-start `loading` flag.
5. Create `src/features/<name>/` with the standard sub-structure (`components/`, `screens/`, `index.ts`) and register screens in `RootNavigator`/`TabNavigator` + `src/types/navigation.ts`.

### Adding a mock fallback for a new service

Create `<name>Service.mock.ts` with the same exported function signatures, then guard each real function with `if (Env.USE_MOCKS) return mock.fn(...)` at the top — see any existing service for the pattern.
