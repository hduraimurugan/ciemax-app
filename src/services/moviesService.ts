import { Movie } from '@ctypes/models';
import { MockDelay } from '@constants/config';

const MOCK_MOVIES: Movie[] = [
  {
    id: 'm1',
    title: 'Kalki 2898 AD',
    posterUrl: 'https://picsum.photos/seed/kalki/400/600',
    backdropUrl: 'https://picsum.photos/seed/kalki-back/800/450',
    genre: ['Sci-Fi', 'Action', 'Mythology'],
    rating: 8.4,
    duration: 181,
    language: 'Tamil',
    releaseDate: '2024-06-27',
    synopsis:
      'Set in a dystopian future, Kalki is a mythological sci-fi epic based on the tenth avatar of Vishnu. A warrior rises to save humanity from the dark forces of Kali-Yuga.',
    cast: ['Prabhas', 'Deepika Padukone', 'Amitabh Bachchan', 'Kamal Haasan'],
    director: 'Nag Ashwin',
    format: ['2D', '3D', 'IMAX'],
    isNowShowing: true,
    isComingSoon: false,
  },
  {
    id: 'm2',
    title: 'Vettaiyan',
    posterUrl: 'https://picsum.photos/seed/vettaiyan/400/600',
    backdropUrl: 'https://picsum.photos/seed/vettaiyan-back/800/450',
    genre: ['Action', 'Thriller', 'Drama'],
    rating: 7.8,
    duration: 168,
    language: 'Tamil',
    releaseDate: '2024-10-10',
    synopsis:
      'A veteran cop on the verge of retirement faces a moral crisis when a ruthless encounter specialist challenges the very system he swore to protect.',
    cast: ['Rajinikanth', 'Fahadh Faasil', 'Amitabh Bachchan', 'Rana Daggubati'],
    director: 'T.J. Gnanavel',
    format: ['2D', '3D'],
    isNowShowing: true,
    isComingSoon: false,
  },
  {
    id: 'm3',
    title: 'Singham Again',
    posterUrl: 'https://picsum.photos/seed/singham/400/600',
    backdropUrl: 'https://picsum.photos/seed/singham-back/800/450',
    genre: ['Action', 'Drama'],
    rating: 6.9,
    duration: 155,
    language: 'Hindi',
    releaseDate: '2024-11-01',
    synopsis:
      'Inspector Bajirao Singham returns, this time battling a powerful criminal empire while uncovering a conspiracy that reaches the highest corridors of power.',
    cast: ['Ajay Devgn', 'Deepika Padukone', 'Ranveer Singh', 'Akshay Kumar'],
    director: 'Rohit Shetty',
    format: ['2D', '3D'],
    isNowShowing: true,
    isComingSoon: false,
  },
  {
    id: 'm4',
    title: 'Pushpa 2: The Rule',
    posterUrl: 'https://picsum.photos/seed/pushpa2/400/600',
    backdropUrl: 'https://picsum.photos/seed/pushpa2-back/800/450',
    genre: ['Action', 'Drama', 'Crime'],
    rating: 8.1,
    duration: 192,
    language: 'Telugu',
    releaseDate: '2024-12-05',
    synopsis:
      'Pushpa Raj consolidates his red sandalwood empire and faces his greatest adversary yet — a dangerous cop who will stop at nothing to bring him down.',
    cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    director: 'Sukumar',
    format: ['2D', '3D', 'IMAX', '4DX'],
    isNowShowing: true,
    isComingSoon: false,
  },
  {
    id: 'm5',
    title: 'Dragon',
    posterUrl: 'https://picsum.photos/seed/dragon/400/600',
    backdropUrl: 'https://picsum.photos/seed/dragon-back/800/450',
    genre: ['Action', 'Fantasy'],
    rating: 7.5,
    duration: 165,
    language: 'Tamil',
    releaseDate: '2025-01-10',
    synopsis:
      'A young man discovers he is the descendant of an ancient dragon clan and must master his powers to defeat a rising shadow organization.',
    cast: ['Vikram', 'Ananya Panday', 'Bobby Deol'],
    director: 'Shankar',
    format: ['2D', 'IMAX'],
    isNowShowing: true,
    isComingSoon: false,
  },
  {
    id: 'm6',
    title: 'Retro',
    posterUrl: 'https://picsum.photos/seed/retro/400/600',
    backdropUrl: 'https://picsum.photos/seed/retro-back/800/450',
    genre: ['Romance', 'Drama'],
    rating: 7.2,
    duration: 148,
    language: 'Tamil',
    releaseDate: '2025-04-10',
    synopsis:
      'A timeless love story set across two decades, where two souls find themselves, lose each other, and rediscover their bond in unexpected ways.',
    cast: ['Suriya', 'Pooja Hegde'],
    director: 'Karthik Subbaraj',
    format: ['2D'],
    isNowShowing: false,
    isComingSoon: true,
  },
  {
    id: 'm7',
    title: 'Coolie',
    posterUrl: 'https://picsum.photos/seed/coolie/400/600',
    backdropUrl: 'https://picsum.photos/seed/coolie-back/800/450',
    genre: ['Action', 'Thriller'],
    rating: 0,
    duration: 0,
    language: 'Tamil',
    releaseDate: '2025-05-01',
    synopsis:
      'An unstoppable force from the railways becomes the last line of defence against an international crime syndicate.',
    cast: ['Rajinikanth', 'Nagarjuna', 'Shruti Haasan'],
    director: 'Lokesh Kanagaraj',
    format: ['2D', '3D', 'IMAX'],
    isNowShowing: false,
    isComingSoon: true,
  },
  {
    id: 'm8',
    title: 'Inception 2',
    posterUrl: 'https://picsum.photos/seed/inception2/400/600',
    backdropUrl: 'https://picsum.photos/seed/inception2-back/800/450',
    genre: ['Sci-Fi', 'Thriller', 'Drama'],
    rating: 9.0,
    duration: 178,
    language: 'English',
    releaseDate: '2025-07-16',
    synopsis:
      'Dom Cobb returns to the labyrinthine dreamscape for one final mission — to undo what was once built, before reality itself collapses.',
    cast: ['Leonardo DiCaprio', 'Cillian Murphy', 'Joseph Gordon-Levitt'],
    director: 'Christopher Nolan',
    format: ['2D', 'IMAX'],
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
      m.cast.some(c => c.toLowerCase().includes(q)),
  );
}
