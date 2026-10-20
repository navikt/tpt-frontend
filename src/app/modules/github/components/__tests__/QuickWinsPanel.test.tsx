import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { QuickWinsPanel } from "../QuickWinsPanel";
import type { RepositoryMetrics } from "../../hooks/useRepositoryMetrics";

vi.mock("next-intl", () => ({
  useTranslations:
    () => (key: string, values?: Record<string, string | number>) => {
      if (key === "sortedByRisk")
        return `Showing ${values?.shown} of ${values?.total}`;
      if (key === "riskScore") return "Risk score";
      if (key === "fixesOne") return "Fixes 1 vulnerability";
      if (key === "fixesMany") return `Fixes ${values?.count} vulnerabilities`;
      if (key === "openPr") return `Open PR #${values?.number}`;
      if (key === "openPrGeneric") return "Open PR";
      return key;
    },
}));

function repository(
  vulnerabilities: RepositoryMetrics["vulnerabilities"]
): RepositoryMetrics {
  return {
    nameWithOwner: "navikt/example",
    team: "team-a",
    vulnerabilities,
    aggregateRiskScore: 0,
    vulnerabilityCount: vulnerabilities.length,
    highPriorityCount: 0,
    mediumPriorityCount: 0,
    lowPriorityCount: 0,
    fixesReadyCount: vulnerabilities.length,
    riskLevel: "none",
  };
}

describe("QuickWinsPanel", () => {
  it("groups vulnerabilities by PR and counts distinct vulnerability identifiers", () => {
    const pullRequestUrl = "https://github.com/navikt/example/pull/42";

    render(
      <QuickWinsPanel
        repositories={[
          repository([
            {
              identifier: "CVE-2025-0001",
              packageName: "pkg:npm/example@1.0.0",
              riskScore: 60,
              dependabotUpdatePullRequestUrl: pullRequestUrl,
            },
            {
              identifier: "CVE-2025-0002",
              packageName: "pkg:npm/another@1.0.0",
              riskScore: 80,
              dependabotUpdatePullRequestUrl: pullRequestUrl,
            },
            {
              identifier: "CVE-2025-0001",
              packageName: "pkg:npm/example@1.0.0",
              riskScore: 60,
              dependabotUpdatePullRequestUrl: pullRequestUrl,
            },
            {
              identifier: "CVE-2025-0003",
              packageName: "pkg:npm/another@1.0.0",
              riskScore: 40,
              dependabotUpdatePullRequestUrl:
                "https://github.com/navikt/example/pull/43",
            },
          ]),
        ]}
      />
    );

    expect(screen.getByText("example, another")).toBeInTheDocument();
    expect(screen.getByText("Fixes 2 vulnerabilities")).toBeInTheDocument();
    expect(screen.getByText("Fixes 1 vulnerability")).toBeInTheDocument();
    expect(screen.getByText("Showing 2 of 2")).toBeInTheDocument();
    expect(screen.getAllByText("Risk score")).toHaveLength(2);
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Open PR #42" })).toHaveLength(
      1
    );
  });
});
