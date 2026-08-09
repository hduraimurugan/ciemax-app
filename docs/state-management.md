# State Management

## Strategy

CineHall uses **Zustand v5** for global client state, split into four narrowly-scoped stores. Server data (movie lists, seat layouts, booking history) stays in local component state via custom hooks — it's never cached in Zustand.

| What | Where | Why |
|---|---|---|
| Auth session (tokens, customer) | `authStore` (Zustand + persist) | Read by `httpClient`, every login-gated screen, `useRequireAuth` |
| GPS location (district/state) | `locationStore` (Zustand + persist) | Read by every browse screen/hook that calls a location-aware endpoint |
| In-progress seat selection | `bookingStore` (Zustand, **not persisted**) | Shared across Showtimes → SeatSelection only — see below for why it stops there |
| Theme mode + active palette | `themeStore` (Zustand + persist) | Read by every themed component in the tree |
| Movie / theatre / show lists, seat layout, bookings | Local state (hooks) | Server data — always re-fetched, never stale-cached in a store |
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
  refreshTokens: async () => { /* calls authService.refresh(), updates the store */ },
  onSessionExpired: () => { /* clears the store, sets status: 'guest' */ },
});
```

This is the *only* coupling between the store and the HTTP layer — `httpClient.ts` itself has no import of Zustand or `authStore`, which avoids a circular dependency (the store needs `httpClient` to call `/login`; `httpClient` needs the store's tokens).

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
  detect: () => Promise<boolean>;       // GPS -> reverse geocode, respects a 24h cache
  setManually: (district, state) => Promise<void>;
  clear: () => void;
}
```

Mirrors the web app's `localStorage['user_location']` 24h cache — `detect()` skips the GPS/permission round-trip entirely if a location was set within the last day. When a customer is logged in, both `detect()` and `setManually()` best-effort `PUT /api/customer/update` to keep the server-side profile in sync (matching the web app's `updateProfileWithLocation()`).

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

Four small stores (auth, location, booking, theme) is still well within Zustand's comfort zone, and keeps the app on a single state-management story rather than mixing in Context for auth and Zustand for everything else.
