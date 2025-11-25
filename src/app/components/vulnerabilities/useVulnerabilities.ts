import { useState, useEffect, useCallback } from "react";

export const useVulnerabilities = () => {
  const [data, setData] = useState({
    teams: [
      {
        team: "Frontend Team",
        workloads: [
          {
            name: "tpt-frontend",
            ingressTypes: ["internal", "external"],
            vulnerabilities: [
              {
                identifier: "CVE-2023-1234",
                severity: "HIGH",
                suppressed: false,
                hasKevEntry: true,
                epssScore: "0.85",
                epssPercentile: "95.2",
              },
              {
                identifier: "CVE-2023-5678",
                severity: "MEDIUM",
                suppressed: true,
                hasKevEntry: false,
                epssScore: "0.42",
                epssPercentile: "68.7",
              },
            ],
          },
          {
            name: "user-dashboard",
            ingressTypes: ["external"],
            vulnerabilities: [
              {
                identifier: "CVE-2023-9999",
                severity: "CRITICAL",
                suppressed: false,
                hasKevEntry: true,
                epssScore: null,
                epssPercentile: null,
              },
            ],
          },
        ],
      },
      {
        team: "Backend Team",
        workloads: [
          {
            name: "api-gateway",
            ingressTypes: ["internal", "external", "loadbalancer"],
            vulnerabilities: [
              {
                identifier: "CVE-2023-4567",
                severity: "HIGH",
                suppressed: false,
                hasKevEntry: false,
                epssScore: "0.73",
                epssPercentile: "88.1",
              },
              {
                identifier: "CVE-2023-7890",
                severity: "LOW",
                suppressed: true,
                hasKevEntry: false,
                epssScore: "0.12",
                epssPercentile: "23.4",
              },
            ],
          },
          {
            name: "user-service",
            ingressTypes: ["internal"],
            vulnerabilities: [
              {
                identifier: "CVE-2023-2468",
                severity: "MEDIUM",
                suppressed: false,
                hasKevEntry: true,
                epssScore: "0.56",
                epssPercentile: "76.3",
              },
            ],
          },
          {
            name: "notification-service",
            ingressTypes: ["internal"],
            vulnerabilities: [],
          },
        ],
      },
      {
        team: "Platform Team",
        workloads: [
          {
            name: "monitoring-stack",
            ingressTypes: ["internal"],
            vulnerabilities: [
              {
                identifier: "CVE-2023-1357",
                severity: "CRITICAL",
                suppressed: false,
                hasKevEntry: true,
                epssScore: "0.91",
                epssPercentile: "97.8",
              },
              {
                identifier: "CVE-2023-2468",
                severity: "HIGH",
                suppressed: false,
                hasKevEntry: false,
                epssScore: "0.67",
                epssPercentile: "82.5",
              },
              {
                identifier: "CVE-2023-3691",
                severity: "MEDIUM",
                suppressed: true,
                hasKevEntry: false,
                epssScore: null,
                epssPercentile: null,
              },
            ],
          },
          {
            name: "logging-service",
            ingressTypes: ["internal"],
            vulnerabilities: [
              {
                identifier: "CVE-2023-4815",
                severity: "LOW",
                suppressed: false,
                hasKevEntry: false,
                epssScore: "0.08",
                epssPercentile: "15.2",
              },
            ],
          },
        ],
      },
      {
        team: "Data Team",
        workloads: [
          {
            name: "analytics-pipeline",
            ingressTypes: ["internal"],
            vulnerabilities: [
              {
                identifier: "CVE-2023-5927",
                severity: "HIGH",
                suppressed: false,
                hasKevEntry: true,
                epssScore: "0.78",
                epssPercentile: "89.6",
              },
            ],
          },
          {
            name: "data-warehouse",
            ingressTypes: ["internal"],
            vulnerabilities: [],
          },
        ],
      },
    ],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState<string[]>([]);

  useEffect(() => {
    console.log("filters changed", filters);
  }, [filters]);

  const fetchData = useCallback(async () => {
    /*try {
      setIsLoading(true);
      const response = await fetch("/api/applications");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching applications data:", error);
    } finally {
      setIsLoading(false);
    }*/
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    isLoading,
    error,
    filters,
    setFilters,
  };
};
