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

    it("should use readable format for large filter lists", () => {
      // Create a filter list that will exceed 200 chars
      const packageNames = Object.fromEntries(
        Array.from({ length: 50 }, (_, i) => [`package-name-${i}`, true])
      );

      const largeFilters = {
        teamFilters: {},
        applicationFilters: {},
        environmentFilters: {},
        cveFilters: {},
        packageNameFilters: packageNames
      };

      const params = filtersToSearchParams(largeFilters);
      
      // Should use compressed format
      expect(params.get(QUERY_PARAM_KEYS.compressed)).toBeNull();
      expect(params.get(QUERY_PARAM_KEYS.pkg)).toBe(Object.keys(packageNames).join(","));
    });

    it("should use readable format for small filter lists", () => {
      const smallFilters = {
        teamFilters: { team1: true },
        applicationFilters: { app1: true },
        environmentFilters: { prod: true },
        cveFilters: {},
        packageNameFilters: { pkg1: true },
      };

      const params = filtersToSearchParams(smallFilters);
      
      // Should use readable format
      expect(params.get(QUERY_PARAM_KEYS.compressed)).toBeNull();
      expect(params.get(QUERY_PARAM_KEYS.team)).toBe("team1");
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

    it("should handle compressed format", () => {
      const originalFilters = {
        teamFilters: { team1: true, team2: true },
        applicationFilters: { app1: true, app2: true },
        environmentFilters: { prod: true },
        cveFilters: { "CVE-2024-1234": true },
        packageNameFilters: { express: true, react: true },
      };

      // First compress
      const compressedParams = filtersToSearchParams({
        ...originalFilters,
        packageNameFilters: Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [`package-name-${i}`, true])
        ),
      });

      // Then decompress
      const decompressed = searchParamsToFilters(compressedParams);

      expect(decompressed.teamFilters).toEqual(originalFilters.teamFilters);
      expect(Object.keys(decompressed.packageNameFilters).length).toBe(50);
    });

    it("should gracefully handle invalid compressed data", () => {
      const params = new URLSearchParams({
        [QUERY_PARAM_KEYS.compressed]: "invalid-base64-data!!!",
      });

      const filters = searchParamsToFilters(params);

      // Should return empty filters
      expect(filters.teamFilters).toEqual({});
      expect(filters.applicationFilters).toEqual({});
    });
  });

  describe("round-trip conversion", () => {
    it("should maintain filter state through serialization and deserialization (readable)", () => {
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

    it("should maintain filter state through compression round-trip", () => {
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
