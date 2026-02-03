import { formatNumber } from "../format";

describe("formatNumber", () => {
  it("should format numbers with Norwegian locale", () => {
    const result = formatNumber(151354);
    expect(result).toContain("151");
    expect(result).toContain("354");
  });

  it("should format decimal numbers", () => {
    const result = formatNumber(1234.56);
    expect(result).toContain("1");
    expect(result).toContain("234");
    expect(result).toContain("56");
  });

  it("should handle zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("should handle undefined gracefully", () => {
    expect(formatNumber(undefined)).toBe("0");
  });

  it("should handle null gracefully", () => {
    expect(formatNumber(null)).toBe("0");
  });

  it("should handle NaN gracefully", () => {
    expect(formatNumber(NaN)).toBe("0");
  });

  it("should format negative numbers correctly", () => {
    const result = formatNumber(-1234);
    expect(result).toContain("1");
    expect(result).toContain("234");
    expect(result.startsWith("-") || result.startsWith("−")).toBe(true);
  });

  it("should format large numbers", () => {
    const result = formatNumber(1234567890);
    expect(result).toContain("1");
    expect(result).toContain("234");
    expect(result).toContain("567");
    expect(result).toContain("890");
  });
});
