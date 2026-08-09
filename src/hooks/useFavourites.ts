import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Generic AsyncStorage-backed favourites set — used for both favourite movies and favourite theatres. */
export function useFavourites(storageKey: string) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then(raw => {
        if (raw) setIds(JSON.parse(raw));
      })
      .catch(() => {});
  }, [storageKey]);

  const toggle = useCallback(
    (id: string) => {
      setIds(prev => {
        const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
        AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [storageKey],
  );

  const isFavourite = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, isFavourite, toggle };
}
