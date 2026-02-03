import { useState, useEffect } from "react";
import { ApiError, handleApiError } from "@/app/shared/utils/errorHandling";

interface ThresholdConfig {
  thresholds: {
    high: number;
    medium: number;
    low: number;
  };
  deploymentAgeDays?: number;
}

export const useConfig = () => {
  const [config, setConfig] = useState<ThresholdConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
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
      }
    };

    fetchConfig();
  }, []);

  return { config, isLoading, error };
};
