import { create } from 'zustand';
import { Booking, Movie, Offer, Seat, Show, Theatre } from '@ctypes/models';

interface BookingState {
  // Flow state
  selectedMovie: Movie | null;
  selectedTheatre: Theatre | null;
  selectedShow: Show | null;
  selectedSeats: Seat[];
  appliedCoupon: string | null;
  appliedOffer: Offer | null;
  bookingDetails: Booking | null;

  // Actions
  setSelectedMovie: (movie: Movie) => void;
  setSelectedTheatre: (theatre: Theatre) => void;
  setSelectedShow: (show: Show) => void;
  toggleSeat: (seat: Seat) => void;
  clearSeatSelection: () => void;
  setAppliedCoupon: (code: string | null) => void;
  setAppliedOffer: (offer: Offer | null) => void;
  setBookingDetails: (booking: Booking) => void;
  resetBookingFlow: () => void;

  // Computed (via selector pattern)
  getTotalAmount: () => number;
  getConvenienceFee: () => number;
  getGST: () => number;
  getAppliedDiscount: () => number;
  getGrandTotal: () => number;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedMovie: null,
  selectedTheatre: null,
  selectedShow: null,
  selectedSeats: [],
  appliedCoupon: null,
  appliedOffer: null,
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

  setAppliedOffer: offer => set({ appliedOffer: offer, appliedCoupon: offer?.code ?? null }),

  setBookingDetails: booking => set({ bookingDetails: booking }),

  resetBookingFlow: () =>
    set({
      selectedMovie: null,
      selectedTheatre: null,
      selectedShow: null,
      selectedSeats: [],
      appliedCoupon: null,
      appliedOffer: null,
      bookingDetails: null,
    }),

  getTotalAmount: () =>
    get().selectedSeats.reduce((sum, s) => sum + s.price, 0),

  // ₹15 per seat (matches cinema-hall-users)
  getConvenienceFee: () => get().selectedSeats.length * 15,

  // 18% GST on convenience fee only
  getGST: () => Math.round(get().getConvenienceFee() * 0.18),

  getAppliedDiscount: () => {
    const { appliedOffer, getTotalAmount } = get();
    if (!appliedOffer) return 0;
    const subtotal = getTotalAmount();
    if (subtotal < appliedOffer.minOrderAmount) return 0;
    if (appliedOffer.discountType === 'flat') {
      return Math.min(appliedOffer.discountValue, appliedOffer.maxDiscount);
    }
    const pct = Math.round(subtotal * appliedOffer.discountValue / 100);
    return Math.min(pct, appliedOffer.maxDiscount);
  },

  getGrandTotal: () => {
    const { getTotalAmount, getConvenienceFee, getGST, getAppliedDiscount } = get();
    return getTotalAmount() + getConvenienceFee() + getGST() - getAppliedDiscount();
  },
}));
