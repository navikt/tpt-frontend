import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LocaleLayout from "../layout";

const { useParamsMock, usePathnameMock, vulnerabilitiesContext } = vi.hoisted(() => ({
  useParamsMock: vi.fn(),
  usePathnameMock: vi.fn(),
  vulnerabilitiesContext: { isSyncing: false, failedSyncTeams: [] as string[] },
}));

vi.mock("next/navigation", () => ({
  useParams: useParamsMock,
  usePathname: usePathnameMock,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/app/contexts/Providers", () => ({
  Providers: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/app/shared/hooks/useRoleContext", () => ({
  RoleContextProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/app/contexts/VulnerabilitiesContext", () => ({
  useVulnerabilitiesContext: () => vulnerabilitiesContext,
}));

vi.mock("@/app/components/AppHeader", () => ({
  AppHeader: () => null,
}));

vi.mock("@/app/components/FeedbackButton", () => ({
  FeedbackButton: () => null,
}));

vi.mock("@/app/shared/components/CopilotRemediation", () => ({
  CopilotRemediationAlert: () => null,
}));

describe("LocaleLayout development banner", () => {
  beforeEach(() => {
    useParamsMock.mockReturnValue({ locale: "en" });
    usePathnameMock.mockReturnValue("/en/vulnerabilities");
  });

  it.each([
    ["/en/app-1/CVE-2026-1234", { workloadId: "app-1", vulnId: "CVE-2026-1234" }],
    ["/nb/admin/team/team-a/app-1/CVE-2026-1234", {
      teamSlug: "team-a",
      workloadId: "app-1",
      vulnId: "CVE-2026-1234",
    }],
  ])("hides the banner on the CVE detail route %s", (pathname, params) => {
    usePathnameMock.mockReturnValue(pathname);
    useParamsMock.mockReturnValue(params);

    render(<LocaleLayout>Detail content</LocaleLayout>);

    expect(screen.queryByText("banner.underDevelopment")).not.toBeInTheDocument();
    expect(screen.getByText("Detail content")).toBeInTheDocument();
  });

  it("keeps the banner on other pages", () => {
    render(<LocaleLayout>Page content</LocaleLayout>);

    expect(screen.getByText("banner.underDevelopment")).toBeInTheDocument();
  });

  it("keeps the banner hidden on the prioritization page", () => {
    usePathnameMock.mockReturnValue("/en/prioritization");

    render(<LocaleLayout>Page content</LocaleLayout>);

    expect(screen.queryByText("banner.underDevelopment")).not.toBeInTheDocument();
  });

  it.each([
    ["en", "/en/admin"],
    ["nb", "/nb/admin"],
    ["en", "/en/admin/"],
    ["nb", "/nb/admin/team/team-a"],
  ])("hides the banner on the admin route %s %s", (locale, pathname) => {
    useParamsMock.mockReturnValue({ locale });
    usePathnameMock.mockReturnValue(pathname);

    render(<LocaleLayout>Admin content</LocaleLayout>);

    expect(screen.queryByText("banner.underDevelopment")).not.toBeInTheDocument();
    expect(screen.getByText("Admin content")).toBeVisible();
  });

  it.each(["en", "nb"])("hides the full-width banner on the %s start page", (locale) => {
    useParamsMock.mockReturnValue({ locale });
    usePathnameMock.mockReturnValue(`/${locale}`);

    render(<LocaleLayout>Start page content</LocaleLayout>);

    expect(screen.queryByText("banner.underDevelopment")).not.toBeInTheDocument();
    expect(screen.getByText("Start page content")).toBeVisible();
  });
});

describe("LocaleLayout sync failure warning", () => {
  beforeEach(() => {
    useParamsMock.mockReturnValue({ locale: "en" });
    vulnerabilitiesContext.failedSyncTeams = ["team-a"];
  });

  afterEach(() => {
    vulnerabilitiesContext.failedSyncTeams = [];
  });

  it("shows the warning for the user's failed teams", () => {
    usePathnameMock.mockReturnValue("/en/vulnerabilities");

    render(<LocaleLayout>Page content</LocaleLayout>);

    expect(screen.getByText("sync.failed")).toBeInTheDocument();
  });

  it("hides the warning on admin team pages", () => {
    usePathnameMock.mockReturnValue("/en/admin/team/other-team");
    useParamsMock.mockReturnValue({ teamSlug: "other-team" });

    render(<LocaleLayout>Page content</LocaleLayout>);

    expect(screen.queryByText("sync.failed")).not.toBeInTheDocument();
  });
});
