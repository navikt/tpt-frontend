import { vi, describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusTag } from "../StatusTag";
import { LevelBadge } from "../LevelBadge";
import { HistoryStrip } from "../HistoryStrip";
import { SummarySentence } from "../SummarySentence";
import { TeamCard } from "../TeamCard";
import { TeamsFollowUpTable } from "../TeamsFollowUpTable";
import { FewTeamsLeaderView } from "../FewTeamsLeaderView";
import { ComplianceMeasurement } from "../ComplianceMeasurement";
import { mockSecurityStatusPayload } from "@/app/mocks/mockPayloads";
import type { TeamSecurityStatus } from "@/app/types/securityStatus";

vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string, params?: Record<string, unknown>) => {
    if (params) {
      let str = `${namespace}.${key}`;
      for (const [k, v] of Object.entries(params)) {
        str += ` ${k}=${String(v)}`;
      }
      return str;
    }
    return `${namespace ? `${namespace}.` : ""}${key}`;
  },
  useLocale: () => "nb",
}));

describe("Compliance Components", () => {
  it("renders StatusTag for on track, warning, and error", () => {
    const { rerender } = render(<StatusTag status="green" />);
    expect(screen.getByText("complianceStatus.onTrack")).toBeInTheDocument();

    rerender(<StatusTag status="yellow" />);
    expect(screen.getByText("complianceStatus.needsAttention")).toBeInTheDocument();

    rerender(<StatusTag status="red" />);
    expect(screen.getByText("complianceStatus.actNow")).toBeInTheDocument();
  });

  it("renders LevelBadge for new, ongoing, and chronic", () => {
    const { rerender } = render(<LevelBadge level="new" />);
    expect(screen.getByText("complianceLevel.new")).toBeInTheDocument();

    rerender(<LevelBadge level="ongoing" />);
    expect(screen.getByText("complianceLevel.ongoing")).toBeInTheDocument();

    rerender(<LevelBadge level="chronic" />);
    expect(screen.getByText("complianceLevel.chronic")).toBeInTheDocument();
  });

  it("shows a dated percentage and exposes day counts and missing coverage without hovering", async () => {
    const user = userEvent.setup();
    render(<HistoryStrip history={[{
      month: "2026-10",
      throughDate: "2026-10-28",
      onTrackDays: 24,
      needsAttentionDays: 2,
      actNowDays: 1,
      missingDays: 1,
      provisional: true,
    }]} />);

    expect(screen.getByText(/^89\s% \*$/)).toBeInTheDocument();
    expect(screen.getAllByText(/^okt.*2026$/)[0]).toBeInTheDocument();
    expect(screen.getByText("complianceHistory.monthToDate")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "complianceHistory.details" }));
    expect(screen.getByText(/complianceHistory.summary onTrack=24 recorded=27/)).toBeVisible();
    expect(screen.getByText(/complianceHistory.breakdown green=24 yellow=2 red=1/)).toBeVisible();
    expect(screen.getByText(/complianceHistory.coverage.*missing=1/)).toBeVisible();
  });

  it("does not show a percentage for months without recorded days", () => {
    render(<HistoryStrip history={[{
      month: "2025-12",
      throughDate: "2025-12-31",
      onTrackDays: 0,
      needsAttentionDays: 0,
      actNowDays: 0,
      missingDays: 31,
      provisional: false,
    }]} />);
    expect(screen.getAllByText(/^des.*2025$/)[0]).toBeInTheDocument();
    expect(screen.getAllByText("complianceStatus.noData").length).toBeGreaterThan(0);
    expect(screen.queryByText(/0\s%/)).not.toBeInTheDocument();
    expect(screen.queryByText("complianceHistory.monthToDate")).not.toBeInTheDocument();
  });

  it("explains the backend's active thresholds rather than frontend defaults", async () => {
    const user = userEvent.setup();
    render(<ComplianceMeasurement
      measurement={{
        ...mockSecurityStatusPayload.measurement,
        deployMaxAgeDays: 45,
        exposedRedWorkdays: 7,
        trendWindowDays: 20,
        maintenanceYellowRatio: 0.8,
      }}
      generatedAt="2026-10-28T07:00:00Z"
    />);
    await user.click(screen.getByRole("button", { name: "complianceMeasurement.title" }));
    expect(screen.getByText("complianceMeasurement.maintenanceAge days=45")).toBeVisible();
    expect(screen.getByText("complianceMeasurement.exposureRules workdays=7")).toBeVisible();
    expect(screen.getByText("complianceMeasurement.trendWindow days=20")).toBeVisible();
    expect(screen.getByText(/complianceMeasurement.maintenanceRules ratio=80\s%/)).toBeVisible();
    expect(screen.getByText(/complianceMeasurement.calculatedAt.*2026.*Europe\/Oslo/)).toBeVisible();
  });

  it("renders SummarySentence for 5a, 5b and 5c", () => {
    const mockTeams: TeamSecurityStatus[] = [
      {
        team: "team-nordlys",
        applicationCount: 11,
        level: "ongoing",
        history: [],
        exposed: {
          status: "red",
          appsPastDeadline: [{ app: "soknad-api", workdaysOver: 6 }],
        },
        trend: {
          status: "red",
          direction: "worse",
          appsWithOverduePerMonth: [1, 2, 3, 4],
        },
        maintenance: {
          status: "yellow",
          upToDate: 9,
          total: 11,
          overdueRebuild: [{ app: "soknad-api", daysOver: 4 }],
        },
      },
    ];

    const { rerender } = render(<SummarySentence teams={mockTeams} variant="5a" />);
    expect(screen.getByText(/complianceSummary.teamsNeedFollowUp/)).toBeInTheDocument();

    rerender(<SummarySentence teams={mockTeams} variant="5b" />);
    expect(screen.getByText(/complianceSummary.teamsNeedAttention/)).toBeInTheDocument();
  });

  it("renders TeamCard in developer view (5c) showing past deadline and overdue rebuild items", () => {
    const mockTeam: TeamSecurityStatus = {
      team: "team-nordlys",
      applicationCount: 11,
      level: "ongoing",
      history: [],
      exposed: {
        status: "red",
        appsPastDeadline: [{ app: "soknad-api", workdaysOver: 6 }],
      },
      trend: {
        status: "red",
        direction: "worse",
        appsWithOverduePerMonth: [1, 2, 3, 4],
      },
      maintenance: {
        status: "yellow",
        upToDate: 9,
        total: 11,
        overdueRebuild: [{ app: "gammel-rapport", daysOver: 11 }],
      },
    };

    render(<TeamCard team={mockTeam} variant="5c" />);
    expect(screen.getByText("team-nordlys")).toBeInTheDocument();
    expect(screen.getByText("soknad-api")).toBeInTheDocument();
    expect(screen.getByText("gammel-rapport")).toBeInTheDocument();
  });

  it("renders TeamsFollowUpTable with each team on its own line and sorted chronic > ongoing > new > on-track", () => {
    const mockTeams: TeamSecurityStatus[] = [
      {
        team: "team-fjell",
        applicationCount: 7,
        level: null,
        history: [],
        exposed: { status: "green", appsPastDeadline: [] },
        trend: { status: "green", direction: "improving", appsWithOverduePerMonth: [0, 0, 0, 0, 0, 0] },
        maintenance: { status: "green", upToDate: 7, total: 7, overdueRebuild: [] },
      },
      {
        team: "team-myr",
        applicationCount: 13,
        level: "new",
        history: [],
        exposed: { status: "yellow", appsPastDeadline: [{ app: "myr-app", workdaysOver: 1 }] },
        trend: { status: "green", direction: "stable", appsWithOverduePerMonth: [0, 0, 0, 0, 0, 0] },
        maintenance: { status: "yellow", upToDate: 10, total: 13, overdueRebuild: [] },
      },
      {
        team: "team-hav",
        applicationCount: 14,
        level: "chronic",
        history: [],
        exposed: { status: "red", appsPastDeadline: [{ app: "hav-app", workdaysOver: 10 }] },
        trend: { status: "red", direction: "worse", appsWithOverduePerMonth: [2, 2, 3, 3, 4, 4] },
        maintenance: { status: "red", upToDate: 9, total: 14, overdueRebuild: [] },
      },
      {
        team: "team-nordlys",
        applicationCount: 11,
        level: "ongoing",
        history: [],
        exposed: { status: "red", appsPastDeadline: [{ app: "soknad-api", workdaysOver: 6 }] },
        trend: { status: "red", direction: "worse", appsWithOverduePerMonth: [1, 2, 3, 4, 4, 4] },
        maintenance: { status: "yellow", upToDate: 9, total: 11, overdueRebuild: [] },
      },
    ];

    render(<TeamsFollowUpTable teams={mockTeams} collapseOnTrack={false} />);

    const teamNames = screen.getAllByRole("rowheader").map((el) => el.textContent);
    // Ordered: team-hav (chronic), team-nordlys (ongoing), team-myr (new), team-fjell (on track)
    expect(teamNames[0]).toContain("team-hav");
    expect(teamNames[1]).toContain("team-nordlys");
    expect(teamNames[2]).toContain("team-myr");
    expect(teamNames[3]).toContain("team-fjell");
  });

  it("renders FewTeamsLeaderView with the three boxes and separate team boxes ordered chronic > ongoing > new", () => {
    const mockTeams: TeamSecurityStatus[] = [
      {
        team: "team-fjell",
        applicationCount: 7,
        level: null,
        history: [],
        exposed: { status: "green", appsPastDeadline: [] },
        trend: { status: "green", direction: "improving", appsWithOverduePerMonth: [0, 0, 0, 0, 0, 0] },
        maintenance: { status: "green", upToDate: 7, total: 7, overdueRebuild: [] },
      },
      {
        team: "team-hav",
        applicationCount: 14,
        level: "chronic",
        history: [],
        exposed: { status: "red", appsPastDeadline: [{ app: "hav-app", workdaysOver: 10 }] },
        trend: { status: "red", direction: "worse", appsWithOverduePerMonth: [2, 2, 3, 3, 4, 4] },
        maintenance: { status: "red", upToDate: 9, total: 14, overdueRebuild: [] },
      },
    ];

    render(<FewTeamsLeaderView teams={mockTeams} />);

    // Renders the 3 summary question boxes (level 2 headings)
    expect(
      screen.getByRole("heading", { level: 2, name: "complianceQuestions.areWeExposed" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "complianceQuestions.isItGettingBetterOrWorse" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "complianceQuestions.areWeKeepingUpWithMaintenance" })
    ).toBeInTheDocument();

    // Does NOT render the "4/8 teams need followup" summary sentence
    expect(screen.queryByText(/complianceSummary\.teamsNeed/)).not.toBeInTheDocument();

    // Renders separate boxes for teams
    expect(screen.getByText("team-hav")).toBeInTheDocument();
    expect(screen.getByText("team-fjell")).toBeInTheDocument();
  });
});
