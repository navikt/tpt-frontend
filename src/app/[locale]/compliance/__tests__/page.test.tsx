import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockSecurityStatusPayload } from "@/app/mocks/mockPayloads";
import type { TeamSecurityStatus } from "@/app/types/securityStatus";
import CompliancePage from "../page";

const { useSecurityStatusMock, useRoleContextMock } = vi.hoisted(() => ({
  useSecurityStatusMock: vi.fn(),
  useRoleContextMock: vi.fn(),
}));

vi.mock("@/app/shared/hooks/useSecurityStatus", () => ({
  useSecurityStatus: useSecurityStatusMock,
}));

vi.mock("@/app/shared/hooks/useRoleContext", () => ({
  useRoleContext: useRoleContextMock,
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string, params?: Record<string, unknown>) =>
    `${namespace ? `${namespace}.` : ""}${key}${params ? ` ${Object.entries(params).map(([k, v]) => `${k}=${v}`).join(" ")}` : ""}`,
  useLocale: () => "en",
}));

function team(team: string, applicationCount: number): TeamSecurityStatus {
  return {
    team,
    applicationCount,
    level: null,
    history: [],
    exposed: { status: "green", appsPastDeadline: [] },
    trend: { status: "green", direction: "stable", appsWithOverduePerMonth: [] },
    maintenance: {
      status: "green",
      upToDate: applicationCount,
      total: applicationCount,
      overdueRebuild: [],
    },
  };
}

function setTeams(teams: TeamSecurityStatus[]) {
  useSecurityStatusMock.mockReturnValue({
    data: { ...mockSecurityStatusPayload, teams },
    isLoading: false,
    error: null,
  });
}

describe("CompliancePage", () => {
  beforeEach(() => {
    useRoleContextMock.mockReturnValue({
      effectiveRole: "PRODUCT_LEADER",
      isInitialized: true,
      isLoading: false,
    });
  });

  it.each([
    ["DEVELOPER", "developerSubtitle"],
    ["TEAM_MEMBER", "developerSubtitle"],
    ["TEAM_LEADER", "areaSubtitle"],
    ["PRODUCT_LEADER", "sectionSubtitle"],
  ])("excludes empty teams from the %s view and its summary", (effectiveRole, subtitle) => {
    useRoleContextMock.mockReturnValue({
      effectiveRole,
      isInitialized: true,
      isLoading: false,
    });
    setTeams([
      team("empty-team", 0),
      ...Array.from({ length: 4 }, (_, index) => team(`active-team-${index}`, 1)),
    ]);

    render(<CompliancePage />);

    expect(screen.queryByText("empty-team")).not.toBeInTheDocument();
    for (let index = 0; index < 4; index++) {
      expect(screen.getByText(`active-team-${index}`)).toBeInTheDocument();
    }
    expect(screen.getByText(`compliance.${subtitle} teams=4 apps=4`)).toBeInTheDocument();
  });

  it("chooses the smaller leader view based on teams with applications", () => {
    setTeams([
      team("empty-team", 0),
      team("active-team-1", 1),
      team("active-team-2", 2),
      team("active-team-3", 3),
    ]);

    render(<CompliancePage />);

    expect(screen.getByText("compliance.areaSubtitle teams=3 apps=6")).toBeInTheDocument();
    expect(screen.queryByText("empty-team")).not.toBeInTheDocument();
  });

  it("shows the existing empty state when all teams have zero applications", () => {
    setTeams([team("empty-team", 0)]);

    render(<CompliancePage />);

    expect(screen.getByText("noTeamView.title")).toBeInTheDocument();
    expect(screen.queryByText("empty-team")).not.toBeInTheDocument();
  });
});
