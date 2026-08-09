import { Env } from '@constants/env';
import { httpClient } from './httpClient';
import { mapBooking } from './mappers';
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
  return httpClient.post<HoldSeatsResponse>(`${BASE}/hold`, { show_id: showId, seats: seatIds });
}

export async function releaseSeats(showId: string, seatIds: string[]): Promise<ReleaseSeatsResponse> {
  return httpClient.post<ReleaseSeatsResponse>(`${BASE}/release`, { show_id: showId, seats: seatIds });
}

export async function getUserBookings(): Promise<Booking[]> {
  if (Env.USE_MOCKS) return mock.getUserBookings();
  const res = await httpClient.get<GetMyBookingsResponse>(`${BASE}/my-bookings`);
  return res.bookings.map(mapBooking);
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  if (Env.USE_MOCKS) return mock.getBookingById(id);
  const res = await httpClient.get<GetBookingResponse>(`${BASE}/${id}`);
  return mapBooking(res.booking);
}

export async function getBookingByPaymentId(paymentId: string): Promise<Booking | undefined> {
  const res = await httpClient.get<GetBookingResponse>(`${BASE}/by-payment/${paymentId}`);
  return mapBooking(res.booking);
}
