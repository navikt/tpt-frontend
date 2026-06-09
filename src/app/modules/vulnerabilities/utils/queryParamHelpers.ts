/**
 * Utility functions for serializing and deserializing vulnerability filters to/from URL query params
 * Supports hybrid mode: readable params for team/env/cve/pkg, base64 for app names (can be long)
 */

export type FilterState = Record<string, boolean>;

export interface VulnerabilityFilters {
  teamFilters: FilterState;
  applicationFilters: FilterState;
  environmentFilters: FilterState;
  cveFilters: FilterState;
  packageNameFilters: FilterState;
}

// Query param keys
export const QUERY_PARAM_KEYS = {
  team: "team",
  app: "appf",   // base64-encoded app filter
  env: "env",
  cve: "cve",
  pkg: "pkg",
  compressed: "f", // legacy: single compressed filter param (all filters)
} as const;

/**
 * Decompress base64 string to filters (legacy full-filter format)
 */
function decompressFilters(compressed: string): VulnerabilityFilters | null {
  try {
    const json = decodeURIComponent(atob(compressed));
    return JSON.parse(json) as VulnerabilityFilters;
  } catch {
    return null;
  }
}

/**
 * Encode a list of active filter keys to a compact base64 string
 */
function encodeFilterList(filters: FilterState): string {
  const active = Object.keys(filters).filter((k) => filters[k] === true);
  if (active.length === 0) return "";
  return btoa(encodeURIComponent(JSON.stringify(active)));
}

/**
 * Decode a base64 filter list back to FilterState
 */
function decodeFilterList(encoded: string): FilterState {
  try {
    const keys: string[] = JSON.parse(decodeURIComponent(atob(encoded)));
    return Object.fromEntries(keys.map((k) => [k, true]));
  } catch {
    return {};
  }
}

/**
 * Serialize filter state to comma-separated string (for short filters like team/env)
 */
export function serializeFilters(filters: FilterState): string {
  const activeFilters = Object.keys(filters).filter((key) => filters[key] === true);
  return activeFilters.join(",");
}

/**
 * Deserialize comma-separated string to filter state
 */
export function deserializeFilters(value: string | null): FilterState {
  if (!value) return {};
  return Object.fromEntries(
    value.split(",").filter(Boolean).map((key) => [key, true])
  );
}

/**
 * Convert filter states to URLSearchParams.
 * - team/env/cve/pkg: readable comma-separated params
 * - app: base64-encoded (appf=) to keep URLs short
 */
export function filtersToSearchParams(filters: VulnerabilityFilters): URLSearchParams {
  const params = new URLSearchParams();

  const teamParam = serializeFilters(filters.teamFilters);
  if (teamParam) params.set(QUERY_PARAM_KEYS.team, teamParam);

  // App names can be long — always encode as base64
  const appEncoded = encodeFilterList(filters.applicationFilters);
  if (appEncoded) params.set(QUERY_PARAM_KEYS.app, appEncoded);

  const envParam = serializeFilters(filters.environmentFilters);
  if (envParam) params.set(QUERY_PARAM_KEYS.env, envParam);

  const cveParam = serializeFilters(filters.cveFilters);
  if (cveParam) params.set(QUERY_PARAM_KEYS.cve, cveParam);

  const pkgParam = serializeFilters(filters.packageNameFilters);
  if (pkgParam) params.set(QUERY_PARAM_KEYS.pkg, pkgParam);

  return params;
}

/**
 * Parse URLSearchParams into filter states.
 * Supports legacy ?f= format, new ?appf= base64 format, and plain readable params.
 */
export function searchParamsToFilters(searchParams: URLSearchParams): VulnerabilityFilters {
  // Legacy: full compressed format
  const compressed = searchParams.get(QUERY_PARAM_KEYS.compressed);
  if (compressed) {
    const decompressed = decompressFilters(compressed);
    if (decompressed) return decompressed;
  }

  // New format: appf= is base64, others are readable
  const appEncoded = searchParams.get(QUERY_PARAM_KEYS.app);
  const applicationFilters = appEncoded
    ? decodeFilterList(appEncoded)
    : deserializeFilters(searchParams.get("app")); // fallback for old ?app= links

  return {
    teamFilters: deserializeFilters(searchParams.get(QUERY_PARAM_KEYS.team)),
    applicationFilters,
    environmentFilters: deserializeFilters(searchParams.get(QUERY_PARAM_KEYS.env)),
    cveFilters: deserializeFilters(searchParams.get(QUERY_PARAM_KEYS.cve)),
    packageNameFilters: deserializeFilters(searchParams.get(QUERY_PARAM_KEYS.pkg)),
  };
}
