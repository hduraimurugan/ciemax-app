import { Env } from '@constants/env';
import { httpClient } from './httpClient';
import { mapBooking } from './mappers';
import { cachedFetch, dedupedFetch, getCached, CacheTTL, invalidate } from './queryCache';
import * as mock from './bookingService.mock';
import type { Booking } from '@ctypes/models';
import type {
  HoldSeatsResponse,
  ReleaseSeatsResponse,
  GetMyBookingsResponse,
  GetBookingResponse,
} from '@ctypes/api';

const BASE = '/api/booking';

/**
 * Places a 5-minute server-side hold on the given seats. All-or-nothing —
 * a 409 (thrown as ApiError with `.results`) means at least one seat was
 * taken; the caller should show the conflict and refetch the seat map.
 * Note: `createBooking`/`cancelBooking` from the old mock service are gone
 * on purpose — the real flow creates a booking via payment verification
 * (paymentService.verifyPayment), and there is no customer-facing
 * cancellation endpoint (refunds are admin-initiated).
 */
export async function holdSeats(showId: string, seatIds: string[]): Promise<HoldSeatsResponse> {
  const result = await httpClient.post<HoldSeatsResponse>(`${BASE}/hold`, { show_id: showId, seats: seatIds });
  invalidate(`seat-layout:${showId}`); // held seats must show as unavailable to other viewers immediately
  return result;
}

export async function releaseSeats(showId: string, seatIds: string[]): Promise<ReleaseSeatsResponse> {
  const result = await httpClient.post<ReleaseSeatsResponse>(`${BASE}/release`, { show_id: showId, seats: seatIds });
  invalidate(`seat-layout:${showId}`);
  return result;
}

const BOOKINGS_KEY = 'bookings:mine';

export async function getUserBookings(): Promise<Booking[]> {
  if (Env.USE_MOCKS) return mock.getUserBookings();
  const { cached, promise } = cachedFetch(
    BOOKINGS_KEY,
    async () => {
      const res = await httpClient.get<GetMyBookingsResponse>(`${BASE}/my-bookings`);
      return res.bookings.map(mapBooking);
    },
    CacheTTL.bookings,
  );
  if (cached) {
    promise.catch(() => {}); // background revalidate; caller already has cached data to show
    return cached;
  }
  return promise;
}

/** Synchronous cache peek — lets MyBookingsScreen seed its initial state without waiting. */
export function getCachedUserBookings(): Booking[] | undefined {
  return getCached<Booking[]>(BOOKINGS_KEY, CacheTTL.bookings);
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  if (Env.USE_MOCKS) return mock.getBookingById(id);
  const key = `booking:${id}`;
  const cached = getCached<Booking>(key, CacheTTL.bookings);
  if (cached) {
    dedupedFetch(key, () => fetchBookingById(id)).catch(() => {});
    return cached;
  }
  return dedupedFetch(key, () => fetchBookingById(id));
}

/** Synchronous cache peek — lets TicketDetailScreen seed its initial state without waiting. */
export function getCachedBooking(id: string): Booking | undefined {
  return getCached<Booking>(`booking:${id}`, CacheTTL.bookings);
}

async function fetchBookingById(id: string): Promise<Booking> {
  const res = await httpClient.get<GetBookingResponse>(`${BASE}/${id}`);
  return mapBooking(res.booking);
}

export async function getBookingByPaymentId(paymentId: string): Promise<Booking | undefined> {
  const res = await httpClient.get<GetBookingResponse>(`${BASE}/by-payment/${paymentId}`);
  return mapBooking(res.booking);
}
