import { useCallback, useEffect, useState } from 'react';
import { SeatLayout } from '@ctypes/models';
import { getSeatLayout } from '@services/seatsService';
import { cachedFetch, CacheTTL, getCached } from '@services/queryCache';

export function useSeatLayout(showId: string) {
  const key = `seat-layout:${showId}`;
  const [layout, setLayout] = useState<SeatLayout | null>(() => getCached(key, CacheTTL.seatLayout) ?? null);
  // isRefreshing covers both the initial load AND every focus/foreground poll —
  // the screen only skeletons on the former (when layout is still null).
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!showId) return;

    const k = `seat-layout:${showId}`;
    setIsRefreshing(true);
    setError(null);
    const { cached, promise } = cachedFetch(k, () => getSeatLayout(showId), CacheTTL.seatLayout);
    if (cached) setLayout(cached);

    promise
      .then(data => {
        if (!cancelled) setLayout(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load seat layout.');
      })
      .finally(() => {
        if (!cancelled) setIsRefreshing(false);
      });

    return () => { cancelled = true; };
  }, [showId, tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);
  const loading = isRefreshing && layout === null;

  return { layout, loading, isRefreshing, error, refetch };
}
