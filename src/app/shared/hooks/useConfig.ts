import { useState, useEffect, useRef } from "react";
import { ApiError, handleApiError } from "@/app/shared/utils/errorHandling";

interface ThresholdConfig {
  thresholds: {
    high: number;
    medium: number;
    low: number;
  };
  deploymentAgeDays?: number;
}

// Global flag to prevent duplicate fetches across all instances (even in Strict Mode)
let globalConfigFetchInProgress = false;
let globalConfigFetchPromise: Promise<void> | null = null;

export const useConfig = () => {
  const [config, setConfig] = useState<ThresholdConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate fetches (especially in React Strict Mode)
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchConfig = async () => {
      // Prevent concurrent fetches globally
      if (globalConfigFetchInProgress) {
        if (globalConfigFetchPromise) {
          await globalConfigFetchPromise;
        }
        return;
      }

      globalConfigFetchInProgress = true;

      const fetchPromise = (async () => {
        try {
          setError(null);
          const response = await fetch("/api/config");
          if (response.ok) {
            const data = await response.json();
            setConfig(data);
          } else {
            const errorData = await response.json().catch(() => ({}));
            const apiError: ApiError = {
              message: errorData.error || "errors.fetchConfigError",
              status: response.status,
            };
            setError(apiError);
          }
        } catch (err) {
          const apiError = handleApiError(err, "useConfig.fetchConfig");
          setError(apiError);
        } finally {
          setIsLoading(false);
          globalConfigFetchInProgress = false;
          globalConfigFetchPromise = null;
        }
      })();

      globalConfigFetchPromise = fetchPromise;
      await fetchPromise;
    };

    fetchConfig();
  }, []);

  return { config, isLoading, error };
};
