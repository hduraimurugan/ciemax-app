import { useEffect, useState } from 'react';
import { Show, Theatre } from '@ctypes/models';
import { getTheatresForMovie, getShowsForMovieAndTheatre, getShowsForMovie } from '@services/theatresService';
import { useLocationStore } from '@store/locationStore';
import { cachedFetch, CacheTTL, getCached } from '@services/queryCache';

export function useTheatresForMovie(movieId: string, date?: string) {
  const district = useLocationStore(s => s.district);
  const state = useLocationStore(s => s.state);
  const key = `theatres:${movieId}:${district ?? ''}:${state ?? ''}:${date ?? ''}`;

  const [theatres, setTheatres] = useState<Theatre[]>(() => getCached(key, CacheTTL.theatres) ?? []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!district || !state) {
      setTheatres([]);
      return;
    }
    if (!movieId) return;

    const k = `theatres:${movieId}:${district}:${state}:${date ?? ''}`;
    setIsRefreshing(true);
    setError(null);
    const { cached, promise } = cachedFetch(k, () => getTheatresForMovie(movieId, district, state, date), CacheTTL.theatres);
    if (cached) setTheatres(cached);

    promise
      .then(data => {
        if (!cancelled) setTheatres(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load theatres.');
      })
      .finally(() => {
        if (!cancelled) setIsRefreshing(false);
      });

    return () => { cancelled = true; };
  }, [movieId, date, district, state]);

  const loading = isRefreshing && theatres.length === 0;
  return { theatres, loading, isRefreshing, error, hasLocation: !!(district && state) };
}

export function useShowsForMovie(movieId: string, date?: string) {
  const district = useLocationStore(s => s.district);
  const state = useLocationStore(s => s.state);
  const key = `shows:${movieId}:${district ?? ''}:${state ?? ''}:${date ?? ''}`;

  const [shows, setShows] = useState<Show[]>(() => getCached(key, CacheTTL.showtimes) ?? []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!district || !state) {
      setShows([]);
      return;
    }
    if (!movieId) return;

    const k = `shows:${movieId}:${district}:${state}:${date ?? ''}`;
    setIsRefreshing(true);
    setError(null);
    // Same cache key family as useTheatresForMovie's underlying request when
    // called for the same movie/date — getShowsForMovie and
    // getTheatresForMovie both resolve via getMovieShowtimesRaw, but here we
    // cache the mapped shows separately since the two hooks return different
    // shapes. Concurrent identical calls to the *raw* endpoint still dedupe
    // inside httpClient's fetch (see getMovieShowtimesRaw not being keyed
    // here) — the practical win is that within this hook, refetches for the
    // same key share one in-flight promise.
    const { cached, promise } = cachedFetch(k, () => getShowsForMovie(movieId, district, state, date), CacheTTL.showtimes);
    if (cached) setShows(cached);

    promise
      .then(data => {
        if (!cancelled) setShows(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load showtimes.');
      })
      .finally(() => {
        if (!cancelled) setIsRefreshing(false);
      });

    return () => { cancelled = true; };
  }, [movieId, date, district, state]);

  const loading = isRefreshing && shows.length === 0;
  return { shows, loading, isRefreshing, error, hasLocation: !!(district && state) };
}

export function useShowsForMovieTheatre(movieId: string, theatreId: string, date?: string) {
  const district = useLocationStore(s => s.district);
  const state = useLocationStore(s => s.state);
  const key = `shows-th:${movieId}:${theatreId}:${district ?? ''}:${state ?? ''}:${date ?? ''}`;

  const [shows, setShows] = useState<Show[]>(() => getCached(key, CacheTTL.showtimes) ?? []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!district || !state) {
      setShows([]);
      return;
    }
    if (!movieId || !theatreId) return;

    const k = `shows-th:${movieId}:${theatreId}:${district}:${state}:${date ?? ''}`;
    setIsRefreshing(true);
    setError(null);
    const { cached, promise } = cachedFetch(
      k,
      () => getShowsForMovieAndTheatre(movieId, theatreId, district, state, date),
      CacheTTL.showtimes,
    );
    if (cached) setShows(cached);

    promise
      .then(data => {
        if (!cancelled) setShows(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load shows.');
      })
      .finally(() => {
        if (!cancelled) setIsRefreshing(false);
      });

    return () => { cancelled = true; };
  }, [movieId, theatreId, date, district, state]);

  const loading = isRefreshing && shows.length === 0;
  return { shows, loading, isRefreshing, error };
}
