import { httpClient } from './httpClient';
import type { ApiAd, GetAdsResponse } from '@ctypes/api';

export async function getActiveAds(placement: 'banner' | 'side'): Promise<ApiAd[]> {
  try {
    const res = await httpClient.get<GetAdsResponse>('/api/ads/active', {
      skipAuth: true,
      query: { placement },
    });
    return res.ads;
  } catch {
    return [];
  }
}

export async function recordAdClick(adId: string): Promise<void> {
  try {
    await httpClient.post(`/api/ads/click/${adId}`, undefined, { skipAuth: true });
  } catch {
    // Non-fatal — a failed click ping shouldn't block navigation.
  }
}
