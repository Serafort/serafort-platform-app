import { describe, it, expect } from "vitest";
import {
  directionalRadius,
  resolveRadiusValue,
} from "./directionalRadius";

describe("resolveRadiusValue", () => {
  it("maps a scale key to a tenant-overridable custom property", () => {
    expect(resolveRadiusValue("md")).toBe("var(--radius-md, 8px)");
    expect(resolveRadiusValue("full")).toBe("var(--radius-full, 9999px)");
  });

  it("turns a number into px and passes other strings through", () => {
    expect(resolveRadiusValue(12)).toBe("12px");
    expect(resolveRadiusValue("1rem")).toBe("1rem");
    expect(resolveRadiusValue("var(--x)")).toBe("var(--x)");
  });
});

describe("directionalRadius", () => {
  it("expands an edge to its two logical corners", () => {
    expect(directionalRadius(8, "start", { resetUnset: false })).toEqual({
      borderStartStartRadius: "8px",
      borderEndStartRadius: "8px",
    });
    expect(directionalRadius(8, "top", { resetUnset: false })).toEqual({
      borderStartStartRadius: "8px",
      borderStartEndRadius: "8px",
    });
  });

  it("targets a single corner by name", () => {
    expect(
      directionalRadius("md", "bottom-end", { resetUnset: false }),
    ).toEqual({
      borderEndEndRadius: "var(--radius-md, 8px)",
    });
  });

  it("zeroes the unlisted corners by default (segmented-control case)", () => {
    expect(directionalRadius("lg", "start")).toEqual({
      borderStartStartRadius: "var(--radius-lg, 12px)",
      borderEndStartRadius: "var(--radius-lg, 12px)",
      borderStartEndRadius: 0,
      borderEndEndRadius: 0,
    });
  });

  it("accepts a list of edges", () => {
    expect(directionalRadius(4, ["top", "bottom-start"])).toEqual({
      borderStartStartRadius: "4px",
      borderStartEndRadius: "4px",
      borderEndStartRadius: "4px",
      borderEndEndRadius: 0,
    });
  });

  it("uses logical properties so LTR/RTL flip is automatic", () => {
    const keys = Object.keys(directionalRadius(8, ["top", "bottom"]));
    expect(keys).toEqual([
      "borderStartStartRadius",
      "borderStartEndRadius",
      "borderEndStartRadius",
      "borderEndEndRadius",
    ]);
    // No physical corner names leak through.
    expect(keys.join()).not.toMatch(/Left|Right/);
  });
});
