import { httpClient } from './httpClient';
import type { CreateOrderResponse, VerifyPaymentRequest, VerifyPaymentResponse } from '@ctypes/api';

const BASE = '/api/payment';

/**
 * Server recomputes the amount from the show's pricing + any offer — the
 * client only ever displays a total, never sets one. Returns the Razorpay
 * order + `key_id` used to open the checkout WebView.
 */
export async function createOrder(
  showId: string,
  seatIds: string[],
  offerCode?: string | null,
): Promise<CreateOrderResponse> {
  return httpClient.post<CreateOrderResponse>(`${BASE}/create-order`, {
    show_id: showId,
    seats: seatIds,
    ...(offerCode ? { offer_code: offerCode } : {}),
  });
}

/** Idempotent — safe to call once per successful Razorpay checkout. */
export async function verifyPayment(payload: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
  return httpClient.post<VerifyPaymentResponse>(`${BASE}/verify`, payload);
}
