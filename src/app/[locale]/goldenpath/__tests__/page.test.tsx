import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CheckResult } from "@/app/modules/goldenpath/useCheckResults";
import GoldenPathPage from "../page";

const { useCheckResultsMock, useVulnerabilitiesContextMock } = vi.hoisted(() => ({
  useCheckResultsMock: vi.fn(),
  useVulnerabilitiesContextMock: vi.fn(),
}));

vi.mock("@/app/modules/goldenpath/useCheckResults", () => ({
  useCheckResults: useCheckResultsMock,
}));

vi.mock("@/app/contexts/VulnerabilitiesContext", () => ({
  useVulnerabilitiesContext: useVulnerabilitiesContextMock,
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string, params?: Record<string, unknown>) =>
    `${namespace ? `${namespace}.` : ""}${key}${params ? ` ${Object.values(params).join(" ")}` : ""}`,
  useLocale: () => "en",
}));

const check = (
  type: CheckResult["type"],
  name: string,
  severity: CheckResult["severity"],
  reasons?: string[],
): CheckResult => ({
  type,
  name,
  desc: `${name} description`,
  severity,
  whenChecked: "2026-10-19T08:00:00Z",
  ...(reasons ? { reasons } : {}),
});

describe("GoldenPathPage", () => {
  beforeEach(() => {
    useVulnerabilitiesContextMock.mockReturnValue({
      data: { teams: [] },
      teamFilters: {},
      applicationFilters: {},
    });
    useCheckResultsMock.mockReturnValue({
      isLoading: false,
      hasError: false,
      checkResults: [
        {
          name: "navikt/high-repo",
          owners: ["team-a"],
          good: [],
          bad: [check("NeedsWork", "high-check", "HIGH", ["High risk reason"])],
        },
        {
          name: "navikt/medium-repo",
          owners: ["team-b"],
          good: [check("AllGood", "good-check", "LOW")],
          bad: [check("NeedsWork", "medium-check", "MEDIUM", ["Missing branch protection"])],
        },
        {
          name: "example-org/healthy-demo",
          owners: ["team-a"],
          good: [check("AllGood", "passing-check", "HIGH")],
          bad: [],
        },
        {
          name: "example-org/no-results",
          owners: ["team-a"],
          good: [],
          bad: [],
        },
      ],
    });
  });

  it("only shows repositories owned by teams selected in the work context filter", () => {
    useVulnerabilitiesContextMock.mockReturnValue({
      data: { teams: [] },
      teamFilters: { "team-b": true },
      applicationFilters: {},
    });

    render(<GoldenPathPage />);

    expect(screen.queryByText("navikt/high-repo")).not.toBeInTheDocument();
    expect(screen.getByText("navikt/medium-repo")).toBeInTheDocument();
  });

  it("filters repository results by severity", () => {
    render(<GoldenPathPage />);

    expect(screen.getByText("navikt/high-repo")).toBeInTheDocument();
    expect(screen.getByText("navikt/medium-repo")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "goldenpath.severity.high" }));

    expect(screen.queryByText("navikt/high-repo")).not.toBeInTheDocument();
    expect(screen.getByText("navikt/medium-repo")).toBeInTheDocument();
  });

  it("searches check reasons as well as repository names", () => {
    render(<GoldenPathPage />);

    fireEvent.change(screen.getByPlaceholderText("goldenpath.search"), {
      target: { value: "Missing branch protection" },
    });

    expect(screen.queryByText("navikt/high-repo")).not.toBeInTheDocument();
    expect(screen.getByText("navikt/medium-repo")).toBeInTheDocument();
  });

  it("shows the check title without repeating its internal check name", () => {
    render(<GoldenPathPage />);

    expect(screen.getByText("high-check description")).toBeInTheDocument();
    expect(screen.queryByText("high-check", { exact: true })).not.toBeInTheDocument();
  });

  it("searches repositories by their GitHub owner and name", () => {
    render(<GoldenPathPage />);

    fireEvent.change(screen.getByPlaceholderText("goldenpath.search"), {
      target: { value: "NAVIKT/high-repo" },
    });

    expect(screen.getByText("navikt/high-repo")).toBeInTheDocument();
    expect(screen.queryByText("navikt/medium-repo")).not.toBeInTheDocument();
  });

  it("sorts repositories by their GitHub name instead of their owning team", () => {
    useCheckResultsMock.mockReturnValue({
      isLoading: false,
      hasError: false,
      checkResults: [
        { name: "z-org/repo", owners: ["a-team"], good: [], bad: [check("NeedsWork", "z-check", "HIGH")] },
        { name: "a-org/repo", owners: ["z-team"], good: [], bad: [check("NeedsWork", "a-check", "HIGH")] },
      ],
    });
    render(<GoldenPathPage />);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "repository" },
    });

    const headings = screen.getAllByRole("button", { name: /-org\/repo/ });
    expect(headings[0]).toHaveTextContent("a-org/repo");
    expect(headings[1]).toHaveTextContent("z-org/repo");
  });

  it.each([
    ["high-repo", "navikt/high-repo"],
    ["example-org/high-repo", "example-org/high-repo"],
  ])("uses the same qualified name for the heading and link for %s", (name, qualifiedName) => {
    useCheckResultsMock.mockReturnValue({
      isLoading: false,
      hasError: false,
      checkResults: [
        { name, owners: ["team-a"], good: [], bad: [check("NeedsWork", "high-check", "HIGH")] },
      ],
    });
    render(<GoldenPathPage />);

    fireEvent.click(screen.getByRole("button", { name: new RegExp(qualifiedName) }));

    expect(screen.getByText(qualifiedName)).toBeVisible();
    expect(screen.getByRole("link", {
      name: `goldenpath.openRepository ${qualifiedName}`,
    })).toHaveAttribute("href", `https://github.com/${qualifiedName}`);
    expect(screen.queryByText("team-a/high-repo")).not.toBeInTheDocument();
  });

  it("expands passing-only repositories and shows passing checks without severity warnings", () => {
    render(<GoldenPathPage />);

    const passingSection = screen.getByRole("region", { name: "goldenpath.noChecksNeedWorkSection 1" });
    const sectionToggle = within(passingSection).getByRole("button", { name: "Vis mer" });
    expect(sectionToggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(sectionToggle);
    expect(sectionToggle).toHaveAttribute("aria-expanded", "true");

    const repositoryToggle = screen.getByRole("button", { name: /example-org\/healthy-demo/ });
    expect(repositoryToggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(repositoryToggle);

    expect(screen.getByText("passing-check description")).toBeVisible();
    expect(screen.getByText("goldenpath.passing")).toBeVisible();
    expect(within(passingSection).queryByText("goldenpath.severity.high")).not.toBeInTheDocument();
    expect(within(passingSection).getByText(/goldenpath.checked/)).toBeVisible();
    expect(within(passingSection).getByRole("link", {
      name: "goldenpath.openRepository example-org/healthy-demo",
    })).toHaveAttribute(
      "href", "https://github.com/example-org/healthy-demo",
    );
    expect(screen.queryByText("example-org/no-results")).not.toBeInTheDocument();
    expect(screen.queryByText("good-check description")).not.toBeInTheDocument();
  });

  it("does not move failing repositories into the passing section when severity filters hide failures", () => {
    render(<GoldenPathPage />);

    fireEvent.click(screen.getByRole("button", { name: "goldenpath.severity.high" }));
    fireEvent.click(screen.getByRole("button", { name: "goldenpath.severity.medium" }));
    const passingSection = screen.getByRole("region", { name: "goldenpath.noChecksNeedWorkSection 1" });
    fireEvent.click(within(passingSection).getByRole("button", { name: "Vis mer" }));

    expect(screen.queryByText("navikt/high-repo")).not.toBeInTheDocument();
    expect(screen.queryByText("navikt/medium-repo")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /example-org\/healthy-demo/ })).toBeVisible();
  });
});
