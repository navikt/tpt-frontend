/**
 * Get the backend cache revalidation time in seconds from environment variable.
 * Defaults to 5 minutes (300 seconds) if not configured.
 */
export function getBackendCacheTime(): number {
  const envValue = process.env.BACKEND_CACHE_SECONDS;
  
  if (!envValue) {
    return 300; // 5 minutes default
  }
  
  const parsed = parseInt(envValue, 10);
  
  if (isNaN(parsed) || parsed < 0) {
    console.warn(
      `Invalid BACKEND_CACHE_SECONDS value: "${envValue}". Using default 300 seconds.`
    );
    return 300;
  }
  
  return parsed;
}
