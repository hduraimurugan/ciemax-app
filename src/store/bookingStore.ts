import { create } from 'zustand';
import { Movie, Seat, Show, Theatre } from '@ctypes/models';

/**
 * Holds the in-progress browse -> seat-selection flow. Once seats are held
 * (SeatSelectionScreen -> POST /api/booking/hold), Checkout/Payment/Failure
 * stop reading from here and become route-param-driven instead (see
 * CheckoutParams in @ctypes/navigation) — that's what survives a
 * backgrounded app without losing the live server-side hold. Pricing
 * (convenience fee / GST / offer discount) is no longer computed here: it's
 * server-computed and only mirrored client-side in CheckoutScreen using
 * GET /api/settings, since the old flat "₹30/seat + 18% on everything"
 * formula didn't match the API.
 */
interface BookingState {
  selectedMovie: Movie | null;
  selectedTheatre: Theatre | null;
  selectedShow: Show | null;
  selectedSeats: Seat[];
  // How many seats the user asked for (SeatCountModal) — drives the
  // auto-adjacent selection algorithm in seatSelection.ts.
  seatCount: number;

  setSelectedMovie: (movie: Movie) => void;
  setSelectedTheatre: (theatre: Theatre) => void;
  setSelectedShow: (show: Show) => void;
  setSeatCount: (count: number) => void;
  /** Replaces the whole selection — used after findBestAdjacentSeats picks a block. */
  setSelectedSeats: (seats: Seat[]) => void;
  clearSeatSelection: () => void;
  resetBookingFlow: () => void;

  getTotalAmount: () => number;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedMovie: null,
  selectedTheatre: null,
  selectedShow: null,
  selectedSeats: [],
  seatCount: 0,

  setSelectedMovie: movie => set({ selectedMovie: movie }),

  setSelectedTheatre: theatre => set({ selectedTheatre: theatre }),

  setSelectedShow: show =>
    set({ selectedShow: show, selectedSeats: [], seatCount: 0 }), // clear seats on new show

  setSeatCount: count => set({ seatCount: count, selectedSeats: [] }),

  setSelectedSeats: seats => set({ selectedSeats: seats.map(s => ({ ...s, status: 'selected' })) }),

  clearSeatSelection: () => set({ selectedSeats: [] }),

  resetBookingFlow: () =>
    set({
      selectedMovie: null,
      selectedTheatre: null,
      selectedShow: null,
      selectedSeats: [],
      seatCount: 0,
    }),

  getTotalAmount: () => get().selectedSeats.reduce((sum, s) => sum + s.price, 0),
}));
