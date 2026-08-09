# State Management

## Strategy

CineHall uses **Zustand v5** for global client state, split into two narrowly-scoped stores. All other data (movie lists, seat layouts, booking history) is held in local component state via custom hooks.

| What | Where | Why |
|---|---|---|
| Active booking flow | `bookingStore` (Zustand) | Shared across 6 screens |
| Theme mode + active palette | `themeStore` (Zustand + persist) | Read by every themed component in the tree |
| Movie / theatre / show lists | Local state (hooks) | Screen-scoped, no sharing needed |
| Seat layout | Local state (hook) | Large, screen-scoped, derived from showId |
| Booking history | Local state | Fetched fresh each visit |
| UI state (modals, tabs, promo code input) | Local `useState` | Component-local |

---

## Booking Store

Source: [`src/store/bookingStore.ts`](../src/store/bookingStore.ts)

### State Shape

```ts
interface BookingState {
  // Selection state (one per step in the booking flow)
  selectedMovie:   Movie | null;
  selectedTheatre: Theatre | null;
  selectedShow:    Show | null;
  selectedSeats:   Seat[];
  appliedCoupon:   string | null;
  appliedOffer:    Offer | null;     // Full offer object
  bookingDetails:  Booking | null;   // Set after successful payment

  // Actions
  setSelectedMovie:   (movie: Movie) => void;
  setSelectedTheatre: (theatre: Theatre) => void;
  setSelectedShow:    (show: Show) => void;
  toggleSeat:         (seat: Seat) => void;
  clearSeatSelection: () => void;
  setAppliedCoupon:   (code: string | null) => void;
  setAppliedOffer:    (offer: Offer | null) => void;
  setBookingDetails:  (booking: Booking) => void;
  resetBookingFlow:   () => void;

  // Computed getters (called like functions)
  getTotalAmount:      () => number;   // Sum of selected seat prices
  getConvenienceFee:   () => number;   // ₹30 per seat
  getGST:              () => number;   // 18% of (subtotal + convenience fee)
  getAppliedDiscount:  () => number;   // Discount from appliedOffer (flat or % with cap)
  getGrandTotal:       () => number;   // total + fee + GST − discount
}
```

### Fee/GST formula (fixed during the CineHall redesign)

Before the redesign, three different call sites computed the convenience fee/GST independently and disagreed with each other: `bookingStore.getConvenienceFee` used ₹15/seat, `bookingStore.getGST` was 18% of the fee only, and `bookingService.createBooking` separately recomputed a fee as 5% of subtotal. All three are now unified on a single formula, defined once in `bookingStore`:

```ts
getConvenienceFee: () => get().selectedSeats.length * 30,   // ₹30/seat — matches the CineHall design

getGST: () => {
  const { getTotalAmount, getConvenienceFee } = get();
  return Math.round((getTotalAmount() + getConvenienceFee()) * 0.18);   // 18% of (subtotal + fee)
},
```

`PaymentScreen` reads `getConvenienceFee()` and `getGrandTotal()` from the store and passes them **into** `bookingService.createBooking({ ..., convenienceFee, totalAmount })` instead of letting the service re-derive its own numbers — so the formula now lives in exactly one place.

---

## Theme Store

Source: [`src/store/themeStore.ts`](../src/store/themeStore.ts)

### State Shape

```ts
type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  colors: ColorTokens;          // The currently active palette (DarkColors or LightColors)
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}
```

### Persistence

Wrapped in Zustand's `persist` middleware, backed by `@react-native-async-storage/async-storage`:

```ts
persist(
  (set) => ({ /* ... */ }),
  {
    name: 'cinehall-theme',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: state => ({ mode: state.mode }),   // only mode is persisted
    onRehydrateStorage: () => state => {
      if (state) state.colors = paletteFor(state.mode);   // colors re-derived, not persisted
    },
  }
)
```

Only `mode` is written to disk — `colors` is always re-derived from `mode` via `paletteFor()`, so `DarkColors`/`LightColors` can be edited freely without invalidating a user's stored preference.

### Reading it in components

Components never call `useThemeStore` directly — they go through the [`useTheme()`](../src/hooks/useTheme.ts) hook:

```tsx
import { useTheme } from '@hooks/useTheme';

const { colors, mode, toggleTheme } = useTheme();
const styles = useMemo(() => makeStyles(colors), [colors]);
```

See [docs/design-system.md](design-system.md#theming-architecture) for the full theming pattern used across every screen and shared component.

### Toggling

The only UI control is the **Dark Mode** switch on `ProfileScreen`:

```tsx
<Switch value={mode === 'dark'} onValueChange={toggleTheme} />
```

---

## Booking Flow Lifecycle

```
1. ShowtimesScreen
       setSelectedMovie(movie)       ← fetched by movieId, set once the user taps a showtime
       setSelectedTheatre(theatre)
       setSelectedShow(show)         ← clears selectedSeats as a side effect
       navigate → SeatSelection

2. SeatSelectionScreen
       toggleSeat(seat)              ← adds or removes from selectedSeats
       navigate → Checkout

3. CheckoutScreen
       reads: selectedMovie, selectedTheatre, selectedShow, selectedSeats
       setAppliedOffer(offer)        ← user optionally enters a promo code, validated via offersService
       navigate → Payment

4. PaymentScreen
       calls: createBooking({ ..., convenienceFee: getConvenienceFee(), totalAmount: getGrandTotal() })
       on success: setBookingDetails(booking) → navigate → BookingSuccess
       on failure: navigate → BookingFailure  ← with error message param

5. BookingSuccessScreen
       reads: bookingDetails
       "Home" → navigation.reset() → MainTabs
       "View My Bookings" → navigation.reset() → MainTabs (Bookings tab)
       setTimeout: resetBookingFlow()   ← cleans up after 3s
```

---

## Using the Store in Components

### Reading a single slice (avoids unnecessary re-renders)

```tsx
// Only re-renders when selectedSeats changes
const selectedSeats = useBookingStore(s => s.selectedSeats);
```

### Reading multiple slices

```tsx
const { selectedMovie, selectedShow } = useBookingStore(s => ({
  selectedMovie: s.selectedMovie,
  selectedShow: s.selectedShow,
}));
```

### Calling an action

```tsx
const toggleSeat = useBookingStore(s => s.toggleSeat);

function handleSeatPress(seat: Seat) {
  toggleSeat(seat);   // Zustand handles the state update
}
```

### Calling a computed getter

```tsx
const getTotalAmount = useBookingStore(s => s.getTotalAmount);
const total = getTotalAmount();   // Recomputed on each render
```

---

## toggleSeat Logic

```ts
toggleSeat: (seat) => set(state => {
  const alreadySelected = state.selectedSeats.some(s => s.id === seat.id);

  if (alreadySelected) {
    // Deselect
    return { selectedSeats: state.selectedSeats.filter(s => s.id !== seat.id) };
  }

  if (state.selectedSeats.length >= 8) {
    return state;   // Max 8 seats per booking — silently ignore
  }

  // Select — override status to 'selected'
  return {
    selectedSeats: [...state.selectedSeats, { ...seat, status: 'selected' }],
  };
}),
```

Key points:
- The original `Seat` object (with `status: 'available'`) is never mutated
- `SeatGrid` uses `selectedSeatIds: Set<string>` to visually override status without touching the layout data
- Max seat limit is controlled by `AppConfig.maxSeatSelectionPerBooking` (default: 8) — note this is duplicated as a literal `8` inside `toggleSeat` rather than importing the config value, a pre-existing minor inconsistency not touched by the CineHall redesign

---

## setSelectedShow Side Effect

Changing the show automatically clears the seat selection:

```ts
setSelectedShow: (show) => set({ selectedShow: show, selectedSeats: [] }),
```

This prevents a stale seat selection if the user navigates back and picks a different show.

---

## resetBookingFlow

Called after `BookingSuccessScreen` is shown:

```ts
resetBookingFlow: () => set({
  selectedMovie: null,
  selectedTheatre: null,
  selectedShow: null,
  selectedSeats: [],
  appliedCoupon: null,
  appliedOffer: null,
  bookingDetails: null,
}),
```

The 3-second delay before calling this allows `BookingSuccessScreen` to read `bookingDetails` before it is cleared. Also called on `ProfileScreen`'s Logout action, alongside a reset to `Login`.

---

## Why Not Redux or Context?

| Criterion | Zustand | Redux | Context |
|---|---|---|---|
| Boilerplate | Minimal | Heavy | None |
| Re-render granularity | Per-selector | Per-selector | Whole tree |
| DevTools | Via middleware | Built-in | None |
| Bundle size | ~1kb | ~40kb | 0 |
| Async actions | Direct | Thunk/Saga | Manual |
| Persistence | Built-in `persist` middleware | Needs redux-persist | Manual |

For a booking flow with ~7 fields and a 2-field theme store, Zustand is the right fit for both. It's also why `themeStore` was chosen over introducing React Context for theming — using the same pattern as the pre-existing `bookingStore` keeps the codebase's state-management story singular instead of mixing two different approaches.
