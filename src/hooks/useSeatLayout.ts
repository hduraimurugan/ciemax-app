import { useEffect, useState } from 'react';
import { SeatLayout } from '@ctypes/models';
import { getSeatLayout } from '@services/seatsService';

export function useSeatLayout(showId: string) {
  const [layout, setLayout] = useState<SeatLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getSeatLayout(showId);
        if (!cancelled) setLayout(data);
      } catch {
        if (!cancelled) setError('Failed to load seat layout.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (showId) load();
    return () => { cancelled = true; };
  }, [showId]);

  return { layout, loading, error };
}
