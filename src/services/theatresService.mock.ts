import { Show, ShowFormat, Theatre } from '@ctypes/models';
import { MockDelay } from '@constants/config';
import { getNowShowingMovies } from './moviesService.mock';

interface CinemaShowtime {
  time: string;
  status: 'available' | 'fast' | 'soldout';
}

interface CinemaBase {
  id: string;
  name: string;
  screen: string;
  format: ShowFormat;
  showtimes: CinemaShowtime[];
}

// Sample cinemas from the CineHall design — same 3 venues/showtimes apply across
// every now-showing movie and date, matching the design's flat mock catalog.
const CINEMAS_BASE: CinemaBase[] = [
  {
    id: 'grand-vista',
    name: 'Grand Vista Cinemas',
    screen: 'Screen 3 · Dolby Atmos',
    format: '2D',
    showtimes: [
      { time: '10:30 AM', status: 'available' },
      { time: '1:45 PM', status: 'fast' },
      { time: '5:00 PM', status: 'soldout' },
      { time: '9:15 PM', status: 'available' },
    ],
  },
  {
    id: 'skyline',
    name: 'Skyline Multiplex',
    screen: 'Screen 1 · IMAX',
    format: 'IMAX',
    showtimes: [
      { time: '11:00 AM', status: 'fast' },
      { time: '2:30 PM', status: 'available' },
      { time: '8:00 PM', status: 'available' },
    ],
  },
  {
    id: 'cineplex-prime',
    name: 'Cineplex Prime - Forum Mall',
    screen: 'Screen 5',
    format: '2D',
    showtimes: [
      { time: '12:15 PM', status: 'available' },
      { time: '4:45 PM', status: 'fast' },
      { time: '7:30 PM', status: 'soldout' },
      { time: '10:00 PM', status: 'available' },
    ],
  },
];

const TOTAL_SEATS = 120;

function seatsForStatus(status: CinemaShowtime['status']): number {
  if (status === 'soldout') return 0;
  if (status === 'fast') return 15; // <20% of TOTAL_SEATS
  return 80;
}

function nextDates(count: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

const DATES = nextDates(7);

function buildTheatres(): Theatre[] {
  return CINEMAS_BASE.map(c => ({
    id: c.id,
    name: c.name,
    address: c.screen,
    city: 'Bengaluru',
    amenities: c.format === 'IMAX' ? ['IMAX', 'Parking', 'Food Court'] : ['Parking', 'Food Court'],
    rating: 4.3,
  }));
}

const MOCK_THEATRES: Theatre[] = buildTheatres();

function buildShowsForMovie(movieId: string, language: string): Show[] {
  const shows: Show[] = [];
  CINEMAS_BASE.forEach(cinema => {
    DATES.forEach((date, dateIdx) => {
      cinema.showtimes.forEach((st, timeIdx) => {
        shows.push({
          id: `${movieId}-${cinema.id}-${dateIdx}-${timeIdx}`,
          movieId,
          theatreId: cinema.id,
          date,
          time: st.time,
          format: cinema.format,
          language,
          availableSeats: seatsForStatus(st.status),
          totalSeats: TOTAL_SEATS,
          priceMultiplier: cinema.format === 'IMAX' ? 1.8 : 1.0,
        });
      });
    });
  });
  return shows;
}

let showsCache: Show[] | null = null;

async function getAllShows(): Promise<Show[]> {
  if (showsCache) return showsCache;
  const nowShowing = await getNowShowingMovies();
  showsCache = nowShowing.flatMap(m => buildShowsForMovie(m.id, m.language));
  return showsCache;
}

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export async function getTheatresForMovie(movieId: string): Promise<Theatre[]> {
  await delay(MockDelay);
  const shows = await getAllShows();
  const theatreIds = [...new Set(shows.filter(s => s.movieId === movieId).map(s => s.theatreId))];
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

export async function getShowsForMovieAndTheatre(movieId: string, theatreId: string): Promise<Show[]> {
  await delay(MockDelay);
  const shows = await getAllShows();
  return shows.filter(s => s.movieId === movieId && s.theatreId === theatreId);
}

export async function getShowsForMovie(movieId: string): Promise<Show[]> {
  await delay(MockDelay);
  const shows = await getAllShows();
  return shows.filter(s => s.movieId === movieId);
}

export async function getShowById(id: string): Promise<Show | undefined> {
  await delay(MockDelay / 2);
  const shows = await getAllShows();
  return shows.find(s => s.id === id);
}

export const SHOWTIME_DATES = DATES;
