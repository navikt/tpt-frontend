/**
 * Utility functions for serializing and deserializing vulnerability filters to/from URL query params
 * Supports hybrid mode: readable params for small filters, base64 compression for large ones
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
  app: "app",
  env: "env",
  cve: "cve",
  pkg: "pkg",
  compressed: "f", // Single compressed filter param
} as const;

/**
 * Decompress base64 string to filters
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
 * Serialize filter state to comma-separated string
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
 * Convert filter states to URLSearchParams (hybrid mode)
 */
export function filtersToSearchParams(filters: VulnerabilityFilters): URLSearchParams {
  const params = new URLSearchParams();

  // Build readable params first
  const teamParam = serializeFilters(filters.teamFilters);
  if (teamParam) params.set(QUERY_PARAM_KEYS.team, teamParam);

  const appParam = serializeFilters(filters.applicationFilters);
  if (appParam) params.set(QUERY_PARAM_KEYS.app, appParam);

  const envParam = serializeFilters(filters.environmentFilters);
  if (envParam) params.set(QUERY_PARAM_KEYS.env, envParam);

  const cveParam = serializeFilters(filters.cveFilters);
  if (cveParam) params.set(QUERY_PARAM_KEYS.cve, cveParam);

  const pkgParam = serializeFilters(filters.packageNameFilters);
  if (pkgParam) params.set(QUERY_PARAM_KEYS.pkg, pkgParam);

  return params;
}

/**
 * Parse URLSearchParams into filter states (supports both formats)
 */
export function searchParamsToFilters(searchParams: URLSearchParams): VulnerabilityFilters {
  // Check for compressed format first
  const compressed = searchParams.get(QUERY_PARAM_KEYS.compressed);
  if (compressed) {
    const decompressed = decompressFilters(compressed);
    if (decompressed) {
      return decompressed;
    }
  }

  // Fall back to readable format
  return {
    teamFilters: deserializeFilters(searchParams.get(QUERY_PARAM_KEYS.team)),
    applicationFilters: deserializeFilters(searchParams.get(QUERY_PARAM_KEYS.app)),
    environmentFilters: deserializeFilters(searchParams.get(QUERY_PARAM_KEYS.env)),
    cveFilters: deserializeFilters(searchParams.get(QUERY_PARAM_KEYS.cve)),
    packageNameFilters: deserializeFilters(searchParams.get(QUERY_PARAM_KEYS.pkg)),
  };
}
