import { useCallback, useEffect, useState } from 'react';

export function useCountdown(initialSeconds: number, onExpire?: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      onExpire?.();
      return;
    }
    const timer = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  const reset = useCallback((next: number = initialSeconds) => setSeconds(next), [initialSeconds]);

  return { seconds, reset };
}
