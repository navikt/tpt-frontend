import { describe, it, expect } from "vitest";
import {
  getOnTrackPercentage,
  getMonthlyStatus,
  sortTeamsForLeader,
} from "../complianceFormatters";
import type { TeamSecurityStatus } from "@/app/types/securityStatus";

describe("complianceFormatters", () => {
  describe("getOnTrackPercentage", () => {
    const month = {
      month: "2026-10",
      throughDate: "2026-10-28",
      onTrackDays: 12,
      needsAttentionDays: 1,
      actNowDays: 1,
      missingDays: 14,
      provisional: true,
    };

    it("uses recorded days rather than elapsed days and does not let a red day define the month", () => {
      expect(getOnTrackPercentage(month)).toBe(12 / 14);
    });

    describe("getMonthlyStatus", () => {
      it.each([
        [12, 1, 1, "green"],
        [1, 3, 2, "yellow"],
        [1, 2, 3, "red"],
        [4, 4, 0, "yellow"],
        [4, 0, 4, "red"],
        [0, 4, 4, "red"],
        [4, 4, 4, "red"],
        [0, 0, 0, null],
      ])("uses the most common status with worse ties for %i green, %i yellow and %i red days",
        (onTrackDays, needsAttentionDays, actNowDays, expected) => {
          expect(getMonthlyStatus({
            month: "2026-10",
            throughDate: "2026-10-28",
            onTrackDays,
            needsAttentionDays,
            actNowDays,
            missingDays: 14,
            provisional: true,
          })).toBe(expected);
        });
    });

    it("distinguishes no data from recorded days with no green results", () => {
      expect(getOnTrackPercentage({ ...month, onTrackDays: 0 })).toBe(0);
      expect(getOnTrackPercentage({
        ...month, onTrackDays: 0, needsAttentionDays: 0, actNowDays: 0,
      })).toBeNull();
    });
  });

  describe("sortTeamsForLeader", () => {
    it("should sort chronic teams first, then ongoing, then new", () => {
      const teams: TeamSecurityStatus[] = [
        {
          team: "team-new",
          applicationCount: 5,
          level: "new",
          history: [],
          exposed: { status: "yellow", appsPastDeadline: [] },
          trend: { status: "green", direction: "stable", appsWithOverduePerMonth: [0, 0, 0, 0, 0, 0] },
          maintenance: { status: "yellow", upToDate: 4, total: 5, overdueRebuild: [] },
        },
        {
          team: "team-chronic",
          applicationCount: 10,
          level: "chronic",
          history: [],
          exposed: { status: "red", appsPastDeadline: [] },
          trend: { status: "red", direction: "worse", appsWithOverduePerMonth: [1, 2, 3, 4, 5, 6] },
          maintenance: { status: "red", upToDate: 5, total: 10, overdueRebuild: [] },
        },
        {
          team: "team-ongoing",
          applicationCount: 8,
          level: "ongoing",
          history: [],
          exposed: { status: "red", appsPastDeadline: [] },
          trend: { status: "red", direction: "worse", appsWithOverduePerMonth: [1, 1, 2, 2, 3, 4] },
          maintenance: { status: "yellow", upToDate: 6, total: 8, overdueRebuild: [] },
        },
      ];

      const sorted = sortTeamsForLeader(teams);
      expect(sorted[0]?.team).toBe("team-chronic");
      expect(sorted[1]?.team).toBe("team-ongoing");
      expect(sorted[2]?.team).toBe("team-new");
    });
  });
});
