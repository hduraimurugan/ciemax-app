# Feature Modules

Each feature in `src/features/` is a self-contained domain module. It owns its components, screens, and types, and exposes a single `index.ts` barrel. No feature imports from another feature.

---

## movies

**Domain:** Film catalogue — browsing and discovering movies.

| File | Purpose |
|---|---|
| `screens/MoviesScreen.tsx` | Home tab — now showing / coming soon grid |
| `screens/MovieDetailScreen.tsx` | Full detail view + "Book Tickets" CTA |
| `components/MovieCard.tsx` | Poster card used in the grid |
| `components/MovieFilter.tsx` | Now Showing / Coming Soon tab toggle |
| `types.ts` | `MovieTab`, `MovieFilterState` |

**Data flow:**
```
useMovies hook
    → moviesService.getNowShowingMovies()
    → moviesService.getComingSoonMovies()
        → MoviesScreen renders two lists
```

**MovieCard** displays: poster image, rating pill (top-right), format badges (bottom-left), title, genre, duration + language.

---

## theatres

**Domain:** Theatre discovery and show time selection.

| File | Purpose |
|---|---|
| `screens/TheatresScreen.tsx` | Theatres showing a specific movie |
| `screens/AllTheatresScreen.tsx` | All theatres (Theatres tab) |
| `screens/ShowSelectionScreen.tsx` | Show times at selected theatre |
| `components/TheatreCard.tsx` | Theatre name, address, amenities, rating |
| `components/ShowTimeChip.tsx` | Time pill with format dot, availability text |
| `types.ts` | `ShowGroup`, `FormatFilter` |

**ShowTimeChip states:**
- Default: dark surface, white time text
- Selected: accent border + accentLight background, red time text
- Housefull: 40% opacity, `disabled` prop — not tappable

**Availability colouring** uses `getAvailabilityColor()` from `shared/utils/formatters`:
- Housefull → `Colors.error` red
- Fast Filling → `Colors.warning` amber
- Filling Fast → `Colors.info` blue
- Available → `Colors.success` green

---

## seats

**Domain:** Interactive seat selection. The most complex feature in the app.

| File | Purpose |
|---|---|
| `screens/SeatSelectionScreen.tsx` | Screen wrapping the grid + selection summary bar |
| `components/SeatGrid.tsx` | Pure grid renderer — no toggle logic |
| `components/SeatItem.tsx` | Single seat circle (30×30px) |
| `components/SeatLegend.tsx` | Available / Selected / Booked colour key |
| `components/SectionHeader.tsx` | PREMIUM / GOLD / SILVER divider with price |
| `types.ts` | `SeatItemState`, `SeatGridProps` |

### SeatGrid Architecture

The critical design decision: `SeatGrid` is a **pure renderer**. It receives:

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

### Layout Structure

```
SCREEN bar
─────────────────
SeatLegend

── PREMIUM ─ ₹400 ──
A  [1][2][3]...[12]  A
B  [1][2][3]...[12]  B
C  [1][2][3]...[12]  C

── GOLD ─── ₹250 ──
D  [1][2][3]...[14]  D
...

── SILVER ── ₹150 ──
H  [1][2][3]...[16]  H
...
```

Row labels appear on both left and right sides. The grid is horizontally scrollable (to fit all columns on narrow screens) and vertically scrollable (nested `ScrollView`).

### Seat Generation

`seatsService.generateSeatLayout(showId)` produces a deterministic layout:
- ~28% of seats are pre-booked using a hash of `showId + rowIndex + seatNumber`
- Same show ID always produces the same layout
- No randomness between renders

---

## booking

**Domain:** Order review and payment confirmation.

| File | Purpose |
|---|---|
| `screens/OrderSummaryScreen.tsx` | Review movie, show details, seats, price |
| `screens/PaymentScreen.tsx` | Payment method selection + mock payment |
| `screens/BookingSuccessScreen.tsx` | Animated confirmation + ticket display |
| `components/PriceBreakdown.tsx` | Subtotal / fee / discount / total rows |

### PaymentScreen

- 4 payment methods: UPI, Card, Net Banking, Wallet
- Selected method gets accent border + accentLight background
- Tapping "Pay" calls `bookingService.createBooking()` (mock 1-second delay)
- On success: `setBookingDetails(booking)` → `navigate('BookingSuccess')`

### BookingSuccessScreen

- Entry animation: `Animated.spring` scale + `Animated.timing` opacity on the ✓ circle
- Displays a "ticket" card: movie, theatre, date/time, seat list, amount paid
- Two CTAs: "Back to Home" and "My Bookings" both call `navigation.reset()`
- `resetBookingFlow()` is called after 3 seconds to clean up store state

---

## auth

**Domain:** Authentication UI (no backend — UI only).

| File | Purpose |
|---|---|
| `screens/LoginScreen.tsx` | Email + password form |
| `screens/RegisterScreen.tsx` | Name, email, phone, password form |

Both screens use `Input` from `shared/ui` and navigate to each other via `navigation.navigate('Register')` / `navigation.navigate('Login')`. Form submission currently calls `navigation.goBack()` as a placeholder.

---

## profile

**Domain:** User account and booking history.

| File | Purpose |
|---|---|
| `screens/ProfileScreen.tsx` | Avatar, menu items (Bookings, Offers, Settings…) |
| `screens/MyBookingsScreen.tsx` | List of past bookings from `bookingService.getUserBookings()` |

`MyBookingsScreen` shows an empty state ("No bookings yet") when `mockBookings` is empty (i.e. the user hasn't booked in the current session).

Each booking card shows:
- Movie title + status badge (confirmed / cancelled / pending)
- Theatre name, date, time
- Seat list
- Booking ID + total amount

---

## offers

**Domain:** Discount coupons and promotional offers.

| File | Purpose |
|---|---|
| `screens/OffersScreen.tsx` | List of active offers with copy-to-clipboard coupon codes |

Tapping a coupon code shows a "✓ COPIED" state for 2 seconds (no real clipboard — UI demo). Offers include: `FIRST50`, `IMAX100`, `WEEKEND20`, `FDFS200`.

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

6. Export public surface from `index.ts`:
   ```ts
   export { MyNewScreen } from './screens/MyNewScreen';
   export { MyNewCard } from './components/MyNewCard';
   ```

The rest of the codebase imports only from `@features/<name>` — never from internal paths.
