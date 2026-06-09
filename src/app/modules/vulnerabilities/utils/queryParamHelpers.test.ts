import {
  serializeFilters,
  deserializeFilters,
  filtersToSearchParams,
  searchParamsToFilters,
  QUERY_PARAM_KEYS,
} from "./queryParamHelpers";

describe("queryParamHelpers", () => {
  describe("serializeFilters", () => {
    it("should serialize active filters to comma-separated string", () => {
      const filters = { team1: true, team2: true, team3: false };
      expect(serializeFilters(filters)).toBe("team1,team2");
    });

    it("should return empty string for empty filters", () => {
      expect(serializeFilters({})).toBe("");
    });

    it("should return empty string when all filters are false", () => {
      const filters = { team1: false, team2: false };
      expect(serializeFilters(filters)).toBe("");
    });
  });

  describe("deserializeFilters", () => {
    it("should deserialize comma-separated string to filter state", () => {
      const result = deserializeFilters("team1,team2,team3");
      expect(result).toEqual({ team1: true, team2: true, team3: true });
    });

    it("should return empty object for null value", () => {
      expect(deserializeFilters(null)).toEqual({});
    });

    it("should return empty object for empty string", () => {
      expect(deserializeFilters("")).toEqual({});
    });

    it("should handle trailing commas", () => {
      const result = deserializeFilters("team1,team2,");
      expect(result).toEqual({ team1: true, team2: true });
    });
  });

  describe("filtersToSearchParams", () => {
    it("should convert all filters to URLSearchParams", () => {
      const filters = {
        teamFilters: { team1: true, team2: true },
        applicationFilters: { app1: true },
        environmentFilters: { prod: true, dev: true },
        cveFilters: { "CVE-2024-1234": true },
        packageNameFilters: { express: true, react: true },
      };

      const params = filtersToSearchParams(filters);

      expect(params.get(QUERY_PARAM_KEYS.team)).toBe("team1,team2");
      // app filter is base64-encoded under QUERY_PARAM_KEYS.app ("appf")
      expect(params.get(QUERY_PARAM_KEYS.app)).not.toBeNull();
      expect(params.get(QUERY_PARAM_KEYS.app)).not.toBe("app1");
      expect(params.get(QUERY_PARAM_KEYS.env)).toBe("prod,dev");
      expect(params.get(QUERY_PARAM_KEYS.cve)).toBe("CVE-2024-1234");
      expect(params.get(QUERY_PARAM_KEYS.pkg)).toBe("express,react");
    });

    it("should omit empty filters", () => {
      const filters = {
        teamFilters: { team1: true },
        applicationFilters: {},
        environmentFilters: {},
        cveFilters: {},
        packageNameFilters: {},
      };

      const params = filtersToSearchParams(filters);

      expect(params.get(QUERY_PARAM_KEYS.team)).toBe("team1");
      expect(params.get(QUERY_PARAM_KEYS.app)).toBeNull();
      expect(params.get(QUERY_PARAM_KEYS.env)).toBeNull();
      expect(params.get(QUERY_PARAM_KEYS.cve)).toBeNull();
      expect(params.get(QUERY_PARAM_KEYS.pkg)).toBeNull();
    });

    it("should handle special characters in team names", () => {
      const filters = {
        teamFilters: { "team with spaces": true },
        applicationFilters: {},
        environmentFilters: {},
        cveFilters: {},
        packageNameFilters: {},
      };

      const params = filtersToSearchParams(filters);
      expect(params.get(QUERY_PARAM_KEYS.team)).toBe("team with spaces");
    });

    it("should use readable format for pkg and not use legacy compressed param", () => {
      const packageNames = Object.fromEntries(
        Array.from({ length: 50 }, (_, i) => [`package-name-${i}`, true])
      );

      const largeFilters = {
        teamFilters: {},
        applicationFilters: {},
        environmentFilters: {},
        cveFilters: {},
        packageNameFilters: packageNames,
      };

      const params = filtersToSearchParams(largeFilters);

      expect(params.get(QUERY_PARAM_KEYS.compressed)).toBeNull();
      expect(params.get(QUERY_PARAM_KEYS.pkg)).toBe(Object.keys(packageNames).join(","));
    });

    it("should encode app filter as base64 and keep other params readable", () => {
      const filters = {
        teamFilters: { team1: true },
        applicationFilters: { app1: true },
        environmentFilters: { prod: true },
        cveFilters: {},
        packageNameFilters: { pkg1: true },
      };

      const params = filtersToSearchParams(filters);

      expect(params.get(QUERY_PARAM_KEYS.compressed)).toBeNull();
      expect(params.get(QUERY_PARAM_KEYS.team)).toBe("team1");
      // appf param should be a base64 string, not a plain app name
      const appParam = params.get(QUERY_PARAM_KEYS.app);
      expect(appParam).not.toBeNull();
      expect(appParam).not.toContain("app1");
    });
  });

  describe("searchParamsToFilters", () => {
    it("should parse all query params to filter states (new appf= format)", () => {
      // Build params the same way the app does (via filtersToSearchParams)
      const original = {
        teamFilters: { team1: true, team2: true },
        applicationFilters: { app1: true },
        environmentFilters: { prod: true },
        cveFilters: { "CVE-2024-1234": true },
        packageNameFilters: { express: true },
      };
      const params = filtersToSearchParams(original);
      const filters = searchParamsToFilters(params);

      expect(filters.teamFilters).toEqual({ team1: true, team2: true });
      expect(filters.applicationFilters).toEqual({ app1: true });
      expect(filters.environmentFilters).toEqual({ prod: true });
      expect(filters.cveFilters).toEqual({ "CVE-2024-1234": true });
      expect(filters.packageNameFilters).toEqual({ express: true });
    });

    it("should parse legacy ?app= readable format as fallback", () => {
      const params = new URLSearchParams({ app: "app1,app2" });
      const filters = searchParamsToFilters(params);
      expect(filters.applicationFilters).toEqual({ app1: true, app2: true });
    });

    it("should return empty filter states for missing params", () => {
      const params = new URLSearchParams();
      const filters = searchParamsToFilters(params);

      expect(filters.teamFilters).toEqual({});
      expect(filters.applicationFilters).toEqual({});
      expect(filters.environmentFilters).toEqual({});
      expect(filters.cveFilters).toEqual({});
      expect(filters.packageNameFilters).toEqual({});
    });

    it("should handle partial params", () => {
      const params = new URLSearchParams({
        [QUERY_PARAM_KEYS.team]: "team1",
        [QUERY_PARAM_KEYS.env]: "prod",
      });

      const filters = searchParamsToFilters(params);

      expect(filters.teamFilters).toEqual({ team1: true });
      expect(filters.applicationFilters).toEqual({});
      expect(filters.environmentFilters).toEqual({ prod: true });
      expect(filters.cveFilters).toEqual({});
      expect(filters.packageNameFilters).toEqual({});
    });

    it("should handle legacy compressed ?f= format", () => {
      const originalFilters = {
        teamFilters: { team1: true, team2: true },
        applicationFilters: { app1: true, app2: true },
        environmentFilters: { prod: true },
        cveFilters: { "CVE-2024-1234": true },
        packageNameFilters: { express: true, react: true },
      };

      const compressed = btoa(encodeURIComponent(JSON.stringify(originalFilters)));
      const params = new URLSearchParams({ f: compressed });
      const decompressed = searchParamsToFilters(params);

      expect(decompressed.teamFilters).toEqual(originalFilters.teamFilters);
      expect(decompressed.applicationFilters).toEqual(originalFilters.applicationFilters);
    });

    it("should gracefully handle invalid compressed data", () => {
      const params = new URLSearchParams({
        [QUERY_PARAM_KEYS.compressed]: "invalid-base64-data!!!",
      });

      const filters = searchParamsToFilters(params);

      expect(filters.teamFilters).toEqual({});
      expect(filters.applicationFilters).toEqual({});
    });
  });

  describe("round-trip conversion", () => {
    it("should maintain filter state through serialization and deserialization", () => {
      const originalFilters = {
        teamFilters: { team1: true, team2: true },
        applicationFilters: { app1: true },
        environmentFilters: { prod: true, dev: true },
        cveFilters: { "CVE-2024-1234": true },
        packageNameFilters: { express: true },
      };

      const params = filtersToSearchParams(originalFilters);
      const roundTripFilters = searchParamsToFilters(params);

      expect(roundTripFilters).toEqual(originalFilters);
    });

    it("should maintain filter state with many app names through round-trip", () => {
      const originalFilters = {
        teamFilters: { team1: true },
        applicationFilters: Object.fromEntries(
          Array.from({ length: 20 }, (_, i) => [`my-long-app-name-service-${i}`, true])
        ),
        environmentFilters: { prod: true },
        cveFilters: {},
        packageNameFilters: {},
      };

      const params = filtersToSearchParams(originalFilters);
      const roundTripFilters = searchParamsToFilters(params);

      expect(roundTripFilters).toEqual(originalFilters);
    });

    it("should maintain filter state with large pkg list through round-trip", () => {
      const originalFilters = {
        teamFilters: { team1: true, team2: true },
        applicationFilters: { app1: true },
        environmentFilters: { prod: true },
        cveFilters: {},
        packageNameFilters: Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [`package-name-${i}`, true])
        ),
      };

      const params = filtersToSearchParams(originalFilters);
      const roundTripFilters = searchParamsToFilters(params);

      expect(roundTripFilters).toEqual(originalFilters);
    });
  });
});
