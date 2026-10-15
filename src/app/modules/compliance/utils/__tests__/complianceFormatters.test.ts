import { describe, it, expect } from "vitest";
import {
  getLast6MonthsInfo,
  sortTeamsForLeader,
} from "../complianceFormatters";
import type { TeamSecurityStatus } from "@/app/types/securityStatus";

describe("complianceFormatters", () => {
  describe("getLast6MonthsInfo", () => {
    it("should return exactly 6 months with initials and full names", () => {
      const months = getLast6MonthsInfo("en");
      expect(months).toHaveLength(6);
      expect(months[5]?.initial).toBeDefined();
      expect(months[5]?.fullName).toBeDefined();
    });
  });

  describe("sortTeamsForLeader", () => {
    it("should sort chronic teams first, then ongoing, then new", () => {
      const teams: TeamSecurityStatus[] = [
        {
          team: "team-new",
          applicationCount: 5,
          level: "new",
          history: ["green", "green", "green", "green", "green", "yellow"],
          exposed: { status: "yellow", appsPastDeadline: [] },
          trend: { status: "green", direction: "stable", appsWithOverduePerMonth: [0, 0, 0, 0, 0, 0] },
          maintenance: { status: "yellow", upToDate: 4, total: 5, overdueRebuild: [] },
        },
        {
          team: "team-chronic",
          applicationCount: 10,
          level: "chronic",
          history: ["red", "red", "red", "red", "red", "red"],
          exposed: { status: "red", appsPastDeadline: [] },
          trend: { status: "red", direction: "worse", appsWithOverduePerMonth: [1, 2, 3, 4, 5, 6] },
          maintenance: { status: "red", upToDate: 5, total: 10, overdueRebuild: [] },
        },
        {
          team: "team-ongoing",
          applicationCount: 8,
          level: "ongoing",
          history: ["green", "green", "green", "green", "yellow", "red"],
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
