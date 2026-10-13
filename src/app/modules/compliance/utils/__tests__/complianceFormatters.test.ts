import { describe, it, expect } from "vitest";
import {
  formatSince,
  getLast6MonthsInfo,
  sortTeamsForLeader,
} from "../complianceFormatters";
import type { TeamSecurityStatus } from "@/app/types/securityStatus";

describe("complianceFormatters", () => {
  describe("formatSince", () => {
    it("should return null if date is missing or invalid", () => {
      expect(formatSince(undefined)).toBeNull();
      expect(formatSince("not-a-date")).toBeNull();
    });

    it("should format short month when more than 7 days ago", () => {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 2);
      const formattedNb = formatSince(pastDate.toISOString(), "nb");
      const formattedEn = formatSince(pastDate.toISOString(), "en");

      expect(formattedNb).toContain("siden");
      expect(formattedEn).toContain("since");
    });

    it("should format weekday when within last 7 days", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formatted = formatSince(yesterday.toISOString(), "en");
      expect(formatted).toMatch(/^since [A-Z][a-z]+/);
    });
  });

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
