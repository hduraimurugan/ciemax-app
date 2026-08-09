# Feature Modules

Each feature in `src/features/` is a self-contained domain module. It owns its components, screens, and types, and exposes a single `index.ts` barrel. No feature imports from another feature.

Screens marked **⚠ unrouted** below still compile and are still exported from their feature's `index.ts`, but are not registered in `RootNavigator`/`TabNavigator` — see [docs/navigation.md](navigation.md) for the live route map.

---

## onboarding

**Domain:** First-run experience — shown once per app launch, before auth.

| File | Purpose |
|---|---|
| `screens/SplashScreen.tsx` | Brand moment — icon, wordmark, tagline; auto-advances to Onboarding |
| `screens/OnboardingScreen.tsx` | 3-slide carousel introducing the app |

### SplashScreen

- 88×88 rounded icon box (`accent` background, `makeNeonShadow` glow) with a `Play` icon
- "CineHall" wordmark (JetBrains Mono Bold) + "BOOK. WATCH. REPEAT." tagline
- `useEffect` sets a 2200ms `setTimeout` that calls `navigation.replace('Onboarding')` — cleaned up on unmount
- No back button, no user interaction

### OnboardingScreen

- 3 slides, local `idx` state (not a swipeable `ScrollView` — matches the design's button-driven pagination):
  1. "Browse Now Showing & Upcoming"
  2. "Pick Your Perfect Seat"
  3. "Pay & Walk Right In"
- "Skip" (top-right) and the last slide's "Get Started" both call `navigation.reset({ index: 0, routes: [{ name: 'Login' }] })` — Login becomes the stack root (no back button)
- Dot pagination: active dot widens to 18px, `accent` colored; others are 6px, `border` colored
- Illustration placeholder box (striped pattern) stands in for artwork, matching the design's own placeholder convention

---

## auth

**Domain:** Authentication UI (no backend — UI only). The CineHall design has **no signup screen** — Login → Otp is the only path for new and returning users.

| File | Purpose |
|---|---|
| `screens/LoginScreen.tsx` | Email input → Otp |
| `screens/OtpScreen.tsx` | 6-digit code entry, 30s resend countdown |
| `screens/RegisterScreen.tsx` | ⚠ unrouted — two-step form + inline OTP, kept for reference |

### LoginScreen

- "CineHall" wordmark + "Sign in to book your next show" subtitle
- Single `EMAIL ADDRESS` `Input` — no password field
- "Continue with Email" → `navigation.navigate('Otp', { email })`
- "OR" divider, then a decorative "Continue with Google" secondary button (no real OAuth — same UI-only convention as before)

### OtpScreen

- Back button → Login
- "Verify your email" heading + masked email subtitle (`you@***@domain.com`-style mask via regex)
- 6 individual digit boxes with auto-advance-on-input and backspace-to-previous-box focus handling (`TextInput` refs array)
- Resend countdown built on the shared `useCountdown(30)` hook — shows "Resend code in 0:SS" while running, a tappable "Resend Code" link once it hits zero (`reset(30)` restarts it)
- "Verify & Continue" → `navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })`

### RegisterScreen (unrouted)

Untouched two-step flow (form → inline 6-box OTP with its own local 60s timer) from the pre-CineHall app. Kept on disk in case a standalone sign-up flow is reintroduced; its `Props` type no longer references the removed `'Register'` route (uses a loosened `NativeStackNavigationProp<RootStackParamList, 'Login'>` type instead) so it still compiles.

---

## movies

**Domain:** Film catalogue — browsing, discovery, and detail.

| File | Purpose |
|---|---|
| `screens/MoviesScreen.tsx` | **Home tab** — hero carousel + Now Showing / Coming Soon / Recommended rows |
| `screens/MovieDetailScreen.tsx` | Backdrop hero, synopsis, cast, "Book Tickets" CTA |
| `components/MovieCard.tsx` | 128×184px poster card, `variant: 'rating' \| 'soon' \| 'plain'` |
| `components/MovieFilter.tsx` | ⚠ built but not wired into any screen — no filter UI in the design |

### MoviesScreen (Home)

```
┌─────────────────────────────────────────┐
│  📍 Bengaluru ▾          [🔍] [🔔]        │  ← header (location pill is non-interactive)
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │  Hero carousel (backdrop + overlay)  │ │  ← auto-rotates every 4s
│ │  ★ 8.4 · Now Showing                 │ │
│ │  Spider-Man: Brand New Day           │ │
│ └─────────────────────────────────────┘ │
│ Now Showing                              │
│ ┌──────┐ ┌──────┐                       │  ← horizontal ScrollView, rating badge
│ Coming Soon                              │
│ ┌──────┐                                 │  ← "SOON" badge instead of rating
│ Recommended For You                      │
│ ┌──────┐ ┌──────┐                       │  ← no badge (variant="plain")
└─────────────────────────────────────────┘
```

- Search icon navigates to the sibling `SearchTab`; the header uses `CompositeScreenProps` (tab + stack) so it can also `navigate('MovieDetail', ...)`
- Hero carousel: local `heroIdx` state cycling every 4000ms through `nowShowing.slice(0, 3)`; a segmented progress bar (`Animated.Value` per active slide, `Animated.timing` over 4000ms) mirrors the design's per-slide fill animation — this is a screen-local implementation, **not** the shared `AdBanner` component (see [docs/design-system.md](design-system.md#adbanner))
- "Recommended For You" is `[...nowShowing, ...comingSoon].reverse().slice(0, 4)` — no separate recommendation service

**MovieCard variants:**
| Variant | Shows | Used by |
|---|---|---|
| `rating` (default) | ⭐ rating pill, top-right | Now Showing row |
| `soon` | Violet "SOON" pill, top-left | Coming Soon row |
| `plain` | No overlay badge | Recommended row |

### MovieDetailScreen

- 340px backdrop hero (movie's own `backdropUrl`, not blurred — matches the design, which shows the poster art directly rather than a blurred version) with back / favorite (`Heart`) / share (`Share2`) icon buttons and a centered play-trailer circle button
- Title, badge row (`★ rating`, genre, duration, language)
- Synopsis with a 110-character clamp + "Read more"/"Show less" toggle
- Cast row: horizontal scroll of 56px circle avatars showing each `CastMember.initials`, with `name` below
- "Book Tickets" → `navigation.navigate('Showtimes', { movieId })` — no date selector on this screen; date selection now lives entirely on `ShowtimesScreen` (see below), removing the duplicated 7-day date-strip helper that used to exist in both `MovieDetailScreen` and `TheatresScreen`

---

## search

**Domain:** Movie search. New feature — no equivalent existed before the CineHall redesign.

| File | Purpose |
|---|---|
| `screens/SearchScreen.tsx` | Recent Searches + Trending chips ⇄ live 2-column results grid |

- Empty query: "RECENT SEARCHES" list (3 static, in-memory sample queries) + "TRENDING" chip wrap (4 static chips) — tapping either sets the query
- Non-empty query: debounce-free live search via `moviesService.searchMovies(query)` on every keystroke (`useEffect` keyed on `query`, cancelled on cleanup), rendered as a 2-column `FlatList` grid (poster + title only, no rating badge — matches the design)
- No results: `No results for "<query>"` message

---

## theatres

**Domain:** Cinema and showtime selection.

| File | Purpose |
|---|---|
| `screens/ShowtimesScreen.tsx` | **Routed** — merges the old Theatres + ShowSelection screens into one, per the design |
| `screens/TheatresScreen.tsx` | ⚠ unrouted — superseded |
| `screens/AllTheatresScreen.tsx` | ⚠ unrouted — old "Theatres" tab, no design equivalent |
| `screens/ShowSelectionScreen.tsx` | ⚠ unrouted — superseded |
| `components/TheatreCard.tsx` | ⚠ unrouted — only used by the superseded screens above |
| `components/ShowTimeChip.tsx` | ⚠ unrouted — same |
| `types.ts` | `ShowGroup`, `FormatFilter` |

### ShowtimesScreen

```
┌─────────────────────────────────────────┐
│ [← Back]  Spider-Man: Brand New Day     │  ← header
│           Select date & showtime         │
├─────────────────────────────────────────┤
│ SAT  SUN  MON  TUE  WED  THU  FRI       │  ← 7-day date strip (today → +6)
│  9    10   11   12   13   14   15       │
├─────────────────────────────────────────┤
│ Grand Vista Cinemas                      │
│ Screen 3 · Dolby Atmos                   │
│ [10:30 AM] [1:45 PM] [5:00 PM] [9:15 PM]│  ← green/amber/disabled chips
│ Skyline Multiplex                        │
│ Screen 1 · IMAX                          │
│ [11:00 AM] [2:30 PM] [8:00 PM]          │
└─────────────────────────────────────────┘
```

- Fetches the movie (`getMovieById`), the theatres showing it (`useTheatresForMovie`), and all of its shows (`useShowsForMovie` — new hook in `useTheatres.ts`)
- Date strip built from `theatresService.SHOWTIME_DATES` (the next 7 real calendar dates, computed once at module load — not hardcoded strings) so it's always correct regardless of when the app is run
- Showtime chip status is derived per-show, not stored: `availableSeats === 0` → soldout (disabled, secondary bg), `< 20%` → "fast" (amber), else "available" (green) — see `statusOf()` in the screen and [docs/data-models.md](data-models.md#show)
- Tapping an available/fast chip calls `setSelectedMovie` / `setSelectedTheatre` / `setSelectedShow` on `bookingStore` **and then** navigates to `SeatSelection` — this is what keeps the header/summary on `SeatSelectionScreen` and `CheckoutScreen` populated further down the flow

### TheatreCard / ShowTimeChip (unrouted)

Both theme-converted (compile cleanly) but no longer reachable from any screen — `ShowtimesScreen` builds its own inline cinema-card + chip UI instead, since the design's chips are simpler (time-only, no format dot/availability caption) than what `ShowTimeChip` renders.

---

## seats

**Domain:** Interactive seat selection. The most complex feature in the app.

| File | Purpose |
|---|---|
| `screens/SeatSelectionScreen.tsx` | Sticky header + grid + bottom selection bar |
| `components/SeatGrid.tsx` | Pure grid renderer — no toggle logic |
| `components/SeatItem.tsx` | Single seat square (28×28px) |
| `components/SeatLegend.tsx` | Available / Premium / Selected / Booked colour key |
| `components/SectionHeader.tsx` | PREMIUM / STANDARD divider with price |
| `types.ts` | `SeatItemState`, `SeatGridProps` |

### SeatGrid Architecture

Unchanged from before the redesign — the critical design decision remains: `SeatGrid` is a **pure renderer**. It receives:

```tsx
interface SeatGridProps {
  layout: SeatLayout;             // From seatsService (original statuses)
  selectedSeatIds: Set<string>;   // From Zustand store
  onSeatPress: (seat: Seat) => void;
}
```

It derives the visual state at render time:
```tsx
const effectiveStatus =
  selectedSeatIds.has(seat.id) ? 'selected' : seat.status;
```

This means:
- `SeatGrid` never mutates data
- Toggle logic lives entirely in `useBookingStore.toggleSeat`
- The component can be tested in isolation with any `layout` + `selectedSeatIds`
- `SectionRenderer` now skips a section entirely (`rows.length === 0` → `return null`) so the always-empty `silver` tier renders nothing instead of an empty header

### Seat States

| State | Visual |
|---|---|
| Available (standard) | Transparent fill, `colors.border` hairline border |
| Available (premium) | `colors.goldDim` fill, `colors.gold` border — new: premium rows are visually distinct even before selection, matching the design |
| Selected | `colors.seatSelected` fill (= accent) |
| Booked | `colors.seatBooked` fill (= secondary) — not tappable |

### SeatSelectionScreen layout

```
┌─────────────────────────────────────────┐
│ [← Back]  [Poster 40×60]  Movie / Show  │  ← sticky header
├─────────────────────────────────────────┤
│         ╭──────────────╮                │  ← screen arc (accent-tinted, rounded-top)
│           SCREEN THIS WAY                │
│  Available  Premium  Selected  Booked    │  ← SeatLegend (4 items now, was 3)
│                                         │
│  A  [1][2][3]...[12]  A   PREMIUM ₹350  │
│  ...                                    │
│  D  [1][2][3]...[12]  D   STANDARD ₹220 │
│  ...  (rows D–J, 12 seats each)         │
├─────────────────────────────────────────┤
│ Seats: [A3] [A4] [A5]   (zinc pills)    │  ← seat pills (if any selected)
│ Total: ₹1,050          [Proceed] primary│  ← bottom bar → navigate('Checkout')
└─────────────────────────────────────────┘
```

### Seat Generation

`seatsService.generateSeatLayout(showId)` now produces a **fixed** layout matching the CineHall design exactly, rather than a per-show pseudo-random one:
- Rows A–C: `premium`, 12 seats/row, ₹350
- Rows D–J: `gold` (displayed as "STANDARD"), 12 seats/row, ₹220
- `silver`: always `[]`
- Pre-booked seats: the fixed `BOOKED` list (see [docs/data-models.md](data-models.md#seat)) — same booked seats for every show, matching the design's flat mock catalog. The `SeatPricing` config values live in `src/constants/config.ts`.

---

## booking

**Domain:** Order review, payment, and confirmation.

| File | Purpose |
|---|---|
| `screens/CheckoutScreen.tsx` | **Routed as `Checkout`** — summary + seats + price breakdown + promo code |
| `screens/OrderSummaryScreen.tsx` | ⚠ unrouted — superseded (had a horizontal offer-carousel instead of a single input) |
| `screens/PaymentScreen.tsx` | Card / UPI / Wallet tabs + processing sub-state |
| `screens/BookingSuccessScreen.tsx` | Ticket card with QR code, download/share/home actions |
| `screens/BookingFailureScreen.tsx` | Error screen with try-again and home actions |
| `components/PriceBreakdown.tsx` | Subtotal / fee / GST / discount / grand total rows |

### CheckoutScreen

- Header includes a `CountdownTimer initialSeconds={300}` (5-minute seat hold, down from the old 10-minute `OrderSummaryScreen` session) — on expiry, an `Alert` resets to `MainTabs`
- Movie/cinema/showtime summary card, seat chips row (`SEATS (n)`)
- `PriceBreakdown`: Subtotal → Convenience Fee (₹30/seat) → GST (18% of subtotal+fee) → Discount (if a promo is applied) → **Total**
- A single promo-code `TextInput` + "Apply" button — replaces the old horizontal scrollable offer-carousel UI. "Apply" calls `offersService.validateCoupon(code, subtotal)`; on success it calls `setAppliedOffer(offer)` on `bookingStore` (reusing the store's existing `appliedOffer`/`getAppliedDiscount`/`getGrandTotal` getters rather than adding new store state)
- "Pay Now · ₹X" → `navigation.navigate('Payment')`

### PaymentScreen

- 3 payment method tabs — **Card / UPI / Wallet** (down from the old 4-way UPI/Card/NetBanking/Wallet radio-card list; `'netbanking'` is kept in the `PaymentMethod` type union for data-shape stability even though there's no UI for it anymore)
- Tab-specific inputs: Card → number + MM/YY + CVV; UPI → `yourname@upi` input + 3 app tiles (GPay/PhonePe/Paytm); Wallet → 3 radio rows (Amazon Pay/Paytm Wallet/Mobikwik)
- **Processing sub-state**: tapping "Pay" swaps the whole screen body for a centered spinner (`Animated` rotation loop) + "Processing payment via Razorpay..." while `bookingService.createBooking(...)` runs, instead of only showing a spinner inside the button as before
- On success: `setBookingDetails(booking)` → `navigate('BookingSuccess', { bookingId })`, then `resetBookingFlow()` after 3s
- On error: `navigate('BookingFailure', { error: e.message })`

### BookingSuccessScreen

Displays a styled ticket card (visual structure unchanged from before, just theme-converted and rebranded):

```
┌─────────────────────────────────────────┐
│  CINEHALL             [accent header]    │
│  Movie Title                             │
│  Date · Time · Format                    │
├ · · · · · · · · · · · · · · · · · · · · ┤  ← perforated divider
│  Booking ID    #CH20938                  │
│  Theatre       Skyline Multiplex         │
│  Date          Sat, 9 Aug 2026           │
│  Time          7:30 PM                   │
│  Seats         [E5] [E6]                 │
│  Amount        ₹610                      │
│           ┌─────────┐                    │
│           │  QR Code │                   │
│           └─────────┘                    │
│        Scan at theatre entrance          │
└─────────────────────────────────────────┘
       [↓ Download]  [⤴ Share]  [Home →]
             "View My Bookings" link
```

- Entry animation: `Animated.spring` scale + `Animated.timing` opacity on the check icon circle (unchanged)
- `resetBookingFlow()` called after 3 seconds to clean up store state
- New "View My Bookings" link resets into `MainTabs` with the `Bookings` tab focused (see [docs/navigation.md](navigation.md#resetting-into-a-specific-tab-used-after-bookingsuccess--view-my-bookings))
- The `DashedLine` sub-component was hoisted to module scope (was previously defined inline inside the screen component on every render) and now takes `styles` as a prop, fixing a `react/no-unstable-nested-components` lint warning

### BookingFailureScreen

Unchanged in behavior — theme-converted only. Note: the CineHall design has **no** payment-failure screen of its own; this was kept because the mock payment flow can still fail, and dropping error handling would be a regression, not a design-fidelity improvement.

---

## profile

**Domain:** User account, booking history, and app settings. Now a **tab-bar root**, not a stack screen reached via an avatar button.

| File | Purpose |
|---|---|
| `screens/ProfileScreen.tsx` | Avatar, user info, Dark Mode toggle, menu items |
| `screens/MyBookingsScreen.tsx` | Upcoming / Past tabs, booking cards → TicketDetail |
| `screens/TicketDetailScreen.tsx` | **New** — full ticket view + Cancel Booking |

### ProfileScreen

- Avatar: `LinearGradient` from `colors.accent` to `colors.accentDim`, 80×80px circle, initials "AS" — sample user "Aditi Sharma" matches the CineHall design's placeholder content (was "Hello, Cinephile!" / "DH" before)
- **Dark Mode row**: a `Switch` bound to `useTheme().toggleTheme` — the one and only in-app theme control (see [docs/design-system.md](design-system.md#toggling-the-theme))
- Menu items — each in a `Card` with a 40×40 icon container and `ChevronRight`:
  - My Bookings — `Ticket` icon → `navigation.navigate('Bookings')` (sibling tab)
  - Payment Methods — `CreditCard` icon (decorative, no-op)
  - Notifications — `Bell` icon (decorative, no-op)
  - Help & Support — `HelpCircle` icon (decorative, no-op)
  - Logout — `LogOut` icon → `resetBookingFlow()` + resets the **root stack** to `Login` via `navigation.getParent()?.reset(...)` (see [docs/navigation.md](navigation.md#reaching-the-parent-stack-navigator-explicitly))
- Dropped from the old menu: "Offers & Coupons" and "Saved Theatres" (no design equivalent), "Settings" (folded away), the "Edit Profile" button

### MyBookingsScreen

- **Tab switcher**: Upcoming / Past, same filter logic as before (`status === 'confirmed' && showDate >= today` vs. everything else)
- Booking cards: unchanged visual structure (poster thumb, status-colored left border, meta rows, seat pills, amount)
- **Tapping a card now navigates to `TicketDetailScreen`** instead of opening a `Modal` with just a QR code — the design's Ticket Detail screen needed more room (Cancel Booking confirm panel, Contact Support) than a small modal could hold

### TicketDetailScreen (new)

```
┌─────────────────────────────────────────┐
│ [← Back]  E-Ticket                       │
├─────────────────────────────────────────┤
│         VALID FOR ENTRY                  │
│         ┌───────────┐                    │
│         │  QR Code   │  (160px)          │
│         └───────────┘                    │
│           CH20938                        │
│  ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄  │  ← dashed divider
│  Movie          Odyssey                  │
│  Cinema         Skyline Multiplex        │
│  Date & Time    Aug 9 · 7:30 PM          │
│  Seats          E5, E6                   │
│  Amount Paid    ₹610                     │
├─────────────────────────────────────────┤
│  [Cancel Booking]      [Contact Support] │
└─────────────────────────────────────────┘
```

- Fetches the booking via `bookingService.getBookingById(bookingId)`
- Status label: `VALID FOR ENTRY` (confirmed), `CANCELLED`, or `BOOKING COMPLETED`
- "Cancel Booking" (disabled once already cancelled) opens an inline confirm panel — "Keep Booking" / "Yes, Cancel" — calling `bookingService.cancelBooking(bookingId)` and re-fetching on confirm, matching the design's inline-panel pattern rather than a separate confirmation dialog
- "Contact Support" is decorative (no-op), matching the design

---

## offers

**Domain:** Discount coupons. ⚠ **Unrouted** — the CineHall design has no offer-browsing screen; promo codes are entered directly in `CheckoutScreen`.

| File | Purpose |
|---|---|
| `screens/OffersScreen.tsx` | ⚠ unrouted — 2-column grid of offer cards |

Kept on disk (theme-converted, still compiles) for reference. `offersService.ts` is still very much alive — it backs `CheckoutScreen`'s promo-code validation (see [docs/data-models.md](data-models.md#offer)).

---

## Adding a New Feature

1. Create the folder:
   ```
   src/features/<name>/
   ├── components/
   ├── screens/
   ├── types.ts
   └── index.ts
   ```

2. Add mock data to a new or existing service in `src/services/`

3. Add any data fetching to a hook in `src/hooks/` (or a feature-local hook)

4. Register screens in `src/app/navigation/RootNavigator.tsx` or `TabNavigator.tsx`

5. Add param types to `src/types/navigation.ts`

6. If the screen needs theme colors, follow the `useTheme()` + `makeStyles(colors)` pattern — see [docs/design-system.md](design-system.md#theming-architecture)

7. Export public surface from `index.ts`:
   ```ts
   export { MyNewScreen } from './screens/MyNewScreen';
   export { MyNewCard } from './components/MyNewCard';
   ```

The rest of the codebase imports only from `@features/<name>` — never from internal paths.
