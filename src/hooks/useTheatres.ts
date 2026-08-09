import { useEffect, useState } from 'react';
import { Show, Theatre } from '@ctypes/models';
import { getTheatresForMovie, getShowsForMovieAndTheatre, getShowsForMovie } from '@services/theatresService';
import { useLocationStore } from '@store/locationStore';

export function useTheatresForMovie(movieId: string) {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const district = useLocationStore(s => s.district);
  const state = useLocationStore(s => s.state);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!district || !state) {
        setLoading(false);
        setTheatres([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getTheatresForMovie(movieId, district, state);
        if (!cancelled) setTheatres(data);
      } catch {
        if (!cancelled) setError('Failed to load theatres.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (movieId) load();
    return () => { cancelled = true; };
  }, [movieId, district, state]);

  return { theatres, loading, error, hasLocation: !!(district && state) };
}

export function useShowsForMovie(movieId: string, date?: string) {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const district = useLocationStore(s => s.district);
  const state = useLocationStore(s => s.state);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!district || !state) {
        setLoading(false);
        setShows([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getShowsForMovie(movieId, district, state, date);
        if (!cancelled) setShows(data);
      } catch {
        if (!cancelled) setError('Failed to load showtimes.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (movieId) load();
    return () => { cancelled = true; };
  }, [movieId, date, district, state]);

  return { shows, loading, error, hasLocation: !!(district && state) };
}

export function useShowsForMovieTheatre(movieId: string, theatreId: string, date?: string) {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const district = useLocationStore(s => s.district);
  const state = useLocationStore(s => s.state);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!district || !state) {
        setLoading(false);
        setShows([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getShowsForMovieAndTheatre(movieId, theatreId, district, state, date);
        if (!cancelled) setShows(data);
      } catch {
        if (!cancelled) setError('Failed to load shows.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (movieId && theatreId) load();
    return () => { cancelled = true; };
  }, [movieId, theatreId, date, district, state]);

  return { shows, loading, error };
}
