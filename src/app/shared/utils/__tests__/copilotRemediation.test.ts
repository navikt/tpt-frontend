import { describe, expect, it } from "vitest";
import { packageIdentity } from "../copilotRemediation";

describe("packageIdentity", () => {
  it("matches GitHub package names with versioned Nais PURLs", () => {
    expect(packageIdentity("pkg:maven/org.example/library@1.2.3")).toBe(packageIdentity("org.example:library"));
    expect(packageIdentity("pkg:npm/%40scope/Name@4.0.0")).toBe(packageIdentity("@scope/name"));
    expect(packageIdentity("pkg:golang/github.com/foo/bar@v1.2.0")).toBe("github.com/foo/bar");
  });

  it("ignores versions and qualifiers", () => {
    expect(packageIdentity("pkg:pypi/django@4.2.0")).toBe(packageIdentity("pkg:pypi/django@5.0.0?arch=x86_64"));
  });
});
