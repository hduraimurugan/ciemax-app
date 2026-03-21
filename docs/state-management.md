# State Management

## Strategy

CineBook uses **Zustand v5** for global client state. The scope is intentionally narrow: only the **active booking flow** lives in the store. All other data (movie lists, seat layouts) is held in local component state via custom hooks.

| What | Where | Why |
|---|---|---|
| Active booking flow | Zustand store | Shared across 6 screens |
| Movie / theatre lists | Local state (hooks) | Screen-scoped, no sharing needed |
| Seat layout | Local state (hook) | Large, screen-scoped, derived from showId |
| Booking history | Local state | Fetched fresh each visit |
| UI state (modals, tabs) | Local `useState` | Component-local |

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
  appliedOffer:    Offer | null;     // Full offer object (replaces appliedCoupon string)
  bookingDetails:  Booking | null;   // Set after successful payment

  // Actions
  setSelectedMovie:   (movie: Movie) => void;
  setSelectedTheatre: (theatre: Theatre) => void;
  setSelectedShow:    (show: Show) => void;
  toggleSeat:         (seat: Seat) => void;
  clearSeatSelection: () => void;
  setAppliedOffer:    (offer: Offer | null) => void;
  setBookingDetails:  (booking: Booking) => void;
  resetBookingFlow:   () => void;

  // Computed getters (called like functions)
  getTotalAmount:      () => number;   // Sum of selected seat prices
  getConvenienceFee:   () => number;   // ₹15 per seat
  getGST:              () => number;   // 18% of convenience fee
  getAppliedDiscount:  () => number;   // Discount from appliedOffer (flat or % with cap)
  getGrandTotal:       () => number;   // total + fee + GST − discount
}
```

---

## Booking Flow Lifecycle

```
1. MovieDetailScreen
       setSelectedMovie(movie)
       navigate → Theatres

2. TheatresScreen
       setSelectedTheatre(theatre)
       navigate → ShowSelection

3. ShowSelectionScreen
       setSelectedShow(show)       ← also clears selectedSeats
       navigate → SeatSelection

4. SeatSelectionScreen
       toggleSeat(seat)            ← adds or removes from selectedSeats
       navigate → OrderSummary

5. OrderSummaryScreen
       reads: selectedMovie, selectedTheatre, selectedShow, selectedSeats
       setAppliedOffer(offer)      ← user optionally applies an offer from the panel
       navigate → Payment

6. PaymentScreen
       calls: createBooking(...)   ← service call
       on success: setBookingDetails(booking) → navigate → BookingSuccess
       on failure: navigate → BookingFailure  ← with error message param

7. BookingSuccessScreen
       reads: bookingDetails
       navigation.reset() → MainTabs
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
- Max seat limit is controlled by `AppConfig.maxSeatSelectionPerBooking` (default: 8)

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
  appliedOffer: null,
  bookingDetails: null,
}),
```

The 3-second delay before calling this allows `BookingSuccessScreen` to read `bookingDetails` before it is cleared.

---

## Why Not Redux or Context?

| Criterion | Zustand | Redux | Context |
|---|---|---|---|
| Boilerplate | Minimal | Heavy | None |
| Re-render granularity | Per-selector | Per-selector | Whole tree |
| DevTools | Via middleware | Built-in | None |
| Bundle size | ~1kb | ~40kb | 0 |
| Async actions | Direct | Thunk/Saga | Manual |

For a single booking flow with ~6 fields, Zustand is the right fit. Redux would be overkill. Context would cause unnecessary re-renders across the entire navigation tree.
