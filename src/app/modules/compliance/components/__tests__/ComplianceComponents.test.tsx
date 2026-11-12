import { vi, describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusTag } from "../StatusTag";
import { LevelBadge } from "../LevelBadge";
import { LevelLegend } from "../LevelLegend";
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
  it("keeps term descriptions collapsed until requested and supports closing them with the keyboard", async () => {
    const user = userEvent.setup();
    render(<LevelLegend />);

    const toggle = screen.getByRole("button", { name: "complianceLevel.explanationTitle" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("complianceLevel.exposedExplanation")).toBeVisible();
    for (const level of ["chronic", "ongoing", "new"]) {
      expect(screen.getByText(`complianceLevel.${level}Detail`)).toBeVisible();
    }

    await user.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

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

  it("shows only a compact box and reveals monthly details on hover or keyboard focus", async () => {
    const user = userEvent.setup();
    render(<HistoryStrip historyMonths={6} history={[{
      month: "2026-10",
      throughDate: "2026-10-28",
      onTrackDays: 24,
      needsAttentionDays: 2,
      actNowDays: 1,
      missingDays: 1,
      provisional: true,
    }]} />);

    const box = screen.getByRole("button", { name: /month=oktober 2026 status=complianceHistory.green/ });
    expect(box.firstElementChild).toHaveStyle({ backgroundColor: "var(--ax-bg-success-strong)" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(screen.queryByText(/complianceHistory.summary/)).not.toBeInTheDocument();

    await user.hover(box);
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent(/summary onTrack=24 recorded=27 percentage=89\s%/);
    expect(tooltip).toHaveTextContent(/breakdown green=24 yellow=2 red=1$/);
    expect(box).toHaveAccessibleName(/breakdown green=24 yellow=2 red=1$/);

    await user.unhover(box);
    for (let i = 0; i < 6 && document.activeElement !== box; i++) await user.tab();
    expect(box).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toBeVisible();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("distinguishes monthly statuses by symbol as well as colour", () => {
    render(<HistoryStrip historyMonths={6} history={["2026-08", "2026-09", "2026-10"].map((month, index) => ({
      month,
      throughDate: `${month}-28`,
      onTrackDays: index === 0 ? 28 : 0,
      needsAttentionDays: index === 1 ? 28 : 0,
      actNowDays: index === 2 ? 28 : 0,
      missingDays: 0,
      provisional: false,
    }))} />);

    const icons = ["green", "yellow", "red"].map((status) => {
      const box = screen.getByRole("button", {
        name: new RegExp(`status=complianceHistory.${status}`),
      });
      const icon = box.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute("aria-hidden", "true");
      return icon?.innerHTML;
    });
    expect(new Set(icons).size).toBe(3);
  });

  it("does not show a percentage or status symbol for months without recorded days", () => {
    render(<HistoryStrip historyMonths={6} history={[{
      month: "2025-12",
      throughDate: "2025-12-31",
      onTrackDays: 0,
      needsAttentionDays: 0,
      actNowDays: 0,
      missingDays: 31,
      provisional: false,
    }]} />);
    const box = screen.getByRole("button", { name: /month=desember 2025 status=complianceStatus.noData/ });
    expect(box.firstElementChild).toHaveStyle({ backgroundColor: "var(--ax-bg-neutral-moderate)" });
    expect(box).not.toHaveAccessibleName(/complianceHistory.summary/);
    expect(box.querySelector("svg")).not.toBeInTheDocument();
  });

  it("pads with no-data months before the first recorded month so there are always six boxes", () => {
    render(<HistoryStrip historyMonths={6} history={[{
      month: "2026-02",
      throughDate: "2026-02-10",
      onTrackDays: 10,
      needsAttentionDays: 0,
      actNowDays: 0,
      missingDays: 0,
      provisional: true,
    }]} />);

    const boxes = screen.getAllByRole("button");
    expect(boxes).toHaveLength(6);
    expect(boxes[0]).toHaveAccessibleName(/month=september 2025 status=complianceStatus.noData/);
    expect(boxes[4]).toHaveAccessibleName(/month=januar 2026 status=complianceStatus.noData/);
    expect(boxes[5]).toHaveAccessibleName(/month=februar 2026 status=complianceHistory.green/);
  });

  it("explains the backend's active thresholds rather than frontend defaults", async () => {
    const user = userEvent.setup();
    render(<ComplianceMeasurement
      measurement={{
        ...mockSecurityStatusPayload.measurement,
        deployMaxAgeDays: 45,
        exposedRedDays: 7,
        criticalDays: 10,
        nonCriticalDays: 50,
        trendWindowDays: 20,
        maintenanceYellowRatio: 0.8,
      }}
      generatedAt="2026-10-28T07:00:00Z"
    />);
    const toggle = screen.getByRole("button", { name: "complianceMeasurement.title" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("complianceMeasurement.historyColours")).toBeVisible();
    expect(screen.getByText("complianceMeasurement.maintenanceAge days=45")).toBeVisible();
    expect(screen.getByText("complianceMeasurement.deadlines critical=10 nonCritical=50")).toBeVisible();
    expect(screen.getByText("complianceMeasurement.exposureRules days=7")).toBeVisible();
    expect(screen.getByText("complianceMeasurement.calendarDays")).toBeVisible();
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
          appsPastDeadline: [{ app: "soknad-api", daysOver: 6, findings: [] }],
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
        appsPastDeadline: [{ app: "soknad-api", daysOver: 39, findings: [] }],
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

    render(<TeamCard team={mockTeam} variant="5c" historyMonths={6} />);
    expect(screen.getByText("team-nordlys")).toBeInTheDocument();
    expect(screen.getByText("soknad-api")).toBeInTheDocument();
    expect(screen.getByText("gammel-rapport")).toBeInTheDocument();
    expect(screen.getByText("complianceCard.daysOver days=39")).toBeInTheDocument();
    expect(screen.queryByText(/complianceCard.workdaysOver/)).not.toBeInTheDocument();
  });

  it("reveals the overdue packages for an application past deadline on demand", async () => {
    const user = userEvent.setup();
    const mockTeam: TeamSecurityStatus = {
      team: "team-nordlys",
      applicationCount: 1,
      level: "new",
      history: [],
      exposed: {
        status: "red",
        appsPastDeadline: [
          {
            app: "soknad-api",
            daysOver: 39,
            findings: [
              {
                cveId: "CVE-2026-54518",
                packageName: "pkg:golang/golang.org/x/net@0.30.0",
                severity: "MEDIUM",
                daysOver: 39,
              },
              { cveId: "CVE-2026-54512", packageName: null, severity: "HIGH", daysOver: 19 },
              {
                cveId: "CVE-2026-54513",
                packageName: "pkg:golang/stdlib@1.23.1",
                severity: null,
                daysOver: 5,
              },
            ],
          },
        ],
      },
      trend: { status: "green", direction: "stable", appsWithOverduePerMonth: [] },
      maintenance: { status: "green", upToDate: 1, total: 1, overdueRebuild: [] },
    };

    render(<TeamCard team={mockTeam} variant="5c" historyMonths={6} />);
    const toggle = screen.getByRole("button", { name: /soknad-api/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("pkg:golang/golang.org/x/net@0.30.0")).toBeVisible();
    expect(screen.getByText("complianceCard.unknownPackage")).toBeVisible();
    expect(
      screen.getByText("complianceCard.findingDetails cveId=CVE-2026-54518 severity=admin.medium days=39")
    ).toBeVisible();
    expect(
      screen.getByText("complianceCard.findingDetails cveId=CVE-2026-54512 severity=admin.high days=19")
    ).toBeVisible();
    expect(
      screen.getByText("complianceCard.findingDetails cveId=CVE-2026-54513 severity=admin.unknown days=5")
    ).toBeVisible();
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
        exposed: { status: "yellow", appsPastDeadline: [{ app: "myr-app", daysOver: 1, findings: [] }] },
        trend: { status: "green", direction: "stable", appsWithOverduePerMonth: [0, 0, 0, 0, 0, 0] },
        maintenance: { status: "yellow", upToDate: 10, total: 13, overdueRebuild: [] },
      },
      {
        team: "team-hav",
        applicationCount: 14,
        level: "chronic",
        history: [],
        exposed: { status: "red", appsPastDeadline: [{ app: "hav-app", daysOver: 10, findings: [] }] },
        trend: { status: "red", direction: "worse", appsWithOverduePerMonth: [2, 2, 3, 3, 4, 4] },
        maintenance: { status: "red", upToDate: 9, total: 14, overdueRebuild: [] },
      },
      {
        team: "team-nordlys",
        applicationCount: 11,
        level: "ongoing",
        history: [],
        exposed: { status: "red", appsPastDeadline: [{ app: "soknad-api", daysOver: 6, findings: [] }] },
        trend: { status: "red", direction: "worse", appsWithOverduePerMonth: [1, 2, 3, 4, 4, 4] },
        maintenance: { status: "yellow", upToDate: 9, total: 11, overdueRebuild: [] },
      },
    ];

    render(<TeamsFollowUpTable teams={mockTeams} historyMonths={6} collapseOnTrack={false} />);

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
        exposed: { status: "red", appsPastDeadline: [{ app: "hav-app", daysOver: 10, findings: [] }] },
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
