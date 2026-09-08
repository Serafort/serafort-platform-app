import { describe, it, expect } from "vitest";
import { elevationScale, withAmbientDepth } from "./elevation";

describe("elevationScale", () => {
  it("returns a 25-entry ramp with index 0 as 'none'", () => {
    const light = elevationScale("light");
    expect(light).toHaveLength(25);
    expect(light[0]).toBe("none");
    expect(light[1]).not.toBe("none");
  });

  it("grows monotonically across the ramp", () => {
    const scale = elevationScale("light");
    // Every offset/blur/spread term climbs with the level, so the sum of all
    // px magnitudes in an entry is a stable proxy for "more elevated".
    const weight = (entry: string): number =>
      (entry.match(/-?\d+px/g) ?? []).reduce(
        (sum, tok) => sum + Math.abs(Number(tok.replace("px", ""))),
        0,
      );
    for (let i = 2; i <= 24; i += 1) {
      expect(weight(scale[i])).toBeGreaterThanOrEqual(weight(scale[i - 1]));
    }
    // ...and meaningfully bigger end to end, not just flat.
    expect(weight(scale[24])).toBeGreaterThan(weight(scale[1]) * 3);
  });

  it("tints the ramp with the mode's ground colour", () => {
    expect(elevationScale("light")[8]).toContain("rgba(47, 43, 61");
    expect(elevationScale("dark")[8]).toContain("rgba(19, 17, 32");
  });

  it("uses heavier alphas in dark mode than light mode", () => {
    expect(elevationScale("light")[8]).toContain("0.2)");
    expect(elevationScale("dark")[8]).toContain("0.34)");
  });

  it("folds the ambient edge highlight + containment ring into dark mode only", () => {
    const dark = elevationScale("dark")[6];
    expect(dark).toContain("inset 0px 1px 0px 0px rgba(255, 255, 255, 0.05)");
    expect(dark).toContain("0px 0px 0px 1px rgba(255, 255, 255, 0.04)");

    const light = elevationScale("light")[6];
    expect(light).not.toContain("inset");
    expect(light).not.toContain("255, 255, 255");
  });

  it("lets a caller force ambient depth off in dark mode", () => {
    const dark = elevationScale("dark", { ambientDepth: false })[6];
    expect(dark).not.toContain("inset");
  });

  it("lets a caller force ambient depth on in light mode", () => {
    const light = elevationScale("light", { ambientDepth: true })[6];
    expect(light).toContain("inset 0px 1px 0px 0px rgba(255, 255, 255, 0.05)");
  });

  it("keeps every dark-mode entry structurally parallel for box-shadow transitions", () => {
    const dark = elevationScale("dark");
    const layerCount = (entry: string) => entry.split("), ").length;
    for (let i = 2; i <= 24; i += 1) {
      expect(layerCount(dark[i])).toBe(layerCount(dark[1]));
    }
  });
});

describe("withAmbientDepth", () => {
  it("wraps a token shadow with highlight + ring in dark mode", () => {
    const wrapped = withAmbientDepth("0px 3px 12px rgba(19, 17, 32, 0.2)", "dark");
    expect(wrapped.startsWith("inset 0px 1px 0px 0px")).toBe(true);
    expect(wrapped.endsWith("0px 0px 0px 1px rgba(255, 255, 255, 0.04)")).toBe(
      true,
    );
  });

  it("is a no-op in light mode and for 'none'", () => {
    expect(withAmbientDepth("0px 3px 12px rgba(0,0,0,0.2)", "light")).toBe(
      "0px 3px 12px rgba(0,0,0,0.2)",
    );
    expect(withAmbientDepth("none", "dark")).toBe("none");
    expect(withAmbientDepth("", "dark")).toBe("");
  });
});
