import { Env } from '@constants/env';
import { Seat, SeatLayout } from '@ctypes/models';
import { getSeatLayoutForShow } from './showsService';
import * as mock from './seatsService.mock';

/**
 * Kept as the stable import path (`@services/seatsService`) consumed by
 * `useSeatLayout` — the real implementation lives in `showsService.ts`
 * (named for what it actually calls, `GET /api/shows/get/:id`), this file
 * just adds the mock/real switch.
 */
export async function getSeatLayout(showId: string): Promise<SeatLayout> {
  if (Env.USE_MOCKS) return mock.getSeatLayout(showId);
  return getSeatLayoutForShow(showId);
}

export async function getSeatById(showId: string, seatId: string): Promise<Seat | undefined> {
  if (Env.USE_MOCKS) return mock.getSeatById(showId, seatId);
  const layout = await getSeatLayoutForShow(showId);
  return layout.allSeats?.find(s => s.id === seatId);
}
