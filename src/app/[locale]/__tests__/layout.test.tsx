import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LocaleLayout from "../layout";

const { useParamsMock, usePathnameMock } = vi.hoisted(() => ({
  useParamsMock: vi.fn(),
  usePathnameMock: vi.fn(),
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
  useVulnerabilitiesContext: () => ({ isSyncing: false }),
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
});
