// ─── Movie ──────────────────────────────────────────────────────────────────

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
  cast: string[];
  director: string;
  format: ShowFormat[];
  isNowShowing: boolean;
  isComingSoon: boolean;
}

// ─── Theatre ─────────────────────────────────────────────────────────────────

export interface Theatre {
  id: string;
  name: string;
  address: string;
  city: string;
  distance?: string; // e.g. "2.4 km"
  amenities: TheatreAmenity[];
  rating: number;
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
  availableSeats: number;
  totalSeats: number;
  priceMultiplier: number; // 1.0 for 2D, 1.5 for IMAX, etc.
}

// ─── Seat ────────────────────────────────────────────────────────────────────

export type SeatStatus = 'available' | 'selected' | 'booked';
export type SeatSection = 'premium' | 'gold' | 'silver';

export interface Seat {
  id: string;
  row: string; // "A", "B", "C", ...
  number: number;
  section: SeatSection;
  status: SeatStatus;
  price: number;
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
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export type BookingStatus = 'confirmed' | 'cancelled' | 'pending';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

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
  subtotal: number;
  convenienceFee: number;
  totalAmount: number;
  bookingDate: string;
  status: BookingStatus;
  paymentMethod?: PaymentMethod;
  posterUrl?: string;
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
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}
