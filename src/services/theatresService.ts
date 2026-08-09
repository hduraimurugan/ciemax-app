import { Env } from '@constants/env';
import { httpClient } from './httpClient';
import { mapShowtimeHall, mapShowSummary, mapTheatreHall } from './mappers';
import { getMovieShowtimesRaw } from './moviesService';
import * as mock from './theatresService.mock';
import type { Show, Theatre } from '@ctypes/models';
import type { ApiTheatreHall, GetTheatresWithShowsResponse } from '@ctypes/api';

const MOVIES_BASE = '/api/user/movies';

// ─── Per-movie showtimes (backs MovieDetail -> Showtimes) ──────────────────

export async function getTheatresForMovie(movieId: string, district: string, state: string): Promise<Theatre[]> {
  if (Env.USE_MOCKS) return mock.getTheatresForMovie(movieId);
  const { halls } = await getMovieShowtimesRaw(movieId, district, state);
  return halls.map(mapShowtimeHall);
}

export async function getShowsForMovie(
  movieId: string,
  district: string,
  state: string,
  date?: string,
): Promise<Show[]> {
  if (Env.USE_MOCKS) return mock.getShowsForMovie(movieId);
  const { halls } = await getMovieShowtimesRaw(movieId, district, state, date);
  return halls.flatMap(h => h.shows.map(s => mapShowSummary(s, movieId, h.cinema_hall_id)));
}

export async function getShowsForMovieAndTheatre(
  movieId: string,
  theatreId: string,
  district: string,
  state: string,
  date?: string,
): Promise<Show[]> {
  if (Env.USE_MOCKS) return mock.getShowsForMovieAndTheatre(movieId, theatreId);
  const shows = await getShowsForMovie(movieId, district, state, date);
  return shows.filter(s => s.theatreId === theatreId);
}

// ─── Theatres tab (hall -> movies -> shows for a location/date) ────────────

/** Raw hall-grouped data for the Theatres screen (hall -> movies -> shows). */
export async function getTheatresWithShows(
  district: string,
  state: string,
  date?: string,
): Promise<ApiTheatreHall[]> {
  const res = await httpClient.get<GetTheatresWithShowsResponse>(`${MOVIES_BASE}/location/theatres`, {
    skipAuth: true,
    query: { district, state, date },
  });
  return res.cinema_halls;
}

export async function getAllTheatres(district: string, state: string): Promise<Theatre[]> {
  if (Env.USE_MOCKS) return mock.getAllTheatres();
  const halls = await getTheatresWithShows(district, state);
  return halls.map(mapTheatreHall);
}

export async function getTheatreById(id: string, district: string, state: string): Promise<Theatre | undefined> {
  if (Env.USE_MOCKS) return mock.getTheatreById(id);
  const theatres = await getAllTheatres(district, state);
  return theatres.find(t => t.id === id);
}
