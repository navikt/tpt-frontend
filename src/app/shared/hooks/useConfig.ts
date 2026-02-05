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

// Global state to share config across all instances
let globalConfigFetchInProgress = false;
let globalConfigFetchPromise: Promise<ThresholdConfig | null> | null = null;
let globalConfigData: ThresholdConfig | null = null;

// Export reset function for tests
export const __resetConfigState = () => {
  globalConfigFetchInProgress = false;
  globalConfigFetchPromise = null;
  globalConfigData = null;
};

export const useConfig = () => {
  const [config, setConfig] = useState<ThresholdConfig | null>(() => globalConfigData);
  const [isLoading, setIsLoading] = useState(!globalConfigData);
  const [error, setError] = useState<ApiError | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate fetches (especially in React Strict Mode)
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchConfig = async () => {
      // If fetch is already in progress, wait for it
      if (globalConfigFetchInProgress) {
        if (!globalConfigData) {
          setIsLoading(true);
        }
        if (globalConfigFetchPromise) {
          const result = await globalConfigFetchPromise;
          if (result) {
            setConfig(result);
          }
        }
        setIsLoading(false);
        return;
      }

      globalConfigFetchInProgress = true;

      const fetchPromise = (async (): Promise<ThresholdConfig | null> => {
        try {
          setError(null);
          const response = await fetch("/api/config");
          if (response.ok) {
            const data = await response.json();
            globalConfigData = data;
            setConfig(data);
            return data;
          } else {
            const errorData = await response.json().catch(() => ({}));
            
            // Check if response contains Problem Details or our error format
            const apiError: ApiError = errorData.type || errorData.title || errorData.detail
              ? {
                  message: errorData.title || "errors.fetchConfigError",
                  status: response.status,
                  details: errorData.detail,
                  isReportable: errorData.isReportable ?? (response.status >= 500),
                  problemDetails: errorData,
                }
              : {
                  message: errorData.error || "errors.fetchConfigError",
                  status: response.status,
                  details: errorData.details,
                  isReportable: errorData.isReportable ?? (response.status >= 500),
                };
            
            setError(apiError);
            return null;
          }
        } catch (err) {
          const apiError = handleApiError(err, "useConfig.fetchConfig");
          setError(apiError);
          return null;
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
