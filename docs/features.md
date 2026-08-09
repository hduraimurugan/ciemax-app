# Feature Modules

Each feature in `src/features/` is a self-contained domain module — components, screens, and (where needed) a small `utils/`, exposed via a single `index.ts` barrel. See [docs/navigation.md](navigation.md) for the live route map and [docs/architecture.md](architecture.md) for the service/mapper layer every feature calls into.

---

## onboarding

**Domain:** First-run experience and session bootstrap.

| File | Purpose |
|---|---|
| `screens/SplashScreen.tsx` | Waits on `authStore.bootstrap()`, then routes to `Onboarding` (first run) or `MainTabs` |
| `screens/OnboardingScreen.tsx` | 3-slide carousel with native SVG illustrations for discovery, seat selection, and QR tickets; "Skip"/"Get Started" both land in `MainTabs`, not `Login` |

Splash no longer hard-codes a 2.2s timer into `Onboarding` — it holds for a minimum 1.4s dwell time *and* waits for the persisted auth token (if any) to finish being verified against `GET /me`, so a signed-in user's session isn't lost in a UI flash. First-run state is tracked via `AsyncStorage[StorageKeys.onboardingSeen]`, set once `Onboarding` is dismissed.

The illustrations are rendered locally with `react-native-svg` rather than loaded from image files or a network URL, so onboarding works offline and keeps its cinema marquee, seat-map, and e-ticket visuals theme-aware.

---

## auth

**Domain:** Full account lifecycle — login, signup+OTP, forgot password, Google Sign-In. Pushed as `presentation: 'modal'` stack screens, reachable from anywhere via `useRequireAuth()`.

| File | Purpose |
|---|---|
| `screens/LoginScreen.tsx` | Email + password against `POST /api/customer/login` |
| `screens/RegisterScreen.tsx` | Details form with a live password-policy checklist → `POST /api/customer/signup` |
| `screens/OtpScreen.tsx` | 6-digit code → `POST /api/otp/verify`; auto-logs in if it came from Register |
| `screens/ForgotPasswordScreen.tsx` | 3 steps: email → OTP + new password → success |
| `utils/passwordPolicy.ts` | Mirrors `cinema-hall-api/utils/passwordPolicy.js` rule-for-rule (8+ chars, upper, lower, digit, special) |
| `utils/googleAuth.ts` | Wraps `@react-native-google-signin/google-signin`, returns an ID token for `POST /api/customer/google-login` |

### LoginScreen error handling

Every documented API failure mode gets a distinct UI response, not a generic "login failed":
- `423 ACCOUNT_LOCKED` → banner with the human-readable `lockedUntil` time + a link to Forgot Password.
- A `hint` field on a wrong-password response → "N attempts remaining before account is locked."
- "email not verified" → auto-sends a fresh OTP and pushes `OtpScreen`.
- Account not found → inline error, no enumeration hint beyond what the API already reveals.

### Google Sign-In

`GoogleSignin.configure({ webClientId: Env.GOOGLE_WEB_CLIENT_ID })` — note this is the **web** client ID even on native, since that's the audience `verifyGoogleToken()` checks server-side; it needs its own OAuth client registered in Google Cloud Console (Android needs a SHA-1-keyed client, separate from the web app's).

---

## location

**Domain:** District/state resolution, feeding every location-aware browse endpoint.

| File | Purpose |
|---|---|
| `components/LocationModal.tsx` | BottomSheet: "Use my current location" (GPS) or a state → district picker, each step filterable via a search box |

Backed by `locationStore` (see [docs/state-management.md](state-management.md#location-store)). States and districts come from `constants/indiaLocations.ts` — all 36 India states/UTs and their ~4,242 districts/cities, generated from the `country-state-city` npm package (the same data source the web app's "Select Your City" picker uses) via a one-off script, not fetched from `cinema-hall-api` at runtime. This replaced an earlier 10-state curated list plus a per-state `GET /api/user/movies/location/districts` call — the lookup is now synchronous and offline. A picked district isn't guaranteed to have movies/theatres in the backend; `MoviesScreen`/`TheatresScreen` show an empty-state message rather than filtering the picker itself, matching the web app.

A "Clear" link appears in the modal header once a location is already set, calling `locationStore.clear()` so the user can start picking fresh instead of only being able to overwrite the existing selection.

---

## movies

**Domain:** Film catalogue — browsing and detail.

| File | Purpose |
|---|---|
| `screens/MoviesScreen.tsx` | **Home tab** — hero carousel, ad banner, Now Showing / Coming Soon / Recommended rows |
| `screens/MovieDetailScreen.tsx` | Backdrop hero, real cast photos, trailer link, favourite/share, "Book Tickets" |
| `components/MovieCard.tsx` | `variant: 'rating' \| 'soon' \| 'plain'` |

### MoviesScreen

- Location-aware: prefers `GET /api/user/movies/location/movies?district&state` once a location is set (city chip opens `LocationModal`), falls back to the global `status=now_showing|upcoming` list otherwise.
- Pull-to-refresh on the main `ScrollView` and, on fetch failure, `useMovies()`'s `error` state renders a "Refresh" button — both call the same `refresh()` (bumps the hook's retry tick) instead of leaving a dead-end error message.
- Ad banner: `GET /api/ads/active?placement=banner`, tap records a click via `POST /api/ads/click/:id`. The banner is rendered at the Home content width with a 3.5:1 aspect ratio, autoplay dots, and a visible `AD` corner label.
- A `Clapperboard` icon in the header opens `Theatres` — the app's other entry point into the hall-first browse flow.

### MovieDetailScreen

- Cast row renders real TMDB photos (`profilePath`) when available, falling back to initials.
- Heart icon persists a favourite to `AsyncStorage[StorageKeys.favouriteMovies]` via `useFavourites()`.
- Share icon uses the native `Share` API.
- A trailer button (shown only when `trailerUrl` is present) opens it via `Linking.openURL` — no in-app player.

---

## search

**Domain:** Movie search.

| File | Purpose |
|---|---|
| `screens/SearchScreen.tsx` | Debounced live search, persisted recent searches |

Query input is debounced 350ms (`useDebouncedValue`) before calling `GET /api/user/movies?search=`, replacing the old fire-on-every-keystroke behavior. Recent searches persist to `AsyncStorage[StorageKeys.recentSearches]` (capped at 6, most-recent-first, deduped case-insensitively) instead of a static in-file array.

---

## theatres

**Domain:** Cinema and showtime selection — two distinct entry points into the same data.

| File | Purpose |
|---|---|
| `screens/ShowtimesScreen.tsx` | Per-movie: date strip + per-cinema showtime chips (reached from `MovieDetail`) |
| `screens/TheatresScreen.tsx` | Per-location: hall → movies → shows, all halls in the current district/state |

### ShowtimesScreen

- Requires a location; shows a "Set Location" prompt (opens `LocationModal`) if none is set yet.
- `GET /api/user/movies/:movieId/showtimes?district&state&date` via `useTheatresForMovie`/`useShowsForMovie`.
- Each cinema card has a heart (favourite, `AsyncStorage[StorageKeys.favouriteTheatres]`) and a Directions button (`Linking` → Google Maps, using lat/lng when available, else a text query).
- Tapping a showtime chip sets `selectedMovie`/`selectedTheatre`/`selectedShow` on `bookingStore` (display-only from here on) and navigates to `SeatSelection`.

### TheatresScreen

- `GET /api/user/movies/location/theatres?district&state&date` — the same date-strip UI, but grouped by hall first, then by movie, then by showtime.
- Tapping a showtime builds a minimal `Movie` stub from the listing's summary fields (`mapTheatreListingMovie()` — the location endpoint doesn't return a full movie detail) before navigating to `SeatSelection`.

---

## seats

**Domain:** Interactive seat selection — the most complex feature in the app, and the one that changed most.

| File | Purpose |
|---|---|
| `screens/SeatSelectionScreen.tsx` | Opens `SeatCountModal`, then the real seat grid + hold flow |
| `components/SeatCountModal.tsx` | 1–`AppConfig.maxSeatSelectionPerBooking` picker with live per-section availability |
| `components/SeatGrid.tsx` | Pinch/pan-zoomable renderer, built from `layout.allSeats` (not the pricing-grouped `sections`) |
| `components/SeatItem.tsx` | Single seat — renders `passage`/`isBlocked` seats as invisible spacers |
| `utils/seatSelection.ts` | `findBestAdjacentSeats()` — ported verbatim from the web app |

### The seat map

`GET /api/shows/get/:showId` returns the authoritative layout: per-seat `type`/`status`/`isBlocked`, `screenPosition`, `aisleAfterColumns`, `aisleAfterRows`, and pricing (`price_override` overrides the screen's base `pricing` per seat type). `SeatGrid` groups consecutive rows by their dominant seat type to place section headers (`PREMIUM`/`STANDARD`/`SILVER`) at the right boundaries, while still rendering passage seats inline within a row as blank spacers — critical for column alignment around aisles.

### Auto-adjacent selection

Tapping a seat doesn't toggle it individually:
1. Tapping an already-selected seat clears the whole selection.
2. Otherwise, `findBestAdjacentSeats(tappedSeat, seatCount, allSeats)` slides a window of size `seatCount` across the same-row available seats, requiring column contiguity, and scores each valid window — preferring blocks that contain the tapped seat, then ones that extend rightward. The winning block replaces the whole selection via `setSelectedSeats()`.
3. If no valid block of that size exists, an alert explains it and the selection clears.

### Pinch/pan zoom

`SeatGrid` wraps its content in a `GestureDetector` composing `Gesture.Pinch()` (clamped 0.6×–2.2×) and `Gesture.Pan()`, driven by Reanimated shared values, with a double-tap to reset. The gesture detector is configured inside the seat grid; `App.tsx` owns the global safe-area and navigation providers.

### Holding seats

"Proceed" is gated behind `useRequireAuth()`. On tap: `POST /api/booking/hold {show_id, seats}`.
- **200** → navigate to `Checkout` with the full `CheckoutParams` (see [docs/navigation.md](navigation.md#navigation-param-types)), carrying the real `hold_expires_at`.
- **409** (seat taken since the layout was fetched) → an alert names the conflicting seats (matched back to their labels), clears the selection, and refetches the layout.

The seat map also refetches on screen focus and app-foreground (`useFocusEffect` + `AppState` listener) — there's no realtime/socket layer in the API, so this poll-on-resume is the only staleness guard.

---

## booking

**Domain:** Checkout, payment, and confirmation.

| File | Purpose |
|---|---|
| `screens/CheckoutScreen.tsx` | Summary, real countdown, offers, promo code, price breakdown |
| `screens/PaymentScreen.tsx` | Amount summary + "Pay securely" → `POST /api/payment/create-order` |
| `screens/RazorpayWebViewScreen.tsx` | Hosts `checkout.js` in a WebView, bridges the result back via `postMessage` |
| `screens/BookingSuccessScreen.tsx` | Fetches the real booking by `payment_id`, renders + saves/shares the ticket |
| `screens/BookingFailureScreen.tsx` | Cancelled/failed payment, hold countdown continues, Try Again / Release Seats |
| `components/PriceBreakdown.tsx` | Subtotal / fee / GST / discount / total rows — settings-driven, not hardcoded |
| `utils/pricing.ts` | `computeCheckoutPricing()` — pure function, unit tested |
| `utils/razorpayCheckoutHtml.ts` | Builds the inline HTML page for the WebView |

### Pricing

`computeCheckoutPricing()` mirrors `cinema-hall-api/controllers/payment.Controller.js` exactly:

```ts
convenienceTotal = numTickets * feePerTicket   // GET /api/settings, default ₹15/ticket
gstAmount        = round(convenienceTotal * gstPercentage / 100, 2)   // GST on the FEE ONLY, default 18%
subtotalWithFee  = ticketTotal + convenienceTotal + gstAmount
grandTotal       = round(subtotalWithFee - discountAmount, 2)
```

This is display-only — `POST /api/payment/create-order` recomputes the real charge server-side, so a mismatch here would only ever show the wrong number, never charge the wrong amount. Covered by `src/features/booking/utils/pricing.test.ts`.

### CheckoutScreen

- Countdown seconds are computed once from `route.params.holdExpiresAt` at mount, not a fixed 5:00 — expiry replaces to `SeatSelection` with an alert.
- Back/cancel calls `POST /api/booking/release` before leaving.
- Offers: `GET /api/offers/active`, filtered to ones the current subtotal qualifies for, rendered as a horizontal card row; tapping one or typing a code both call `POST /api/offers/validate`.

### Payment → RazorpayWebView

```
PaymentScreen: POST /api/payment/create-order {show_id, seats, offer_code?}
   → {order_id, amount(paise), currency, key_id}
RazorpayWebViewScreen: loads an inline HTML page with <script src="checkout.js">,
   opens Razorpay's native checkout sheet, bridges back via window.ReactNativeWebView.postMessage
   → success  → POST /api/payment/verify {razorpay_order_id, razorpay_payment_id, razorpay_signature}
              → BookingSuccess { paymentId }
   → dismiss  → BookingFailure { reason: 'cancelled' }   (hold stays alive)
   → error    → BookingFailure { reason: 'failed' }
```

A `settledRef` guard prevents the bridge firing twice (e.g. a stray `dismiss` arriving after `success`). `BookingSuccessScreen` deliberately re-fetches the booking by `payment_id` rather than trusting anything held locally — the server's Razorpay webhook can create the booking independently of the client ever calling `/verify`, so the client's own belief about "did it work" isn't authoritative.

### BookingFailureScreen

The seat hold's countdown keeps running on this screen too (same `holdExpiresAt` from `checkoutParams`) — if it lapses before the user acts, it auto-redirects to `SeatSelection`. "Try Again" replaces to `Checkout` with the same params (re-verifying settings/offers fresh rather than jumping straight back into Payment). "Cancel and Release Seats" calls `POST /api/booking/release`.

---

## profile

**Domain:** Account, booking history, settings.

| File | Purpose |
|---|---|
| `screens/ProfileScreen.tsx` | Real `/me` data, inline edit, connected-provider management, Dark Mode |
| `screens/MyBookingsScreen.tsx` | Upcoming/Past, pull-to-refresh, login-gated |
| `screens/TicketDetailScreen.tsx` | Full ticket, price breakdown, refund status, Directions, Contact Support |
| `screens/ChangePasswordScreen.tsx` | For accounts with a password set |
| `screens/SetPasswordScreen.tsx` | For Google-only accounts (`hasPassword === false`) |

### ProfileScreen

Guests see a "Sign In" prompt (Dark Mode still works without a session). Signed-in users get: avatar (real `avatarUrl` or gradient initials), inline name/phone editing (`PUT /api/customer/update`), a "Connected Login Methods" card (Email & Password status, Google Connect/Disconnect via `linkProvider`/`unlinkProvider`), and a menu routing to My Bookings, Offers, Change/Set Password, and a real Logout (`authStore.logout()`, resets to `MainTabs` — not `Login`).

### MyBookingsScreen

`GET /api/booking/my-bookings`, split into Upcoming (`status==='confirmed' && showDate >= today`) and Past. Each card shows a refund badge when applicable and a Directions link.

### TicketDetailScreen

No Cancel Booking button — there is no customer-facing cancellation endpoint in the API; refunds are admin-initiated. In its place: a price breakdown (ticket subtotal derived from the booking's own totals), a refund block when one exists (`refundStatus`, amount, Razorpay refund ID, timestamps, failure reason), Directions, and a Contact Support mail link.

---

## offers

**Domain:** Discount coupons — browsable in their own screen *and* applicable inline at Checkout.

| File | Purpose |
|---|---|
| `screens/OffersScreen.tsx` | Login-gated grid of active offers |

`GET /api/offers/active`, real clipboard copy (`@react-native-clipboard/clipboard`), `is_redeemed` offers render struck-through and non-copyable, expiring-within-3-days offers get an "ENDING SOON" badge, hall-scoped offers get a "HALL OFFER" badge.

---

## Adding a New Feature

1. Add the DTO to `src/types/api.ts`, the mapper to `src/services/mappers.ts`, and the service function to `src/services/<name>Service.ts` (see [docs/architecture.md](architecture.md#scaling-guide)).
2. Create `src/features/<name>/` (`components/`, `screens/`, `index.ts`).
3. Register screens in `RootNavigator`/`TabNavigator` + `src/types/navigation.ts`.
4. Follow the `useTheme()` + `makeStyles(colors)` pattern for any new styled component — see [docs/design-system.md](design-system.md#theming-architecture).
