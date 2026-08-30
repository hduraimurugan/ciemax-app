# State Management

## Strategy

Cinemax App uses **Zustand v5** for global client state, split into five narrowly-scoped stores. Server data (movie lists, seat layouts, booking history) stays in local component state via custom hooks — it's never cached in Zustand. A separate, deliberately minimal in-memory cache ([`src/services/queryCache.ts`](../src/services/queryCache.ts)) provides short-TTL caching and request dedup for that server data, so a screen renders already-fetched data instantly instead of flashing a skeleton on every mount.

| What | Where | Why |
|---|---|---|
| Auth session (tokens, customer) | `authStore` (Zustand + persist) | Read by `httpClient`, every login-gated screen, `useRequireAuth` |
| GPS location (district/state) | `locationStore` (Zustand + persist) | Read by every browse screen/hook that calls a location-aware endpoint |
| In-progress seat selection | `bookingStore` (Zustand, **not persisted**) | Shared across Showtimes → SeatSelection only — see below for why it stops there |
| Theme mode + active palette | `themeStore` (Zustand + persist) | Read by every themed component in the tree |
| In-app notifications, unread count, push token | `notificationStore` (Zustand, **not persisted**) | Read by the Home tab bell badge, `NotificationsScreen`, `ProfileScreen`'s push toggle |
| Movie / theatre / show lists, seat layout, bookings | Local state (hooks) + `queryCache` (in-memory, TTL) | Server data — re-fetched within a short TTL, never stale-cached in a store |
| UI state (modals, tabs, form inputs) | Local `useState` | Component-local |

---

## Auth Store

Source: [`src/store/authStore.ts`](../src/store/authStore.ts)

```ts
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  customer: User | null;
  status: 'loading' | 'authed' | 'guest';

  bootstrap: () => Promise<void>;     // verifies a persisted token against GET /me
  login: (email, password) => Promise<AuthActionResult>;
  signup: (payload) => Promise<AuthActionResult>;
  googleLogin: (idToken) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
  updateCustomer: (patch: Partial<User>) => void;
}
```

`status` starts `'loading'` on every cold start — `SplashScreen` waits for it to resolve before deciding between `Onboarding` and `MainTabs`, so an already-signed-in user never flashes a guest state, and a signed-out user isn't forced through a login screen just to browse.

### Wiring into httpClient

`authStore.ts` calls `configureHttpClientAuth({...})` once at module load, passing closures that read/write its own Zustand state:

```ts
configureHttpClientAuth({
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  refreshTokens: async () => { /* calls authService.refresh(); returns null only on a confirmed 401/403, rethrows transient errors */ },
  onSessionExpired: () => { /* clears the store, sets status: 'guest' */ },
});
```

This is the *only* coupling between the store and the HTTP layer — `httpClient.ts` itself has no import of Zustand or `authStore`, which avoids a circular dependency (the store needs `httpClient` to call `/login`; `httpClient` needs the store's tokens).

Refresh and session-expiry semantics (`d907acb`): when a request comes back `401`/`403`, `httpClient` calls `attemptRefresh()` (concurrent callers share one in-flight refresh). A `401`/`403` from the refresh endpoint is the only signal that the refresh token is truly invalid/expired — `refreshTokens` returns `null` and `onSessionExpired()` clears the tokens and forces `status: 'guest'`. Any other refresh failure (network error, timeout, 5xx) is treated as transient: `refreshTokens` rethrows, `httpClient` surfaces the original request's error without touching the session, and the next 401-triggered call retries the refresh. `bootstrap()` follows the same rule — a failed `me()` only forces `guest` when the access token was already cleared by `onSessionExpired`; a transient failure leaves `status: 'authed'` so a flaky network doesn't silently log the user out.

On logout, `authStore` also calls `clearCache()` (from `queryCache`) — both `logout()` and the `onSessionExpired` hook wipe the in-memory server-data cache so the next signed-in account never sees the previous user's cached bookings/offers/lists. Both also call `useNotificationStore.getState().reset()`, and `logout()` additionally unregisters the current device's FCM token server-side (best-effort, non-blocking) so a signed-out device stops receiving that account's push notifications.

### What's persisted

Only `accessToken`, `refreshToken`, and `customer` — `status` is always recomputed via `bootstrap()` after rehydration, never trusted from disk.

---

## Location Store

Source: [`src/store/locationStore.ts`](../src/store/locationStore.ts)

```ts
interface LocationState {
  district: string | null;
  state: string | null;
  loading: boolean;
  lastUpdatedAt: number | null;
  detect: () => Promise<DetectResult>; // GPS -> reverse geocode, respects a 24h cache; reports failure reason
  setManually: (district, state) => Promise<void>;
  clear: () => void;
}
```

Mirrors the web app's `localStorage['user_location']` 24h cache — `detect()` skips the GPS/permission round-trip entirely if a location was set within the last day. When a customer is logged in, both `detect()` and `setManually()` best-effort `PUT /api/customer/update` to keep the server-side profile in sync (matching the web app's `updateProfileWithLocation()`).

Since `3c8078f`, `detect()` returns a `DetectResult` — `{ ok: true }` or `{ ok: false, reason }` where `reason` is `'denied' | 'blocked' | 'services-off' | 'timeout' | 'geocode-failed' | 'error'`. `requestPermission()` returns `'blocked'` when the user previously chose `NEVER_ASK_AGAIN` on Android; geolocation errors map `code 2` (`POSITION_UNAVAILABLE` — device GPS/location services off) → `'services-off'` and `code 3` (`TIMEOUT`) → `'timeout'`. `LocationModal` turns each reason into a distinct `Alert`.

Almost every browse endpoint (`getNowShowingMovies`, `getTheatresForMovie`, `getShowsForMovie`, ...) takes `district`/`state` as optional trailing parameters and falls back to a non-location-filtered global list when they're `null` — so the app is still browsable before a location is ever set.

---

## Booking Store

Source: [`src/store/bookingStore.ts`](../src/store/bookingStore.ts)

```ts
interface BookingState {
  selectedMovie: Movie | null;
  selectedTheatre: Theatre | null;
  selectedShow: Show | null;
  selectedSeats: Seat[];
  seatCount: number;          // set by SeatCountModal — drives findBestAdjacentSeats

  setSelectedMovie, setSelectedTheatre, setSelectedShow: (...) => void;
  setSeatCount: (count: number) => void;
  setSelectedSeats: (seats: Seat[]) => void;   // replaces the whole selection — not a per-seat toggle
  clearSeatSelection: () => void;
  resetBookingFlow: () => void;
  getTotalAmount: () => number;   // sum of selectedSeats' prices — display only, on SeatSelectionScreen
}
```

This store is deliberately small and **not persisted**. It only covers the *pre-hold* part of the flow: `ShowtimesScreen`/`TheatresScreen` set the movie/theatre/show for display, `SeatSelectionScreen` manages the live selection.

### Why Checkout is route-param-driven, not store-driven

Before the real API integration, `Checkout`/`Payment` took no route params and read everything from this store — which meant a backgrounded app (or a store that got reset) could silently orphan a **live server-side seat hold** with no way to reconcile. Once `POST /api/booking/hold` succeeds, the source of truth becomes the server's `hold_expires_at`, not local state — so `SeatSelectionScreen` navigates to `Checkout` with a full `CheckoutParams` payload (`showId`, `seatIds`, `seatLabels`, `holdExpiresAt`, `ticketTotal`, movie/cinema/show display fields), and every screen downstream (`Checkout` → `Payment` → `RazorpayWebView` → `BookingFailure`) threads that same object forward through `navigation.navigate(...)` params instead of reading the store. See [docs/navigation.md](navigation.md#navigation-param-types).

### toggleSeat is gone — replaced by auto-adjacent selection

The old `toggleSeat(seat)` (add/remove one seat, capped at a hardcoded `8`) no longer matches how seat selection actually works against the real layout. `SeatSelectionScreen` now:
1. Opens `SeatCountModal` first — `setSeatCount(n)` (capped at `AppConfig.maxSeatSelectionPerBooking`).
2. On a seat tap: if it's already selected, `clearSeatSelection()`; otherwise runs `findBestAdjacentSeats(seat, seatCount, layout.allSeats)` and calls `setSelectedSeats(block)` with the result.

See [docs/features.md](features.md#seats) for the full algorithm.

---

## Theme Store

Source: [`src/store/themeStore.ts`](../src/store/themeStore.ts) — unchanged by the API integration.

```ts
type ThemeMode = 'dark' | 'light';
interface ThemeState {
  mode: ThemeMode;
  colors: ColorTokens;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}
```

Only `mode` is persisted; `colors` is always re-derived from it via `paletteFor()` on rehydration, so `DarkColors`/`LightColors` can be edited freely without invalidating a stored preference. Read via [`useTheme()`](../src/hooks/useTheme.ts), never `useThemeStore` directly.

---

## Notification Store

Source: [`src/store/notificationStore.ts`](../src/store/notificationStore.ts)

```ts
interface NotificationState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  page: number;
  hasMore: boolean;
  pushToken: string | null;    // last-registered FCM token — kept here (not persisted) so logout can unregister it
  pushEnabled: boolean;        // derived: !!pushToken

  fetchUnreadCount: () => Promise<void>;
  fetchList: () => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  setPushToken: (token: string | null) => void;
  reset: () => void;
}
```

Deliberately **not** `persist`-backed: `items`/`unreadCount` are always re-fetchable from the server, and `pushToken`/`pushEnabled` are re-derived on cold start by `syncPushStateOnLaunch()` (see [docs/architecture.md](architecture.md#push-notifications-notifee--react-native-firebasemessaging)) rather than trusted from disk — the OS-level permission grant, not a remembered flag, is the source of truth for whether push is actually enabled.

`markRead`/`markAllRead` update `items`/`unreadCount` optimistically before the network call resolves; a failure is non-fatal and silently reconciled on the next `fetchList`/`fetchUnreadCount`, matching the pattern used by `bookingStore`'s hold/release calls.

`MoviesScreen`'s Home tab bell reads `unreadCount` directly for its badge; `usePushNotifications()` (mounted once in `App.tsx`) is what keeps it fresh — see [docs/architecture.md](architecture.md#push-notifications-notifee--react-native-firebasemessaging).

---

## Query Cache (server data)

Source: [`src/services/queryCache.ts`](../src/services/queryCache.ts) — not a Zustand store.

Server data intentionally lives outside the five stores. To avoid re-fetching (and re-skeletoning) data the app just fetched, the service layer keeps a tiny in-memory cache keyed by endpoint payload:

- Hooks seed their initial `useState` synchronously via `getCached(key, ttlMs)` (e.g. `useMovies` seeds Now Showing / Coming Soon from cache on mount), then kick off a `cachedFetch(key, fn, ttlMs)` — the fresh-enough cached value is set immediately and the `promise` revalidates in the background.
- `dedupedFetch` collapses concurrent calls for the same key into one network request — e.g. `useTheatresForMovie` + `useShowsForMovie` both call the same showtimes endpoint for a date.
- Each cached service exposes a `getCachedX()` peek (`getCachedMovie`, `getCachedSettings`, `getCachedUserBookings`, ...) so a screen can seed its first render without awaiting a promise.
- Entries expire by TTL (`CacheTTL` — see [docs/architecture.md](architecture.md#srcservicesquerycachets)); past-TTL reads return `undefined` so the caller treats them as a cold start and shows its skeleton.
- Mutations invalidate: `holdSeats`/`releaseSeats` → `seat-layout:<showId>`, `verifyPayment` → `bookings`. Logout/session-expiry → `clearCache()`.

The key rule that keeps this distinct from the Zustand stores: the cache only ever holds **recently-fetched, re-fetchable server data**, never authoritative client state, so losing it is always safe.

---

## Using a Store in Components

### Reading a single slice (avoids unnecessary re-renders)

```tsx
const selectedSeats = useBookingStore(s => s.selectedSeats);
const status = useAuthStore(s => s.status);
```

### Calling an action

```tsx
const login = useAuthStore(s => s.login);
const result = await login(email, password);
if (!result.success) setError(result.error?.message);
```

---

## Why Not Redux or Context?

| Criterion | Zustand | Redux | Context |
|---|---|---|---|
| Boilerplate | Minimal | Heavy | None |
| Re-render granularity | Per-selector | Per-selector | Whole tree |
| Async actions | Direct | Thunk/Saga | Manual |
| Persistence | Built-in `persist` middleware | Needs redux-persist | Manual |

Five small stores (auth, location, booking, theme, notification) is still well within Zustand's comfort zone, and keeps the app on a single state-management story rather than mixing in Context for auth and Zustand for everything else.
