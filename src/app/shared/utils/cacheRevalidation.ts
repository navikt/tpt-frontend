import type { CacheEntryMeta } from "@/app/shared/utils/indexedDbCache";

/**
 * Determines whether a cached entry needs revalidation (fetching fresh data).
 *
 * ── HOW TO SWAP ─────────────────────────────────────────────────────────
 * Replace the implementation below.  Currently uses time-based expiry.
 * Future: call a backend endpoint (e.g. `/api/app-version`) and compare
 * against `entry.appVersion`:
 *
 *   const res = await fetch("/api/app-version");
 *   const { version } = await res.json();
 *   return entry.appVersion !== version;
 * ─────────────────────────────────────────────────────────────────────────
 */
export async function needsRevalidation(
  entry: CacheEntryMeta | null,
  maxAgeMs: number,
): Promise<boolean> {
  if (!entry) return true;
  return Date.now() - entry.updatedAt > maxAgeMs;
}
