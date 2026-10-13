import { describe, it, expect } from "vitest";
import {
  evaluateExposedStatus,
  evaluateTrendStatus,
  evaluateMaintenanceStatus,
  evaluateTeamLevel,
} from "../complianceEvaluators";

describe("complianceEvaluators", () => {
  describe("evaluateExposedStatus", () => {
    it("returns green when no apps are past deadline", () => {
      expect(evaluateExposedStatus([])).toBe("green");
    });

    it("returns yellow when 1 app past deadline under 5 workdays", () => {
      expect(evaluateExposedStatus([{ app: "app1", workdaysOver: 3 }])).toBe("yellow");
    });

    it("returns red when 1 app past deadline >= 5 workdays", () => {
      expect(evaluateExposedStatus([{ app: "app1", workdaysOver: 5 }])).toBe("red");
    });

    it("returns red when 2 or more apps past deadline", () => {
      expect(
        evaluateExposedStatus([
          { app: "app1", workdaysOver: 1 },
          { app: "app2", workdaysOver: 1 },
        ])
      ).toBe("red");
    });
  });

  describe("evaluateTrendStatus", () => {
    it("returns green when stable or improving", () => {
      expect(evaluateTrendStatus("improving", true)).toBe("green");
      expect(evaluateTrendStatus("stable", true)).toBe("green");
    });

    it("returns yellow when worse but no apps past deadline", () => {
      expect(evaluateTrendStatus("worse", false)).toBe("yellow");
    });

    it("returns red when worse and has apps past deadline", () => {
      expect(evaluateTrendStatus("worse", true)).toBe("red");
    });
  });

  describe("evaluateMaintenanceStatus", () => {
    it("returns green when all apps up to date", () => {
      expect(evaluateMaintenanceStatus(10, 10)).toBe("green");
      expect(evaluateMaintenanceStatus(0, 0)).toBe("green");
    });

    it("returns yellow when >= 75% up to date", () => {
      expect(evaluateMaintenanceStatus(8, 10)).toBe("yellow");
      expect(evaluateMaintenanceStatus(9, 11)).toBe("yellow");
    });

    it("returns red when < 75% up to date", () => {
      expect(evaluateMaintenanceStatus(7, 10)).toBe("red");
      expect(evaluateMaintenanceStatus(9, 14)).toBe("red");
    });
  });

  describe("evaluateTeamLevel", () => {
    it("returns null if all green", () => {
      expect(
        evaluateTeamLevel({
          exposedStatus: "green",
          trendStatus: "green",
          maintenanceStatus: "green",
        })
      ).toBeNull();
    });

    it("returns chronic if all 3 are red or duration >= 3 months", () => {
      expect(
        evaluateTeamLevel({
          exposedStatus: "red",
          trendStatus: "red",
          maintenanceStatus: "red",
        })
      ).toBe("chronic");

      expect(
        evaluateTeamLevel({
          exposedStatus: "yellow",
          trendStatus: "green",
          maintenanceStatus: "green",
          offTrackDurationMonths: 4,
        })
      ).toBe("chronic");
    });

    it("returns new if off track under 5 workdays and < 2 red", () => {
      expect(
        evaluateTeamLevel({
          exposedStatus: "yellow",
          trendStatus: "green",
          maintenanceStatus: "green",
          offTrackDurationWorkdays: 3,
        })
      ).toBe("new");
    });

    it("returns ongoing otherwise", () => {
      expect(
        evaluateTeamLevel({
          exposedStatus: "red",
          trendStatus: "red",
          maintenanceStatus: "yellow",
          offTrackDurationWorkdays: 2,
        })
      ).toBe("ongoing");

      expect(
        evaluateTeamLevel({
          exposedStatus: "yellow",
          trendStatus: "yellow",
          maintenanceStatus: "green",
          offTrackDurationWorkdays: 10,
        })
      ).toBe("ongoing");
    });
  });
});
