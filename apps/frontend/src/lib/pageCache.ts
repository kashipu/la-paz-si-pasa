// ponytail: single-process in-memory cache; move to Redis if the frontend ever runs >1 replica
type CacheEntry = {
  body: string;
  status: number;
  headers: [string, string][];
  expiresAt: number;
};

const store = new Map<string, CacheEntry>();
const TTL_MS = 10 * 60 * 1000;

export function getCachedPage(key: string): CacheEntry | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry;
}

export function setCachedPage(key: string, entry: Omit<CacheEntry, "expiresAt">) {
  store.set(key, { ...entry, expiresAt: Date.now() + TTL_MS });
}

export function clearPageCache() {
  store.clear();
}
