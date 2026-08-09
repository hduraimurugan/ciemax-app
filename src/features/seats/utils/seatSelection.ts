import { Seat } from '@ctypes/models';

/**
 * Find the optimal contiguous block of seats around a tapped seat.
 * Ported from cinema-hall-users' src/utils/seatSelection.js — same
 * BookMyShow-style behavior: tapping a seat auto-selects `seatCount`
 * adjacent seats in that row, preferring blocks that contain the tapped
 * seat and extend to the right.
 *
 * Algorithm:
 * 1. Filter all available seats in the same row as the tapped seat.
 * 2. Sort them by column number.
 * 3. Slide a window of size `seatCount` across the sorted array.
 * 4. For each window, verify the seats are column-contiguous (no gaps).
 * 5. Score each valid block by distance from the tapped seat, preferring
 *    blocks that include the tapped column first, then right-biased blocks.
 * 6. Return the seats of the best block, or an empty array if none found.
 */
export function findBestAdjacentSeats(tappedSeat: Seat, seatCount: number, allSeats: Seat[]): Seat[] {
  if (!tappedSeat.label || seatCount < 1 || allSeats.length === 0) return [];

  const row = tappedSeat.label.charAt(0);
  const tappedCol = parseInt(tappedSeat.label.slice(1), 10);
  if (Number.isNaN(tappedCol)) return [];

  const isBlocked = (s: Seat) =>
    s.section === 'passage' || s.isBlocked || s.status === 'blocked' || s.status === 'booked' || s.status === 'held';

  const rowSeats = allSeats
    .filter(s => s.label?.charAt(0) === row && !isBlocked(s))
    .sort((a, b) => parseInt(a.label!.slice(1), 10) - parseInt(b.label!.slice(1), 10));

  const availableCols = rowSeats.map(s => parseInt(s.label!.slice(1), 10));
  if (!availableCols.includes(tappedCol)) return [];

  let bestBlock: Seat[] = [];
  let bestScore = Infinity;

  for (let i = 0; i <= rowSeats.length - seatCount; i++) {
    const candidate = rowSeats.slice(i, i + seatCount);
    const cols = candidate.map(s => parseInt(s.label!.slice(1), 10));

    const isContiguous = cols.every((c, idx) => idx === 0 || c === cols[idx - 1] + 1);
    if (!isContiguous) continue;

    const containsTapped = cols.includes(tappedCol);
    const minDist = Math.min(...cols.map(c => Math.abs(c - tappedCol)));
    const leftExtension = tappedCol - Math.min(...cols);

    const score = containsTapped ? 0 + leftExtension * 0.1 : 1 + minDist + leftExtension * 0.01;

    if (score < bestScore) {
      bestScore = score;
      bestBlock = candidate;
    }
  }

  return bestBlock;
}
