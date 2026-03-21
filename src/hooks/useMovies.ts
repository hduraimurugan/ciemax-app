import { useEffect, useState } from 'react';
import { Movie } from '@ctypes/models';
import { getNowShowingMovies, getComingSoonMovies } from '@services/moviesService';

interface MoviesState {
  nowShowing: Movie[];
  comingSoon: Movie[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useMovies(): MoviesState {
  const [nowShowing, setNowShowing] = useState<Movie[]>([]);
  const [comingSoon, setComingSoon] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [ns, cs] = await Promise.all([
          getNowShowingMovies(),
          getComingSoonMovies(),
        ]);
        if (!cancelled) {
          setNowShowing(ns);
          setComingSoon(cs);
        }
      } catch {
        if (!cancelled) setError('Failed to load movies. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [tick]);

  return { nowShowing, comingSoon, loading, error, refresh: () => setTick(t => t + 1) };
}
