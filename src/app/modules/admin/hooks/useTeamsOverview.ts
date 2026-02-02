import { useState, useEffect, useCallback } from "react";
import { TeamsOverviewResponse } from "@/app/types/admin";

export function useTeamsOverview() {
  const [data, setData] = useState<TeamsOverviewResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/admin/teams/overview");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch teams overview");
      }

      const responseData: TeamsOverviewResponse = await response.json();
      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    mutate: fetchData,
  };
}
