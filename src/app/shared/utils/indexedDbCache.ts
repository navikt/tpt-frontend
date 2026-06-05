import type { VulnerabilitiesResponse } from "@/app/shared/types/vulnerabilities";

const DB_NAME = "tpt-cache";
const DB_VERSION = 3;

export const STORES = {
  KV: "kv",
  API_CACHE: "apiCache",
  APPLICATIONS_BY_TEAM: "applicationsByTeam",
} as const;

const CACHE_MAX_AGE_MS = 30 * 60 * 1000;

interface ApiCacheEntry<T> {
  key: string;
  data: T;
  updatedAt: number;
  appVersion: string;
}

interface KvEntry {
  key: string;
  value: unknown;
}

interface TeamCacheEntry {
  key: string;
  developerId: string;
  teamSlug: string;
  updatedAt: number;
  appVersion: string;
  payload: VulnerabilitiesResponse;
}

function getAppVersion(): string {
  return (
    process.env.NEXT_PUBLIC_APP_VERSION ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    "unknown"
  );
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORES.APPLICATIONS_BY_TEAM)) {
        const store = db.createObjectStore(STORES.APPLICATIONS_BY_TEAM, { keyPath: "key" });
        store.createIndex("byDeveloper", "developerId", { unique: false });
        store.createIndex("byUpdatedAt", "updatedAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.KV)) {
        db.createObjectStore(STORES.KV, { keyPath: "key" });
      }

      if (!db.objectStoreNames.contains(STORES.API_CACHE)) {
        const store = db.createObjectStore(STORES.API_CACHE, { keyPath: "key" });
        store.createIndex("byUpdatedAt", "updatedAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ─── KV store (preferences, small values) ───────────────────────────────

export async function getKvItem<T>(key: string): Promise<T | null> {
  if (typeof window === "undefined") return null;
  const db = await openDb();
  return new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(STORES.KV, "readonly");
    const req = tx.objectStore(STORES.KV).get(key);
    req.onsuccess = () => {
      const entry = req.result as KvEntry | undefined;
      resolve(entry ? (entry.value as T) : null);
    };
    req.onerror = () => reject(req.error);
  }).finally(() => db.close());
}

export async function setKvItem<T>(key: string, value: T): Promise<void> {
  if (typeof window === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORES.KV, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORES.KV).put({ key, value } satisfies KvEntry);
  }).finally(() => db.close());
}

export async function removeKvItem(key: string): Promise<void> {
  if (typeof window === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORES.KV, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORES.KV).delete(key);
  }).finally(() => db.close());
}

// ─── API cache store (large API responses) ─────────────────────────────

export interface CacheEntryMeta {
  updatedAt: number;
  appVersion: string;
}

export interface CachedItemResult<T> {
  data: T;
  meta: CacheEntryMeta;
}

/**
 * Read a cached item with optional time-based expiry.
 * When `maxAgeMs` is omitted, no TTL check is performed — only the
 * local app version is validated ("forever cache").
 */
export async function getCachedItem<T>(
  key: string,
  maxAgeMs?: number,
): Promise<T | null> {
  if (typeof window === "undefined") return null;
  const db = await openDb();
  return new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(STORES.API_CACHE, "readonly");
    const req = tx.objectStore(STORES.API_CACHE).get(key);
    req.onsuccess = () => {
      const entry = req.result as ApiCacheEntry<T> | undefined;
      if (!entry) return resolve(null);

      const versionMismatch = entry.appVersion !== getAppVersion();
      const isExpired = maxAgeMs !== undefined && Date.now() - entry.updatedAt > maxAgeMs;

      if (versionMismatch || isExpired) return resolve(null);

      resolve(entry.data);
    };
    req.onerror = () => reject(req.error);
  }).finally(() => db.close());
}

/**
 * Read a cached item without TTL — "forever cache".
 * Only the local app version is checked.
 * Returns both data and metadata for use with the revalidation guard.
 */
export async function getCachedItemEntry<T>(
  key: string,
): Promise<CachedItemResult<T> | null> {
  if (typeof window === "undefined") return null;
  const db = await openDb();
  return new Promise<CachedItemResult<T> | null>((resolve, reject) => {
    const tx = db.transaction(STORES.API_CACHE, "readonly");
    const req = tx.objectStore(STORES.API_CACHE).get(key);
    req.onsuccess = () => {
      const entry = req.result as ApiCacheEntry<T> | undefined;
      if (!entry) return resolve(null);

      if (entry.appVersion !== getAppVersion()) return resolve(null);

      resolve({
        data: entry.data,
        meta: { updatedAt: entry.updatedAt, appVersion: entry.appVersion },
      });
    };
    req.onerror = () => reject(req.error);
  }).finally(() => db.close());
}

export async function setCachedItem<T>(key: string, data: T): Promise<void> {
  if (typeof window === "undefined") return;
  const db = await openDb();
  const entry: ApiCacheEntry<T> = {
    key,
    data,
    updatedAt: Date.now(),
    appVersion: getAppVersion(),
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORES.API_CACHE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORES.API_CACHE).put(entry);
  }).finally(() => db.close());
}

export async function removeCachedItem(key: string): Promise<void> {
  if (typeof window === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORES.API_CACHE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORES.API_CACHE).delete(key);
  }).finally(() => db.close());
}

export async function clearExpiredCache(maxAgeMs?: number): Promise<void> {
  const cutoff = Date.now() - (maxAgeMs ?? CACHE_MAX_AGE_MS);
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORES.API_CACHE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);

    const store = tx.objectStore(STORES.API_CACHE);
    const index = store.index("byUpdatedAt");
    const range = IDBKeyRange.upperBound(cutoff);
    const cursorReq = index.openCursor(range);

    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (!cursor) return;
      cursor.delete();
      cursor.continue();
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  }).finally(() => db.close());
}

// ─── Team cache (admin per-team vulnerabilities, existing) ────────────

function makeTeamKey(developerId: string, teamSlug: string): string {
  return `${developerId}::${teamSlug}`;
}

export async function getCachedTeamPayload(
  developerId: string,
  teamSlug: string,
): Promise<VulnerabilitiesResponse | null> {
  if (typeof window === "undefined") return null;
  const db = await openDb();
  return new Promise<VulnerabilitiesResponse | null>((resolve, reject) => {
    const tx = db.transaction(STORES.APPLICATIONS_BY_TEAM, "readonly");
    const store = tx.objectStore(STORES.APPLICATIONS_BY_TEAM);
    const req = store.get(makeTeamKey(developerId, teamSlug));

    req.onsuccess = () => {
      const entry = req.result as TeamCacheEntry | undefined;
      if (!entry) return resolve(null);

      const isExpired = Date.now() - entry.updatedAt > CACHE_MAX_AGE_MS;
      const versionMismatch = entry.appVersion !== getAppVersion();

      if (isExpired || versionMismatch) return resolve(null);

      resolve(entry.payload);
    };
    req.onerror = () => reject(req.error);
  }).finally(() => db.close());
}

export async function setCachedTeamPayload(
  developerId: string,
  teamSlug: string,
  payload: VulnerabilitiesResponse,
): Promise<void> {
  if (typeof window === "undefined") return;
  const db = await openDb();
  const entry: TeamCacheEntry = {
    key: makeTeamKey(developerId, teamSlug),
    developerId,
    teamSlug,
    updatedAt: Date.now(),
    appVersion: getAppVersion(),
    payload,
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORES.APPLICATIONS_BY_TEAM, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORES.APPLICATIONS_BY_TEAM).put(entry);
  }).finally(() => db.close());
}

export async function purgeExpiredTeamPayloads(maxAgeMs?: number): Promise<void> {
  const cutoff = Date.now() - (maxAgeMs ?? CACHE_MAX_AGE_MS);
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORES.APPLICATIONS_BY_TEAM, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);

    const store = tx.objectStore(STORES.APPLICATIONS_BY_TEAM);
    const index = store.index("byUpdatedAt");
    const range = IDBKeyRange.upperBound(cutoff);
    const cursorReq = index.openCursor(range);

    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (!cursor) return;
      cursor.delete();
      cursor.continue();
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  }).finally(() => db.close());
}

// ─── Cache keys ────────────────────────────────────────────────────────

export const CACHE_KEYS = {
  VULNERABILITIES: "vulnerabilities",
  GITHUB: "github",
  ADMIN_OVERVIEW: "admin-overview",
  ADMIN_SLA: "admin-sla",
} as const;

export const KV_KEYS = {
  TEAM_PREFERENCES: "tpt-team-preferences",
  GITHUB_TEAM_PREFERENCES: "tpt-github-team-preferences",
  USER_PREFERENCES: "tpt-user-preferences",
  ROLE_CONTEXT: "tpt-role-context",
  LAST_REFRESH_TIME: "tpt-last-refresh-time",
  LAST_REFRESH_GITHUB: "tpt-last-refresh-github",
} as const;
