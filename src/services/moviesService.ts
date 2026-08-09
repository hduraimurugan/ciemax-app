import { Env } from '@constants/env';
import { httpClient } from './httpClient';
import { mapMovie } from './mappers';
import * as mock from './moviesService.mock';
import type { Movie } from '@ctypes/models';
import type {
  GetAllMoviesResponse,
  GetMovieByIdResponse,
  GetMoviesByLocationResponse,
  GetMovieShowtimesResponse,
  GetDistrictsResponse,
  ApiShowtimeHall,
} from '@ctypes/api';

const BASE = '/api/user/movies';

export async function getMovies(params?: { search?: string }): Promise<Movie[]> {
  if (Env.USE_MOCKS) return mock.getMovies();
  const res = await httpClient.get<GetAllMoviesResponse>(BASE, { skipAuth: true, query: params });
  return res.movies.map(mapMovie);
}

/**
 * Location-aware when district/state are known (real app flow); falls back
 * to the global now-showing list otherwise (e.g. before the user grants
 * location permission).
 */
export async function getNowShowingMovies(district?: string, state?: string): Promise<Movie[]> {
  if (Env.USE_MOCKS) return mock.getNowShowingMovies();
  if (district && state) {
    const res = await httpClient.get<GetMoviesByLocationResponse>(`${BASE}/location/movies`, {
      skipAuth: true,
      query: { district, state },
    });
    return res.movies.filter(m => m.status === 'now_showing').map(mapMovie);
  }
  const res = await httpClient.get<GetAllMoviesResponse>(BASE, {
    skipAuth: true,
    query: { status: 'now_showing' },
  });
  return res.movies.map(mapMovie);
}

export async function getComingSoonMovies(district?: string, state?: string): Promise<Movie[]> {
  if (Env.USE_MOCKS) return mock.getComingSoonMovies();
  if (district && state) {
    const res = await httpClient.get<GetMoviesByLocationResponse>(`${BASE}/location/movies`, {
      skipAuth: true,
      query: { district, state },
    });
    return res.movies.filter(m => m.status === 'upcoming').map(mapMovie);
  }
  const res = await httpClient.get<GetAllMoviesResponse>(BASE, {
    skipAuth: true,
    query: { status: 'upcoming' },
  });
  return res.movies.map(mapMovie);
}

export async function getMovieById(id: string): Promise<Movie | undefined> {
  if (Env.USE_MOCKS) return mock.getMovieById(id);
  const res = await httpClient.get<GetMovieByIdResponse>(`${BASE}/${id}`, { skipAuth: true });
  return mapMovie(res.movie);
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];
  if (Env.USE_MOCKS) return mock.searchMovies(query);
  const res = await httpClient.get<GetAllMoviesResponse>(BASE, {
    skipAuth: true,
    query: { search: query },
  });
  return res.movies.map(mapMovie);
}

export async function getDistrictsInState(state: string): Promise<string[]> {
  if (Env.USE_MOCKS) return ['Bengaluru Urban', 'Chennai', 'Mumbai City'];
  const res = await httpClient.get<GetDistrictsResponse>(`${BASE}/location/districts`, {
    skipAuth: true,
    query: { state },
  });
  return res.districts;
}

/**
 * Raw cinema-hall + showtime data for a movie at a location — consumed by
 * theatresService, which maps it into Theatre/Show. Kept here (rather than
 * duplicated) since it's the same `/movies/:id/showtimes` endpoint.
 */
export async function getMovieShowtimesRaw(
  movieId: string,
  district: string,
  state: string,
  date?: string,
): Promise<{ movie: Movie; halls: ApiShowtimeHall[] }> {
  const res = await httpClient.get<GetMovieShowtimesResponse>(`${BASE}/${movieId}/showtimes`, {
    skipAuth: true,
    query: { district, state, date },
  });
  return { movie: mapMovie(res.movie), halls: res.cinema_halls };
}
