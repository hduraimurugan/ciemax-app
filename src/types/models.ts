// ─── Movie ──────────────────────────────────────────────────────────────────

export interface CastMember {
  name: string;
  initials: string;
  /** Real API data — when present, the UI shows a photo instead of initials. */
  character?: string;
  profilePath?: string | null;
}

export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  backdropUrl: string;
  genre: string[];
  rating: number; // 0–10
  duration: number; // minutes
  language: string;
  releaseDate: string; // ISO date string
  synopsis: string;
  cast: CastMember[];
  director: string;
  format: ShowFormat[];
  isNowShowing: boolean;
  isComingSoon: boolean;
  trailerUrl?: string | null;
}

// ─── Theatre ─────────────────────────────────────────────────────────────────

export interface Theatre {
  id: string;
  name: string;
  address: string;
  city: string;
  distance?: string; // e.g. "2.4 km"
  // The API has no amenities/rating data — these stay optional and are only
  // populated by the mock service.
  amenities?: TheatreAmenity[];
  rating?: number;
  latitude?: number | null;
  longitude?: number | null;
}

export type TheatreAmenity = 'Parking' | 'Food Court' | 'Wheelchair' | 'Dolby' | 'IMAX' | '4DX';

// ─── Show ────────────────────────────────────────────────────────────────────

export type ShowFormat = '2D' | '3D' | 'IMAX' | '4DX';

export interface Show {
  id: string;
  movieId: string;
  theatreId: string;
  date: string; // ISO date string  e.g. "2026-03-21"
  time: string; // "10:30 AM"
  format: ShowFormat;
  language: string;
  // The API's showtime list doesn't report seat counts up front (that
  // requires fetching the seat map) — these are mock-only conveniences.
  availableSeats?: number;
  totalSeats?: number;
  priceMultiplier?: number; // 1.0 for 2D, 1.5 for IMAX, etc.
  screenName?: string;
  rawStartTime?: string; // API's "HH:MM:SS", kept for holds/payment calls
}

// ─── Seat ────────────────────────────────────────────────────────────────────

// 'held' and 'blocked' map from the API's 'HELD' and 'blocked'/passage seats;
// 'selected' is local-only UI state applied on top of 'available'.
export type SeatStatus = 'available' | 'selected' | 'booked' | 'held' | 'blocked';
export type SeatSection = 'premium' | 'gold' | 'silver' | 'passage';

export interface Seat {
  id: string;
  row: string; // "A", "B", "C", ...
  number: number;
  section: SeatSection;
  status: SeatStatus;
  price: number;
  /** Server's row+column label, e.g. "A1" — what /hold and /create-order key on. */
  label?: string;
  isBlocked?: boolean;
}

export interface SeatRow {
  row: string;
  section: SeatSection;
  seats: Seat[];
}

export interface SeatLayout {
  showId: string;
  sections: {
    premium: SeatRow[];
    gold: SeatRow[];
    silver: SeatRow[];
  };
  // Real-layout extras from the API (absent on the mock layout, which has
  // no aisles/passages) — the seat map and the adjacent-seat algorithm work
  // off `allSeats`, not the per-section `sections` breakdown above (which
  // exists for the section-header pricing UI).
  screenPosition?: 'top' | 'bottom';
  aisleAfterColumns?: number[];
  aisleAfterRows?: string[];
  allSeats?: Seat[];
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export type BookingStatus = 'confirmed' | 'cancelled' | 'pending';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

export type RefundStatus = 'initiated' | 'settled' | 'failed';

export interface Booking {
  id: string;
  movieId: string;
  movieTitle: string;
  theatreId: string;
  theatreName: string;
  showId: string;
  showTime: string;
  showDate: string;
  showFormat: ShowFormat;
  seats: Seat[];
  seatLabels?: string[];
  theatreLatitude?: number | null;
  theatreLongitude?: number | null;
  subtotal: number;
  convenienceFee: number;
  gstAmount?: number;
  offerCode?: string | null;
  discountAmount?: number;
  totalAmount: number;
  bookingDate: string;
  status: BookingStatus;
  paymentMethod?: PaymentMethod;
  paymentId?: string | null;
  posterUrl?: string;
  // Refunds are admin-initiated — there is no customer cancellation
  // endpoint, so these are display-only.
  refundStatus?: RefundStatus | null;
  refundAmount?: number | null;
  razorpayRefundId?: string | null;
  refundInitiatedAt?: string | null;
  refundSettledAt?: string | null;
  refundFailureReason?: string | null;
}

// ─── Offer ───────────────────────────────────────────────────────────────────

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  validUntil: string;
  isActive: boolean;
  imageUrl?: string;
  isRedeemed?: boolean;
  hallScoped?: boolean;
  hallName?: string | null;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  district?: string;
  state?: string;
  isVerified?: boolean;
  authProviders?: Array<'local' | 'google'>;
  hasPassword?: boolean;
  createdAt?: string;
}
