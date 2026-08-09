import { findBestAdjacentSeats } from './seatSelection';
import { Seat } from '@ctypes/models';

/** Builds a single row "A1".."A12" with the given columns booked/held/blocked. */
function makeRow(row: string, count: number, overrides: Record<number, Partial<Seat>> = {}): Seat[] {
  return Array.from({ length: count }, (_, i) => {
    const col = i + 1;
    const base: Seat = {
      id: `${row}${col}`,
      row,
      number: col,
      section: 'gold',
      status: 'available',
      price: 200,
      label: `${row}${col}`,
    };
    return { ...base, ...overrides[col] };
  });
}

describe('findBestAdjacentSeats', () => {
  it('returns a contiguous block containing the tapped seat when fully open', () => {
    const row = makeRow('A', 12);
    const result = findBestAdjacentSeats(row[4], 3, row); // tap A5, want 3 seats
    const labels = result.map(s => s.label).sort();
    expect(result).toHaveLength(3);
    expect(labels).toContain('A5');
    // Contiguous columns.
    const cols = result.map(s => s.number).sort((a, b) => a - b);
    expect(cols[1]).toBe(cols[0] + 1);
    expect(cols[2]).toBe(cols[1] + 1);
  });

  it('is right-biased: prefers extending right over left when both are open', () => {
    const row = makeRow('A', 12);
    const result = findBestAdjacentSeats(row[4], 3, row); // tap A5
    const cols = result.map(s => s.number).sort((a, b) => a - b);
    // Web app's algorithm favors right extension — A5,A6,A7 over A3,A4,A5 or A4,A5,A6.
    expect(cols).toEqual([5, 6, 7]);
  });

  it('slides left when the tapped seat is near the right edge and right side is booked', () => {
    const row = makeRow('A', 12, { 10: { status: 'booked' }, 11: { status: 'booked' }, 12: { status: 'booked' } });
    const result = findBestAdjacentSeats(row[8], 3, row); // tap A9, seats 10-12 booked
    const cols = result.map(s => s.number).sort((a, b) => a - b);
    expect(cols).toContain(9);
    expect(cols.every(c => c <= 9)).toBe(true);
  });

  it('skips over booked/held seats — never returns a block spanning a gap', () => {
    const row = makeRow('A', 12, { 6: { status: 'booked' } });
    const result = findBestAdjacentSeats(row[3], 3, row); // tap A4, A6 is booked
    const cols = result.map(s => s.number).sort((a, b) => a - b);
    expect(cols).not.toContain(6);
    // Must still be contiguous among themselves.
    if (cols.length === 3) {
      expect(cols[1]).toBe(cols[0] + 1);
      expect(cols[2]).toBe(cols[1] + 1);
    }
  });

  it('treats passage seats as blocked, never includable in a block', () => {
    const row = makeRow('A', 12, { 6: { section: 'passage' } });
    const result = findBestAdjacentSeats(row[6], 2, row); // tap A7 (index 6), want 2
    const cols = result.map(s => s.number);
    expect(cols).not.toContain(6);
  });

  it('treats isBlocked seats as blocked regardless of section/status', () => {
    const row = makeRow('A', 12, { 6: { isBlocked: true } });
    const result = findBestAdjacentSeats(row[3], 5, row); // tap A4, want 5 — would need to cross col 6
    const cols = result.map(s => s.number);
    expect(cols).not.toContain(6);
  });

  it('returns empty when not enough contiguous seats exist anywhere in the row', () => {
    const row = makeRow('A', 4, { 2: { status: 'booked' }, 3: { status: 'booked' } });
    const result = findBestAdjacentSeats(row[0], 3, row); // only A1 and A4 open, not adjacent
    expect(result).toEqual([]);
  });

  it('returns empty when the tapped seat itself is unavailable', () => {
    const row = makeRow('A', 12, { 5: { status: 'booked' } });
    const result = findBestAdjacentSeats(row[4], 2, row);
    expect(result).toEqual([]);
  });

  it('only considers seats in the same row as the tapped seat', () => {
    const rowA = makeRow('A', 12);
    const rowB = makeRow('B', 12);
    const result = findBestAdjacentSeats(rowA[4], 3, [...rowA, ...rowB]);
    expect(result.every(s => s.row === 'A')).toBe(true);
  });

  it('returns empty for a malformed seat with no label', () => {
    const badSeat: Seat = { id: 'x', row: 'A', number: 1, section: 'gold', status: 'available', price: 100 };
    expect(findBestAdjacentSeats(badSeat, 2, [badSeat])).toEqual([]);
  });
});
