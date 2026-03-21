import { useEffect, useState } from 'react';
import { Show, Theatre } from '@ctypes/models';
import { getTheatresForMovie, getShowsForMovieAndTheatre } from '@services/theatresService';

export function useTheatresForMovie(movieId: string) {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTheatresForMovie(movieId);
        if (!cancelled) setTheatres(data);
      } catch {
        if (!cancelled) setError('Failed to load theatres.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (movieId) load();
    return () => { cancelled = true; };
  }, [movieId]);

  return { theatres, loading, error };
}

export function useShowsForMovieTheatre(movieId: string, theatreId: string) {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getShowsForMovieAndTheatre(movieId, theatreId);
        if (!cancelled) setShows(data);
      } catch {
        if (!cancelled) setError('Failed to load shows.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (movieId && theatreId) load();
    return () => { cancelled = true; };
  }, [movieId, theatreId]);

  return { shows, loading, error };
}
