import { vi, describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusTag } from "../StatusTag";
import { LevelBadge } from "../LevelBadge";
import { HistoryStrip } from "../HistoryStrip";
import { SummarySentence } from "../SummarySentence";
import { TeamCard } from "../TeamCard";
import { TeamsFollowUpTable } from "../TeamsFollowUpTable";
import { FewTeamsLeaderView } from "../FewTeamsLeaderView";
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

    rerender(<StatusTag status="yellow" since="2026-05-01T00:00:00Z" />);
    expect(screen.getByText("complianceStatus.needsAttention")).toBeInTheDocument();

    rerender(<StatusTag status="red" since="2026-10-01T00:00:00Z" />);
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

  it("renders HistoryStrip with 6 squares", () => {
    render(<HistoryStrip history={["green", "green", "green", "yellow", "red", "red"]} showInitials showCaption />);
    expect(screen.getByText("compliance.last6Months")).toBeInTheDocument();
  });

  it("renders SummarySentence for 5a, 5b and 5c", () => {
    const mockTeams: TeamSecurityStatus[] = [
      {
        team: "team-nordlys",
        applicationCount: 11,
        level: "ongoing",
        history: ["green", "green", "green", "green", "yellow", "red"],
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
      history: ["green", "green", "green", "green", "yellow", "red"],
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
        history: ["green", "green", "green", "green", "green", "green"],
        exposed: { status: "green", appsPastDeadline: [] },
        trend: { status: "green", direction: "improving", appsWithOverduePerMonth: [0, 0, 0, 0, 0, 0] },
        maintenance: { status: "green", upToDate: 7, total: 7, overdueRebuild: [] },
      },
      {
        team: "team-myr",
        applicationCount: 13,
        level: "new",
        history: ["green", "green", "green", "green", "green", "yellow"],
        exposed: { status: "yellow", appsPastDeadline: [{ app: "myr-app", workdaysOver: 1 }] },
        trend: { status: "green", direction: "stable", appsWithOverduePerMonth: [0, 0, 0, 0, 0, 0] },
        maintenance: { status: "yellow", upToDate: 10, total: 13, overdueRebuild: [] },
      },
      {
        team: "team-hav",
        applicationCount: 14,
        level: "chronic",
        history: ["red", "red", "red", "red", "red", "red"],
        exposed: { status: "red", appsPastDeadline: [{ app: "hav-app", workdaysOver: 10 }] },
        trend: { status: "red", direction: "worse", appsWithOverduePerMonth: [2, 2, 3, 3, 4, 4] },
        maintenance: { status: "red", upToDate: 9, total: 14, overdueRebuild: [] },
      },
      {
        team: "team-nordlys",
        applicationCount: 11,
        level: "ongoing",
        history: ["green", "green", "green", "green", "yellow", "red"],
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
        history: ["green", "green", "green", "green", "green", "green"],
        exposed: { status: "green", appsPastDeadline: [] },
        trend: { status: "green", direction: "improving", appsWithOverduePerMonth: [0, 0, 0, 0, 0, 0] },
        maintenance: { status: "green", upToDate: 7, total: 7, overdueRebuild: [] },
      },
      {
        team: "team-hav",
        applicationCount: 14,
        level: "chronic",
        history: ["red", "red", "red", "red", "red", "red"],
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
