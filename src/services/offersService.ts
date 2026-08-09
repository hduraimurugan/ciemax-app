import { Env } from '@constants/env';
import { httpClient, errorMessage } from './httpClient';
import { mapOffer } from './mappers';
import { cachedFetch, getCached, CacheTTL } from './queryCache';
import * as mock from './offersService.mock';
import type { Offer } from '@ctypes/models';
import type { GetOffersResponse, ValidateOfferResponse } from '@ctypes/api';

const BASE = '/api/offers';

export interface CouponValidation {
  valid: boolean;
  offerId?: string;
  offerCode?: string;
  offerTitle?: string;
  discountAmount?: number;
  message?: string;
}

const OFFERS_KEY = 'offers:active';

export async function getOffers(): Promise<Offer[]> {
  if (Env.USE_MOCKS) return mock.getOffers();
  const { cached, promise } = cachedFetch(
    OFFERS_KEY,
    async () => {
      const res = await httpClient.get<GetOffersResponse>(`${BASE}/active`);
      return res.offers.filter(o => o.is_active).map(mapOffer);
    },
    CacheTTL.offers,
  );
  if (cached) {
    promise.catch(() => {});
    return cached;
  }
  return promise;
}

/** Synchronous cache peek — lets OffersScreen seed its initial state without waiting. */
export function getCachedOffers(): Offer[] | undefined {
  return getCached<Offer[]>(OFFERS_KEY, CacheTTL.offers);
}

/**
 * Real signature differs from the old mock (`code, orderAmount`) — the
 * server needs the show to price the offer correctly and returns the
 * discount amount itself rather than a client-matched Offer object.
 */
export async function validateCoupon(
  code: string,
  showId: string,
  totalAmount: number,
): Promise<CouponValidation> {
  try {
    const res = await httpClient.post<ValidateOfferResponse>(`${BASE}/validate`, {
      offer_code: code.trim().toUpperCase(),
      show_id: showId,
      total_amount: totalAmount,
    });
    return {
      valid: true,
      offerId: res.offer_id,
      offerCode: res.offer_code,
      offerTitle: res.offer_title,
      discountAmount: res.discount_amount,
    };
  } catch (err) {
    return { valid: false, message: errorMessage(err, 'Invalid or expired coupon code') };
  }
}
