import { useEffect, useState } from 'react';
import { Movie } from '@ctypes/models';
import { getNowShowingMovies, getComingSoonMovies } from '@services/moviesService';
import { useLocationStore } from '@store/locationStore';
import { cachedFetch, CacheTTL, getCached } from '@services/queryCache';

interface MoviesState {
  nowShowing: Movie[];
  comingSoon: Movie[];
  /** True only while there is no data at all yet — drives the skeleton. */
  loading: boolean;
  /** True during a background revalidation of already-visible data — never shows a skeleton. */
  isRefreshing: boolean;
  error: string | null;
  refresh: () => void;
}

function keysFor(district?: string | null, state?: string | null) {
  const loc = `${district ?? ''}:${state ?? ''}`;
  return { ns: `movies:now:${loc}`, cs: `movies:soon:${loc}` };
}

export function useMovies(): MoviesState {
  const district = useLocationStore(s => s.district);
  const state = useLocationStore(s => s.state);
  const { ns, cs } = keysFor(district, state);

  const [nowShowing, setNowShowing] = useState<Movie[]>(() => getCached(ns, CacheTTL.movies) ?? []);
  const [comingSoon, setComingSoon] = useState<Movie[]>(() => getCached(cs, CacheTTL.movies) ?? []);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  // isRefreshing tracks background revalidation separate from the cold-start `loading` flag below.
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const { ns: nsKey, cs: csKey } = keysFor(district, state);
    setIsRefreshing(true);
    setError(null);

    const nsCached = cachedFetch(nsKey, () => getNowShowingMovies(district ?? undefined, state ?? undefined), CacheTTL.movies);
    const csCached = cachedFetch(csKey, () => getComingSoonMovies(district ?? undefined, state ?? undefined), CacheTTL.movies);
    if (nsCached.cached) setNowShowing(nsCached.cached);
    if (csCached.cached) setComingSoon(csCached.cached);

    Promise.all([nsCached.promise, csCached.promise])
      .then(([ns2, cs2]) => {
        if (cancelled) return;
        setNowShowing(ns2);
        setComingSoon(cs2);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load movies. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setIsRefreshing(false);
      });

    return () => { cancelled = true; };
  }, [tick, district, state]);

  const loading = isRefreshing && nowShowing.length === 0 && comingSoon.length === 0;

  return { nowShowing, comingSoon, loading, isRefreshing, error, refresh: () => setTick(t => t + 1) };
}
