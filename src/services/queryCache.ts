/**
 * Lightweight in-memory cache + in-flight request dedup for GET-ish data.
 *
 * Not a replacement for a real data library — just enough to (a) let a
 * screen render cached data synchronously on mount instead of flashing a
 * skeleton for data fetched moments ago, and (b) collapse concurrent
 * requests for the same key into one network call (e.g. ShowtimesScreen's
 * `useTheatresForMovie` + `useShowsForMovie` hitting the same endpoint).
 *
 * Cache lives for the app's lifetime (cleared on logout via `clearCache`,
 * wired from authStore). Values are trusted for `ttlMs`; a `get()` past
 * that returns undefined so the caller treats it as a cold start.
 */

interface CacheEntry<T> {
  data: T;
  at: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

/** Synchronously read a still-fresh cached value, if any. */
export function getCached<T>(key: string, ttlMs: number): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() - entry.at > ttlMs) return undefined;
  return entry.data;
}

/** Read a cached value regardless of staleness (useful for optimistic seeding while revalidating). */
export function getStale<T>(key: string): T | undefined {
  return (store.get(key) as CacheEntry<T> | undefined)?.data;
}

function setCached<T>(key: string, data: T): void {
  store.set(key, { data, at: Date.now() });
}

/**
 * Fetches `fn()`, deduping concurrent callers for the same `key` into one
 * in-flight promise, and caching the resolved value. Rejections are not
 * cached (so a failed fetch can be retried immediately) but are still
 * shared with concurrent callers of the same key.
 */
export function dedupedFetch<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const promise = fn()
    .then(data => {
      setCached(key, data);
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

/**
 * Convenience wrapper for the common "seed from cache, then revalidate"
 * pattern used by the data hooks: returns the fresh-enough cached value (if
 * any) alongside the deduped promise for the latest data.
 */
export function cachedFetch<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number,
): { cached: T | undefined; promise: Promise<T> } {
  return { cached: getCached<T>(key, ttlMs), promise: dedupedFetch(key, fn) };
}

/** Drops every cache entry whose key starts with `prefix` (e.g. on logout, or after a mutation). */
export function invalidate(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
  for (const key of inflight.keys()) {
    if (key.startsWith(prefix)) inflight.delete(key);
  }
}

/** Drops everything — used on logout so a second account never sees the first's cached data. */
export function clearCache(): void {
  store.clear();
  inflight.clear();
}

export const CacheTTL = {
  movies: 5 * 60_000,
  movieDetail: 15 * 60_000,
  theatres: 5 * 60_000,
  showtimes: 5 * 60_000,
  offers: 30 * 60_000,
  settings: 30 * 60_000,
  bookings: 60_000,
  seatLayout: 15_000,
} as const;
