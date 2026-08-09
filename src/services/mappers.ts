import { resolveImageUrl } from './httpClient';
import { formatShowTime } from '@shared/utils/formatters';
import type {
  ApiCustomer,
  ApiMovie,
  ApiShowtimeHall,
  ApiTheatreHall,
  ApiShowSummary,
  ApiSeat,
  ApiShowDetail,
  ApiPricing,
  ApiBooking,
  ApiOffer,
} from '@ctypes/api';
import type {
  User,
  Movie,
  Theatre,
  Show,
  Seat,
  SeatRow,
  SeatLayout,
  SeatSection,
  SeatStatus,
  Booking,
  Offer,
  CastMember,
} from '@ctypes/models';

/** Deterministic initials fallback for when a cast photo isn't available. */
function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

// ─── Auth ────────────────────────────────────────────────────────────────

export function mapCustomer(c: ApiCustomer): User {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone ?? undefined,
    avatarUrl: c.avatar ?? undefined,
    district: c.district,
    state: c.state,
    isVerified: c.is_verified,
    authProviders: c.auth_providers,
    hasPassword: c.has_password,
    createdAt: c.created_at,
  };
}

// ─── Movies ──────────────────────────────────────────────────────────────

export function mapCastMember(c: { name: string; character?: string; profile_path?: string | null }): CastMember {
  return {
    name: c.name,
    initials: initialsFor(c.name),
    character: c.character,
    profilePath: resolveImageUrl(c.profile_path) ?? null,
  };
}

export function mapMovie(m: ApiMovie): Movie {
  return {
    id: m.id,
    title: m.title,
    posterUrl: resolveImageUrl(m.poster_url) ?? m.poster_url,
    backdropUrl: resolveImageUrl(m.backdrop_path) ?? resolveImageUrl(m.poster_url) ?? m.poster_url,
    genre: m.genre ?? [],
    // PostgreSQL numeric values may arrive as strings (e.g. "7.80").
    rating: Number(m.vote_average ?? m.rating ?? 0) || 0,
    duration: m.duration_mins ?? 0,
    language: m.language?.[0] ?? 'English',
    releaseDate: m.release_date,
    synopsis: m.description ?? '',
    cast: (m.cast ?? []).map(mapCastMember),
    director: m.director ?? '',
    // The API doesn't carry format (2D/3D/IMAX) at the movie level — it
    // lives per-screen. Default to 2D; ShowtimesScreen shows the real
    // format per showtime from the show/screen data instead.
    format: ['2D'],
    isNowShowing: m.status === 'now_showing',
    isComingSoon: m.status === 'upcoming',
    trailerUrl: m.trailer_url,
  };
}

// ─── Theatres / showtimes ──────────────────────────────────────────────────

/** `/api/user/movies/:movieId/showtimes` — cinema_hall_id/_name/_location naming. */
export function mapShowtimeHall(h: ApiShowtimeHall): Theatre {
  return {
    id: h.cinema_hall_id,
    name: h.cinema_hall_name,
    address: h.cinema_hall_location,
    city: h.district,
    latitude: h.latitude,
    longitude: h.longitude,
  };
}

/** `/api/user/movies/location/theatres` — hall_id/hall_name/location naming. */
export function mapTheatreHall(h: ApiTheatreHall): Theatre {
  return {
    id: h.hall_id,
    name: h.hall_name,
    address: h.location,
    city: h.district,
    latitude: h.latitude,
    longitude: h.longitude,
  };
}

/** Minimal Movie stub built from the /location/theatres listing (hall -> movies -> shows), which
 * carries only a summary of each movie — enough for display, not the full detail page. */
export function mapTheatreListingMovie(m: {
  movie_id: string;
  title: string;
  poster_url: string;
  backdrop_path?: string | null;
  duration_mins: number;
  genre: string[];
  language: string[];
}): Movie {
  return {
    id: m.movie_id,
    title: m.title,
    posterUrl: resolveImageUrl(m.poster_url) ?? m.poster_url,
    backdropUrl: resolveImageUrl(m.backdrop_path) ?? resolveImageUrl(m.poster_url) ?? m.poster_url,
    genre: m.genre ?? [],
    rating: 0,
    duration: m.duration_mins ?? 0,
    language: m.language?.[0] ?? 'English',
    releaseDate: '',
    synopsis: '',
    cast: [],
    director: '',
    format: ['2D'],
    isNowShowing: true,
    isComingSoon: false,
  };
}

export function mapShowSummary(s: ApiShowSummary, movieId: string, theatreId: string): Show {
  return {
    id: s.show_id,
    movieId,
    theatreId,
    date: s.show_date,
    time: formatShowTime(s.start_time),
    format: '2D',
    language: s.language_version,
    screenName: s.screen_name,
    rawStartTime: s.start_time,
  };
}

// ─── Seat map ────────────────────────────────────────────────────────────

const SEAT_SECTION_ORDER: Array<Exclude<SeatSection, 'passage'>> = ['premium', 'gold', 'silver'];

function priceFor(type: ApiSeat['type'], pricing: ApiPricing, override?: ApiPricing | null): number {
  if (type === 'passage') return 0;
  // price_override wins over the screen's base pricing, matching the web
  // app's getSeatPrice() exactly.
  const overridden = override?.[type];
  if (overridden) return Number(overridden) || 0;
  const base = pricing[type];
  return base ? Number(base) || 0 : 0;
}

function mapSeatStatus(status: ApiSeat['status']): SeatStatus {
  switch (status) {
    case 'HELD':
      return 'held';
    case 'BOOKED':
      return 'booked';
    case 'blocked':
      return 'blocked';
    default:
      return 'available';
  }
}

export function mapApiSeat(s: ApiSeat, pricing: ApiPricing, override?: ApiPricing | null): Seat {
  return {
    id: s.id,
    row: s.row,
    number: s.column,
    section: s.type,
    status: mapSeatStatus(s.status),
    price: priceFor(s.type, pricing, override),
    label: s.seat_label ?? undefined,
    isBlocked: s.isBlocked,
  };
}

export function mapSeatLayout(detail: ApiShowDetail): SeatLayout {
  const pricing = detail.screen.layout.pricing ?? {};
  const override = detail.show_details.price_override;
  const allSeats = detail.screen.layout.seats.map(s => mapApiSeat(s, pricing, override));

  const sections: SeatLayout['sections'] = { premium: [], gold: [], silver: [] };

  for (const sectionKey of SEAT_SECTION_ORDER) {
    // Group same-type seats by row, preserving row order (A, B, C, ...).
    const seatsOfType = allSeats.filter(s => s.section === sectionKey);
    const rowMap = new Map<string, Seat[]>();
    for (const seat of seatsOfType) {
      const list = rowMap.get(seat.row) ?? [];
      list.push(seat);
      rowMap.set(seat.row, list);
    }
    const rows: SeatRow[] = Array.from(rowMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([row, seats]) => ({
        row,
        section: sectionKey,
        seats: seats.sort((a, b) => a.number - b.number),
      }));
    sections[sectionKey] = rows;
  }

  return {
    showId: detail.show_id,
    sections,
    screenPosition: detail.screen.layout.screenPosition,
    aisleAfterColumns: detail.screen.layout.aisleAfterColumns,
    aisleAfterRows: detail.screen.layout.aisleAfterRows,
    allSeats,
  };
}

// ─── Bookings ────────────────────────────────────────────────────────────

export function mapBooking(b: ApiBooking): Booking {
  const status: Booking['status'] = b.booking_status === 'cancelled' ? 'cancelled' : 'confirmed';
  return {
    id: b.id,
    movieId: '',
    movieTitle: b.movie_title,
    theatreId: '',
    theatreName: b.cinema_hall_name,
    showId: b.show_id,
    showTime: formatShowTime(b.start_time),
    showDate: b.show_date,
    showFormat: '2D',
    seats: b.seat_labels.map((label, i) => ({
      id: b.seats[i] ?? label,
      row: label.charAt(0),
      number: Number(label.slice(1)) || 0,
      section: 'premium',
      status: 'booked',
      price: 0,
      label,
    })),
    seatLabels: b.seat_labels,
    theatreLatitude: b.cinema_hall_latitude ?? null,
    theatreLongitude: b.cinema_hall_longitude ?? null,
    subtotal: b.total_amount + b.discount_amount - b.convenience_fee - b.gst_amount,
    convenienceFee: b.convenience_fee,
    gstAmount: b.gst_amount,
    offerCode: b.offer_code,
    discountAmount: b.discount_amount,
    totalAmount: b.total_amount,
    bookingDate: b.created_at,
    status,
    paymentId: b.payment_id,
    posterUrl: resolveImageUrl(b.poster_url),
    refundStatus: b.refund_status ?? null,
    refundAmount: b.refund_amount ?? null,
    razorpayRefundId: b.razorpay_refund_id ?? null,
    refundInitiatedAt: b.refund_initiated_at ?? null,
    refundSettledAt: b.refund_settled_at ?? null,
    refundFailureReason: b.refund_failure_reason ?? null,
  };
}

// ─── Offers ──────────────────────────────────────────────────────────────

export function mapOffer(o: ApiOffer): Offer {
  return {
    id: o.id,
    code: o.code,
    title: o.title,
    description: o.description,
    discountType: o.discount_type === 'fixed' ? 'flat' : 'percentage',
    discountValue: o.discount_value,
    minOrderAmount: o.min_booking_amount,
    maxDiscount: o.max_discount_amount ?? Number.MAX_SAFE_INTEGER,
    validUntil: o.valid_until,
    isActive: o.is_active,
    isRedeemed: o.is_redeemed,
    hallScoped: o.scope === 'hall',
    hallName: o.cinema_hall_name,
  };
}
