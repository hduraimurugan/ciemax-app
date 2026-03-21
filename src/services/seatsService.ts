import { Seat, SeatLayout, SeatRow, SeatSection, SeatStatus } from '@ctypes/models';
import { SeatPricing } from '@constants/config';
import { MockDelay } from '@constants/config';

/**
 * Generates a realistic cinema seat layout for a given show.
 * Layout:
 *   Premium (rows A–C): 12 seats per row
 *   Gold    (rows D–G): 14 seats per row
 *   Silver  (rows H–L): 16 seats per row
 *
 * ~30% of seats are randomly pre-booked to simulate real occupancy.
 */
function generateSeatLayout(showId: string): SeatLayout {
  // Use showId as seed for deterministic "random" booking
  const seed = showId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const pseudo = (n: number) => ((seed * 9301 + 49297) % 233280) / 233280 * n;

  const makeRow = (
    rowLabel: string,
    section: SeatSection,
    count: number,
    basePrice: number,
    rowIndex: number,
  ): SeatRow => ({
    row: rowLabel,
    section,
    seats: Array.from({ length: count }, (_, i) => {
      const seatNum = i + 1;
      const hash = (seed + rowIndex * 13 + seatNum * 7) % 100;
      const status: SeatStatus = hash < 28 ? 'booked' : 'available';
      return {
        id: `${showId}-${rowLabel}${seatNum}`,
        row: rowLabel,
        number: seatNum,
        section,
        status,
        price: basePrice,
      };
    }),
  });

  const premiumRows: SeatRow[] = ['A', 'B', 'C'].map((r, i) =>
    makeRow(r, 'premium', 12, SeatPricing.premium, i),
  );
  const goldRows: SeatRow[] = ['D', 'E', 'F', 'G'].map((r, i) =>
    makeRow(r, 'gold', 14, SeatPricing.gold, i + 3),
  );
  const silverRows: SeatRow[] = ['H', 'I', 'J', 'K', 'L'].map((r, i) =>
    makeRow(r, 'silver', 16, SeatPricing.silver, i + 7),
  );

  // suppress unused variable warning
  void pseudo(0);

  return {
    showId,
    sections: {
      premium: premiumRows,
      gold: goldRows,
      silver: silverRows,
    },
  };
}

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export async function getSeatLayout(showId: string): Promise<SeatLayout> {
  await delay(MockDelay);
  return generateSeatLayout(showId);
}

export async function getSeatById(showId: string, seatId: string): Promise<Seat | undefined> {
  const layout = generateSeatLayout(showId);
  const allRows = [
    ...layout.sections.premium,
    ...layout.sections.gold,
    ...layout.sections.silver,
  ];
  for (const row of allRows) {
    const seat = row.seats.find(s => s.id === seatId);
    if (seat) return seat;
  }
  return undefined;
}
