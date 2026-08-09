import { httpClient } from './httpClient';
import { mapSeatLayout } from './mappers';
import type { ApiShowDetail } from '@ctypes/api';
import type { SeatLayout } from '@ctypes/models';

/** The seat-map endpoint — authoritative layout + live seat status for a show. */
export async function getShowDetail(showId: string): Promise<ApiShowDetail> {
  return httpClient.get<ApiShowDetail>(`/api/shows/get/${showId}`, { skipAuth: true });
}

export async function getSeatLayoutForShow(showId: string): Promise<SeatLayout> {
  const detail = await getShowDetail(showId);
  return mapSeatLayout(detail);
}
