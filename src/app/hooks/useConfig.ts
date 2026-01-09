import { useState, useEffect } from "react";

interface ThresholdConfig {
  thresholds: {
    high: number;
    medium: number;
    low: number;
  };
}

export const useConfig = () => {
  const [config, setConfig] = useState<ThresholdConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/config");
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, isLoading };
};
