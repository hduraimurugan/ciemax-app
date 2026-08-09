import { Seat, SeatLayout, SeatRow, SeatSection, SeatStatus } from '@ctypes/models';
import { SeatPricing } from '@constants/config';
import { MockDelay } from '@constants/config';

/**
 * Cinema seat layout matching the CineHall design:
 *   Premium (rows A–C): 12 seats/row, gold-tinted, ₹350
 *   Standard (rows D–J): 12 seats/row, ₹220
 *   Silver: unused (kept empty for SeatSection type compatibility)
 *
 * BOOKED mirrors the design's static occupancy list — the same seats are
 * pre-booked for every show, matching the design's flat mock catalog.
 */
const BOOKED = [
  'A3', 'A4', 'B7', 'B8', 'C1',
  'D5', 'D6', 'D7', 'E10', 'E11', 'F2', 'G9',
  'H4', 'H5', 'I8', 'J1', 'J2', 'J12',
];

function generateSeatLayout(showId: string): SeatLayout {
  const makeRow = (rowLabel: string, section: SeatSection, basePrice: number): SeatRow => ({
    row: rowLabel,
    section,
    seats: Array.from({ length: 12 }, (_, i) => {
      const seatNum = i + 1;
      const code = `${rowLabel}${seatNum}`;
      const status: SeatStatus = BOOKED.includes(code) ? 'booked' : 'available';
      return {
        id: `${showId}-${code}`,
        row: rowLabel,
        number: seatNum,
        section,
        status,
        price: basePrice,
      };
    }),
  });

  const premiumRows: SeatRow[] = ['A', 'B', 'C'].map(r => makeRow(r, 'premium', SeatPricing.premium));
  const goldRows: SeatRow[] = ['D', 'E', 'F', 'G', 'H', 'I', 'J'].map(r => makeRow(r, 'gold', SeatPricing.gold));

  return {
    showId,
    sections: {
      premium: premiumRows,
      gold: goldRows,
      silver: [],
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
