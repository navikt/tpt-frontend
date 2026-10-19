import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CheckResult } from "@/app/modules/goldenpath/useCheckResults";
import GoldenPathPage from "../page";

const { useCheckResultsMock } = vi.hoisted(() => ({
  useCheckResultsMock: vi.fn(),
}));

vi.mock("@/app/modules/goldenpath/useCheckResults", () => ({
  useCheckResults: useCheckResultsMock,
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
    useCheckResultsMock.mockReturnValue({
      isLoading: false,
      hasError: false,
      checkResults: [
        {
          name: "navikt/high-repo",
          good: [],
          bad: [check("NeedsWork", "high-check", "HIGH", ["High risk reason"])],
        },
        {
          name: "navikt/medium-repo",
          good: [check("AllGood", "good-check", "LOW")],
          bad: [check("NeedsWork", "medium-check", "MEDIUM", ["Missing branch protection"])],
        },
        {
          name: "example-org/healthy-demo",
          good: [check("AllGood", "passing-check", "HIGH")],
          bad: [],
        },
        {
          name: "example-org/no-results",
          good: [],
          bad: [],
        },
      ],
    });
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
    expect(within(passingSection).getByRole("link")).toHaveAttribute(
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
