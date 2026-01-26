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
      expect(params.get(QUERY_PARAM_KEYS.app)).toBe("app1");
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

    it("should handle special characters", () => {
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
  });

  describe("searchParamsToFilters", () => {
    it("should parse all query params to filter states", () => {
      const params = new URLSearchParams({
        [QUERY_PARAM_KEYS.team]: "team1,team2",
        [QUERY_PARAM_KEYS.app]: "app1",
        [QUERY_PARAM_KEYS.env]: "prod",
        [QUERY_PARAM_KEYS.cve]: "CVE-2024-1234",
        [QUERY_PARAM_KEYS.pkg]: "express",
      });

      const filters = searchParamsToFilters(params);

      expect(filters.teamFilters).toEqual({ team1: true, team2: true });
      expect(filters.applicationFilters).toEqual({ app1: true });
      expect(filters.environmentFilters).toEqual({ prod: true });
      expect(filters.cveFilters).toEqual({ "CVE-2024-1234": true });
      expect(filters.packageNameFilters).toEqual({ express: true });
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
  });
});
