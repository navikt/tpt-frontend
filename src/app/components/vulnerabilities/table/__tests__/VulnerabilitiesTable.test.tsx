import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { VulnerabilitiesResponse } from "@/app/shared/types/vulnerabilities";
import VulnerabilitiesTable from "../VulnerabilitiesTable";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const filters = {
  teamFilters: {},
  applicationFilters: {},
  environmentFilters: {},
  cveFilters: {},
  packageNameFilters: {},
};

function renderTable(repository?: string) {
  const data: VulnerabilitiesResponse = {
    teams: [{
      team: "example-team",
      workloads: [{
        id: "workload-1",
        name: "example-app",
        environment: "prod-gcp",
        repository,
        vulnerabilities: [{
          identifier: "CVE-2026-1234",
          packageName: "example-package",
          riskScore: 80,
        }],
      }],
    }],
  };

  return render(<VulnerabilitiesTable data={data} {...filters} />);
}

describe("VulnerabilitiesTable application links", () => {
  it("links the application name to its deployment repository", () => {
    renderTable("example-org/deployment-source");

    const link = screen.getByRole("link", { name: "example-app" });
    expect(link).toHaveAttribute("href", "https://github.com/example-org/deployment-source");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "vulnerabilitiesTable.details" }))
      .toHaveAttribute("href", "/workload-1/CVE-2026-1234");
  });

  it.each([undefined, ""])("keeps the application name as text without a repository (%s)", (repository) => {
    renderTable(repository);

    expect(screen.getByRole("cell", { name: "example-app" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "example-app" })).not.toBeInTheDocument();
  });
});
