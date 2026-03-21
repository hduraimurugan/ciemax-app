import { Show, Theatre } from '@ctypes/models';
import { MockDelay } from '@constants/config';

const MOCK_THEATRES: Theatre[] = [
  {
    id: 't1',
    name: 'PVR: Phoenix MarketCity',
    address: 'Velachery Main Rd, Velachery',
    city: 'Chennai',
    distance: '2.1 km',
    amenities: ['Parking', 'Food Court', 'Wheelchair', 'Dolby'],
    rating: 4.3,
  },
  {
    id: 't2',
    name: 'INOX: GVK One Mall',
    address: 'Road No. 1, Banjara Hills',
    city: 'Chennai',
    distance: '4.8 km',
    amenities: ['Parking', 'Food Court', 'IMAX'],
    rating: 4.5,
  },
  {
    id: 't3',
    name: 'AGS Cinemas: OMR',
    address: '5th Block, Sholinganallur',
    city: 'Chennai',
    distance: '7.2 km',
    amenities: ['Parking', 'Wheelchair'],
    rating: 3.9,
  },
  {
    id: 't4',
    name: 'SPI: Palazzo, ECR',
    address: 'ECR, Neelankarai',
    city: 'Chennai',
    distance: '9.5 km',
    amenities: ['Parking', 'Food Court', '4DX'],
    rating: 4.7,
  },
  {
    id: 't5',
    name: 'Escape Cinemas: Anna Nagar',
    address: 'Anna Nagar Western Extension',
    city: 'Chennai',
    distance: '11.3 km',
    amenities: ['Parking', 'Food Court', 'Dolby'],
    rating: 4.1,
  },
];

// Shows keyed by movieId → theatreId
const MOCK_SHOWS: Show[] = [
  // Kalki - Theatre 1
  { id: 's1', movieId: 'm1', theatreId: 't1', date: '2026-03-21', time: '09:30 AM', format: '2D', language: 'Tamil', availableSeats: 45, totalSeats: 120, priceMultiplier: 1.0 },
  { id: 's2', movieId: 'm1', theatreId: 't1', date: '2026-03-21', time: '01:00 PM', format: '3D', language: 'Tamil', availableSeats: 20, totalSeats: 120, priceMultiplier: 1.3 },
  { id: 's3', movieId: 'm1', theatreId: 't1', date: '2026-03-21', time: '04:30 PM', format: 'IMAX', language: 'Tamil', availableSeats: 5, totalSeats: 90, priceMultiplier: 1.8 },
  { id: 's4', movieId: 'm1', theatreId: 't1', date: '2026-03-21', time: '09:00 PM', format: '2D', language: 'Tamil', availableSeats: 80, totalSeats: 120, priceMultiplier: 1.0 },
  // Kalki - Theatre 2
  { id: 's5', movieId: 'm1', theatreId: 't2', date: '2026-03-21', time: '10:00 AM', format: 'IMAX', language: 'Tamil', availableSeats: 30, totalSeats: 90, priceMultiplier: 1.8 },
  { id: 's6', movieId: 'm1', theatreId: 't2', date: '2026-03-21', time: '02:00 PM', format: '3D', language: 'Hindi', availableSeats: 60, totalSeats: 120, priceMultiplier: 1.3 },
  { id: 's7', movieId: 'm1', theatreId: 't2', date: '2026-03-21', time: '06:30 PM', format: '2D', language: 'Tamil', availableSeats: 90, totalSeats: 120, priceMultiplier: 1.0 },
  // Kalki - Theatre 3
  { id: 's8', movieId: 'm1', theatreId: 't3', date: '2026-03-21', time: '11:00 AM', format: '2D', language: 'Tamil', availableSeats: 100, totalSeats: 120, priceMultiplier: 1.0 },
  { id: 's9', movieId: 'm1', theatreId: 't3', date: '2026-03-21', time: '03:00 PM', format: '2D', language: 'Tamil', availableSeats: 70, totalSeats: 120, priceMultiplier: 1.0 },
  // Kalki - Theatre 4
  { id: 's10', movieId: 'm1', theatreId: 't4', date: '2026-03-21', time: '12:30 PM', format: '4DX', language: 'Tamil', availableSeats: 15, totalSeats: 60, priceMultiplier: 2.2 },
  { id: 's11', movieId: 'm1', theatreId: 't4', date: '2026-03-21', time: '05:00 PM', format: '4DX', language: 'Tamil', availableSeats: 30, totalSeats: 60, priceMultiplier: 2.2 },
  // Vettaiyan - Theatre 1
  { id: 's12', movieId: 'm2', theatreId: 't1', date: '2026-03-21', time: '10:30 AM', format: '2D', language: 'Tamil', availableSeats: 65, totalSeats: 120, priceMultiplier: 1.0 },
  { id: 's13', movieId: 'm2', theatreId: 't1', date: '2026-03-21', time: '02:30 PM', format: '3D', language: 'Tamil', availableSeats: 40, totalSeats: 120, priceMultiplier: 1.3 },
  { id: 's14', movieId: 'm2', theatreId: 't1', date: '2026-03-21', time: '07:00 PM', format: '2D', language: 'Tamil', availableSeats: 10, totalSeats: 120, priceMultiplier: 1.0 },
  // Pushpa 2 - Theatre 4
  { id: 's15', movieId: 'm4', theatreId: 't4', date: '2026-03-21', time: '10:00 AM', format: '4DX', language: 'Telugu', availableSeats: 8, totalSeats: 60, priceMultiplier: 2.2 },
  { id: 's16', movieId: 'm4', theatreId: 't2', date: '2026-03-21', time: '01:30 PM', format: 'IMAX', language: 'Telugu', availableSeats: 25, totalSeats: 90, priceMultiplier: 1.8 },
  { id: 's17', movieId: 'm4', theatreId: 't5', date: '2026-03-21', time: '06:00 PM', format: '2D', language: 'Telugu', availableSeats: 80, totalSeats: 120, priceMultiplier: 1.0 },
];

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export async function getTheatresForMovie(movieId: string): Promise<Theatre[]> {
  await delay(MockDelay);
  const theatreIds = [
    ...new Set(MOCK_SHOWS.filter(s => s.movieId === movieId).map(s => s.theatreId)),
  ];
  return MOCK_THEATRES.filter(t => theatreIds.includes(t.id));
}

export async function getAllTheatres(): Promise<Theatre[]> {
  await delay(MockDelay);
  return MOCK_THEATRES;
}

export async function getTheatreById(id: string): Promise<Theatre | undefined> {
  await delay(MockDelay / 2);
  return MOCK_THEATRES.find(t => t.id === id);
}

export async function getShowsForMovieAndTheatre(
  movieId: string,
  theatreId: string,
): Promise<Show[]> {
  await delay(MockDelay);
  return MOCK_SHOWS.filter(s => s.movieId === movieId && s.theatreId === theatreId);
}

export async function getShowById(id: string): Promise<Show | undefined> {
  await delay(MockDelay / 2);
  return MOCK_SHOWS.find(s => s.id === id);
}
