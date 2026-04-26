const memoryCache = new Map();
const inflight = new Map();
const CACHE_PREFIX = "apiCache:";

const readSession = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeSession = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors (quota, private mode, etc.)
  }
};

export async function cachedFetchJson(url, { ttlMs = 60000 } = {}) {
  const now = Date.now();
  const key = `${CACHE_PREFIX}${url}`;

  const mem = memoryCache.get(key);
  if (mem && now - mem.ts < ttlMs) {
    return mem.data;
  }

  const session = readSession(key);
  if (session && now - session.ts < ttlMs) {
    memoryCache.set(key, session);
    return session.data;
  }

  if (inflight.has(key)) {
    return inflight.get(key);
  }

  const promise = fetch(url)
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        const message = data?.detail || `Request failed: ${res.status}`;
        throw new Error(message);
      }
      const payload = { ts: Date.now(), data };
      memoryCache.set(key, payload);
      writeSession(key, payload);
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

export function peekCachedJson(url, { ttlMs = 60000 } = {}) {
  const now = Date.now();
  const key = `${CACHE_PREFIX}${url}`;

  const mem = memoryCache.get(key);
  if (mem && now - mem.ts < ttlMs) {
    return mem.data;
  }

  const session = readSession(key);
  if (session && now - session.ts < ttlMs) {
    memoryCache.set(key, session);
    return session.data;
  }

  return null;
}
