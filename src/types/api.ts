/**
 * Exact server response/request shapes from cinema-hall-api, kept 1:1 with
 * the backend's snake_case JSON so the mapping in `src/services/mappers.ts`
 * has a single, honest place to translate into the app's camelCase models
 * (`@ctypes/models`). Do not "clean up" these field names to match the app
 * models — that's what the mappers are for.
 */

// ─── Errors ────────────────────────────────────────────────────────────────

/**
 * The API responds with four different error envelopes depending on the
 * endpoint ({error}, {message}, {success:false,message}, {success:false,error})
 * plus coded variants. httpClient normalizes all of them into this shape.
 */
export interface ApiError {
  status: number;
  message: string;
  code?:
    | 'ACCOUNT_LOCKED'
    | 'EMAIL_NOT_VERIFIED'
    | 'OTP_EXPIRED'
    | 'OTP_ATTEMPTS_EXCEEDED'
    | 'TOKEN_STALE'
    | string;
  lockedUntil?: string;
  hint?: string;
  /** Present on 409 seat-hold conflicts. */
  results?: ApiHoldResult[];
  raw?: unknown;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface ApiCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  district?: string;
  state?: string;
  is_verified: boolean;
  auth_providers?: Array<'local' | 'google'>;
  avatar?: string | null;
  has_password?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  message: string;
  customer: ApiCustomer;
  accessToken: string;
  refreshToken: string;
}

export interface SignupResponse {
  message: string;
  customer: ApiCustomer;
}

export interface MeResponse {
  customer: ApiCustomer;
}

export interface RefreshResponse {
  success: true;
  accessToken: string;
}

// ─── Movies ────────────────────────────────────────────────────────────────

export interface ApiCastMember {
  name: string;
  character?: string;
  profile_path?: string | null;
}

export interface ApiMovie {
  id: string;
  title: string;
  description: string;
  poster_url: string;
  backdrop_path?: string | null;
  trailer_url?: string | null;
  duration_mins: number;
  genre: string[];
  language: string[];
  status: 'now_showing' | 'upcoming';
  release_date: string;
  rating?: number | string;
  vote_average?: number | string;
  vote_count?: number;
  cast?: ApiCastMember[];
  director?: string;
  tmdb_id?: string;
  created_at?: string;
}

export interface GetAllMoviesResponse {
  success: true;
  movies: ApiMovie[];
  page: number;
  limit: number;
  count: number;
}

export interface GetMovieByIdResponse {
  success: true;
  movie: ApiMovie;
}

export interface GetMoviesByLocationResponse {
  success: true;
  count: number;
  district: string;
  state: string;
  movies: ApiMovie[];
}

// ─── Cinema halls / theatres / showtimes ────────────────────────────────────

/** `GET /:movieId/showtimes` field names. */
export interface ApiShowtimeHall {
  cinema_hall_id: string;
  cinema_hall_name: string;
  cinema_hall_location: string;
  district: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  shows: ApiShowSummary[];
}

export interface ApiShowSummary {
  show_id: string;
  screen_id: string;
  screen_name: string;
  show_date: string;
  start_time: string; // "HH:MM:SS"
  end_time: string;
  language_version: string;
  show_status?: string;
  pricing?: ApiPricing;
}

export interface GetMovieShowtimesResponse {
  success: true;
  movie: ApiMovie;
  cinema_halls: ApiShowtimeHall[];
}

/** `GET /location/theatres` field names — deliberately different from the above. */
export interface ApiTheatreHall {
  hall_id: string;
  hall_name: string;
  location: string;
  district: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  movies: Array<{
    movie_id: string;
    title: string;
    poster_url: string;
    backdrop_path?: string | null;
    duration_mins: number;
    genre: string[];
    language: string[];
    shows: ApiShowSummary[];
  }>;
}

export interface GetTheatresWithShowsResponse {
  success: true;
  count: number;
  district: string;
  state: string;
  date?: string;
  cinema_halls: ApiTheatreHall[];
}

export interface GetDistrictsResponse {
  success: true;
  state: string;
  districts: string[];
}

// ─── Seat map (GET /api/shows/get/:showId) ──────────────────────────────────

export type ApiSeatType = 'premium' | 'gold' | 'silver' | 'passage';
export type ApiSeatStatus = 'available' | 'HELD' | 'BOOKED' | 'blocked';

export interface ApiPricing {
  premium?: number;
  gold?: number;
  silver?: number;
}

export interface ApiSeat {
  id: string;
  row: string;
  column: number;
  type: ApiSeatType;
  isBlocked: boolean;
  seat_label: string | null;
  status: ApiSeatStatus;
}

export interface ApiScreenLayout {
  pricing: ApiPricing;
  screenPosition: 'top' | 'bottom';
  aisleAfterColumns: number[];
  aisleAfterRows: string[];
  seats: ApiSeat[];
}

export interface ApiShowDetail {
  show_id: string;
  movie: {
    id: string;
    title: string;
    poster_url: string;
    duration: number;
    genre: string[];
    language: string[];
  };
  screen: {
    id: string;
    name: string;
    position?: string;
    rows: number;
    columns: number;
    layout: ApiScreenLayout;
  };
  show_details: {
    show_date: string;
    start_time: string;
    end_time: string;
    status: string;
    language_version: string;
    price_override?: ApiPricing | null;
  };
}

// ─── Booking / hold ──────────────────────────────────────────────────────────

export interface ApiHoldResult {
  seat_id: string;
  status: 'held' | 'unavailable';
  expires_at?: string;
  held_by?: string;
}

export interface HoldSeatsResponse {
  success: true;
  message: string;
  hold_expires_at: string;
  results: ApiHoldResult[];
}

export interface ReleaseSeatsResponse {
  success: true;
  released: string[];
}

export interface ApiBooking {
  id: string;
  show_id: string;
  customer_id: string;
  seats: string[];
  seat_labels: string[];
  total_amount: number;
  convenience_fee: number;
  gst_amount: number;
  offer_code: string | null;
  offer_title?: string | null;
  discount_amount: number;
  booking_status: 'confirmed' | 'cancelled' | 'completed';
  payment_status: string;
  payment_id: string | null;
  created_at: string;
  // Denormalized display fields the API joins in for booking list/detail:
  movie_title: string;
  poster_url?: string;
  duration_mins?: number;
  genre?: string[];
  language?: string;
  show_date: string;
  start_time: string;
  screen_name: string;
  cinema_hall_name: string;
  cinema_hall_location: string;
  cinema_hall_latitude?: number | null;
  cinema_hall_longitude?: number | null;
  // Refunds — admin-initiated only, no customer cancellation endpoint exists.
  refund_status?: 'initiated' | 'settled' | 'failed' | null;
  refund_amount?: number | null;
  razorpay_refund_id?: string | null;
  refund_initiated_at?: string | null;
  refund_settled_at?: string | null;
  refund_failure_reason?: string | null;
}

export interface GetMyBookingsResponse {
  bookings: ApiBooking[];
}

export interface GetBookingResponse {
  booking: ApiBooking;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export interface CreateOrderResponse {
  order_id: string;
  amount: number; // paise
  currency: string;
  key_id: string;
  _idempotent?: boolean;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: true;
  message: string;
  booking: ApiBooking;
  _idempotent?: boolean;
}

// ─── Offers ──────────────────────────────────────────────────────────────────

export interface ApiOffer {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  max_discount_amount?: number | null;
  min_booking_amount: number;
  valid_from?: string;
  valid_until: string;
  scope: 'global' | 'hall';
  cinema_hall_id?: string | null;
  cinema_hall_name?: string | null;
  user_eligibility: 'all' | 'joined_after';
  user_joined_after?: string | null;
  is_active: boolean;
  is_redeemed?: boolean;
}

export interface GetOffersResponse {
  offers: ApiOffer[];
}

export interface ValidateOfferResponse {
  offer_id: string;
  offer_code: string;
  offer_title: string;
  discount_amount: number;
  final_amount: number;
}

// ─── Settings / ads ────────────────────────────────────────────────────────

export interface ApiSettings {
  convenience_fee_per_ticket: number;
  gst_percentage: number;
}

export interface ApiAd {
  id: string;
  title: string;
  image_url: string;
  click_url?: string | null;
  placement: 'banner' | 'side';
}

export interface GetAdsResponse {
  ads: ApiAd[];
}
