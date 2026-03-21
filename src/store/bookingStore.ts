import { create } from 'zustand';
import { Booking, Movie, Seat, Show, Theatre } from '@ctypes/models';

interface BookingState {
  // Flow state
  selectedMovie: Movie | null;
  selectedTheatre: Theatre | null;
  selectedShow: Show | null;
  selectedSeats: Seat[];
  appliedCoupon: string | null;
  bookingDetails: Booking | null;

  // Actions
  setSelectedMovie: (movie: Movie) => void;
  setSelectedTheatre: (theatre: Theatre) => void;
  setSelectedShow: (show: Show) => void;
  toggleSeat: (seat: Seat) => void;
  clearSeatSelection: () => void;
  setAppliedCoupon: (code: string | null) => void;
  setBookingDetails: (booking: Booking) => void;
  resetBookingFlow: () => void;

  // Computed (via selector pattern)
  getTotalAmount: () => number;
  getConvenienceFee: () => number;
  getGrandTotal: () => number;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedMovie: null,
  selectedTheatre: null,
  selectedShow: null,
  selectedSeats: [],
  appliedCoupon: null,
  bookingDetails: null,

  setSelectedMovie: movie => set({ selectedMovie: movie }),

  setSelectedTheatre: theatre => set({ selectedTheatre: theatre }),

  setSelectedShow: show =>
    set({ selectedShow: show, selectedSeats: [] }), // clear seats on new show

  toggleSeat: seat =>
    set(state => {
      const alreadySelected = state.selectedSeats.some(s => s.id === seat.id);
      if (alreadySelected) {
        return { selectedSeats: state.selectedSeats.filter(s => s.id !== seat.id) };
      }
      if (state.selectedSeats.length >= 8) {
        return state; // max 8 seats per booking
      }
      return {
        selectedSeats: [...state.selectedSeats, { ...seat, status: 'selected' }],
      };
    }),

  clearSeatSelection: () => set({ selectedSeats: [] }),

  setAppliedCoupon: code => set({ appliedCoupon: code }),

  setBookingDetails: booking => set({ bookingDetails: booking }),

  resetBookingFlow: () =>
    set({
      selectedMovie: null,
      selectedTheatre: null,
      selectedShow: null,
      selectedSeats: [],
      appliedCoupon: null,
      bookingDetails: null,
    }),

  getTotalAmount: () =>
    get().selectedSeats.reduce((sum, s) => sum + s.price, 0),

  getConvenienceFee: () => {
    const total = get().getTotalAmount();
    return Math.round(total * 0.05); // 5% convenience fee
  },

  getGrandTotal: () => get().getTotalAmount() + get().getConvenienceFee(),
}));
