/**
 * Utility functions for serializing and deserializing vulnerability filters to/from URL query params
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
} as const;

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
 * Convert filter states to URLSearchParams
 */
export function filtersToSearchParams(filters: VulnerabilityFilters): URLSearchParams {
  const params = new URLSearchParams();

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
 * Parse URLSearchParams into filter states
 */
export function searchParamsToFilters(searchParams: URLSearchParams): VulnerabilityFilters {
  return {
    teamFilters: deserializeFilters(searchParams.get(QUERY_PARAM_KEYS.team)),
    applicationFilters: deserializeFilters(searchParams.get(QUERY_PARAM_KEYS.app)),
    environmentFilters: deserializeFilters(searchParams.get(QUERY_PARAM_KEYS.env)),
    cveFilters: deserializeFilters(searchParams.get(QUERY_PARAM_KEYS.cve)),
    packageNameFilters: deserializeFilters(searchParams.get(QUERY_PARAM_KEYS.pkg)),
  };
}
