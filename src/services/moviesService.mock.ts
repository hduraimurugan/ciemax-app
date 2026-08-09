import { Movie } from '@ctypes/models';
import { MockDelay } from '@constants/config';

const MOCK_MOVIES: Movie[] = [
  {
    id: 'spiderman',
    title: 'Spider-Man: Brand New Day',
    posterUrl: 'https://picsum.photos/seed/spiderman/400/600',
    backdropUrl: 'https://picsum.photos/seed/spiderman-back/800/450',
    genre: ['Action', 'Sci-Fi'],
    rating: 8.4,
    duration: 148,
    language: 'English',
    releaseDate: '2026-07-10',
    synopsis:
      "Peter Parker faces his most personal battle yet as new threats emerge across the city, forcing him to redefine what it means to be a hero while balancing the life he's tried to protect. As old alliances fracture, he must decide how far he'll go to keep the people he loves safe.",
    cast: [
      { name: 'R. Menon', initials: 'RM' },
      { name: 'A. Fernandes', initials: 'AF' },
      { name: 'K. Iyer', initials: 'KI' },
      { name: 'S. Rao', initials: 'SR' },
    ],
    director: 'A. Krishnan',
    format: ['2D', '3D', 'IMAX'],
    isNowShowing: true,
    isComingSoon: false,
  },
  {
    id: 'odyssey',
    title: 'Odyssey',
    posterUrl: 'https://picsum.photos/seed/odyssey/400/600',
    backdropUrl: 'https://picsum.photos/seed/odyssey-back/800/450',
    genre: ['Adventure', 'Drama'],
    rating: 8.9,
    duration: 165,
    language: 'English',
    releaseDate: '2026-06-01',
    synopsis:
      "A sweeping journey across uncharted seas follows a crew bound by loyalty and haunted by the past, testing the limits of endurance, trust, and the pull of home. Every port raises a new question about what they're really searching for.",
    cast: [
      { name: 'T. Bose', initials: 'TB' },
      { name: 'V. Nair', initials: 'VN' },
      { name: 'D. Kapoor', initials: 'DK' },
      { name: 'M. Khan', initials: 'MK' },
    ],
    director: 'J. Varma',
    format: ['2D', 'IMAX'],
    isNowShowing: true,
    isComingSoon: false,
  },
  {
    id: 'jananayagan',
    title: 'Jana Nayagan',
    posterUrl: 'https://picsum.photos/seed/jananayagan/400/600',
    backdropUrl: 'https://picsum.photos/seed/jananayagan-back/800/450',
    genre: ['Action', 'Drama'],
    rating: 8.1,
    duration: 170,
    language: 'Tamil',
    releaseDate: '2026-09-25',
    synopsis:
      "A political drama that follows one man's rise from the margins of power to the center of a movement that could reshape a nation's future. His choices ripple far beyond the ballot box.",
    cast: [
      { name: 'P. Raghavan', initials: 'PR' },
      { name: 'L. Krishnan', initials: 'LK' },
      { name: 'G. Suresh', initials: 'GS' },
      { name: 'N. Pillai', initials: 'NP' },
    ],
    director: 'S. Ilango',
    format: ['2D'],
    isNowShowing: false,
    isComingSoon: true,
  },
];

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export async function getMovies(): Promise<Movie[]> {
  await delay(MockDelay);
  return MOCK_MOVIES;
}

export async function getNowShowingMovies(): Promise<Movie[]> {
  await delay(MockDelay);
  return MOCK_MOVIES.filter(m => m.isNowShowing);
}

export async function getComingSoonMovies(): Promise<Movie[]> {
  await delay(MockDelay);
  return MOCK_MOVIES.filter(m => m.isComingSoon);
}

export async function getMovieById(id: string): Promise<Movie | undefined> {
  await delay(MockDelay / 2);
  return MOCK_MOVIES.find(m => m.id === id);
}

export async function searchMovies(query: string): Promise<Movie[]> {
  await delay(MockDelay / 2);
  const q = query.toLowerCase();
  return MOCK_MOVIES.filter(
    m =>
      m.title.toLowerCase().includes(q) ||
      m.genre.some(g => g.toLowerCase().includes(q)) ||
      m.cast.some(c => c.name.toLowerCase().includes(q)),
  );
}
