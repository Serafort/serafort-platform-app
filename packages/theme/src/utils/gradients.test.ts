import { describe, it, expect } from "vitest";
import {
  linearGradient,
  radialGradient,
  conicGradient,
  brandMeshGradient,
  gradientTokens,
} from "./gradients";

describe("linearGradient", () => {
  it("defaults to a 180deg (top-to-bottom) gradient", () => {
    expect(
      linearGradient({ stops: [{ color: "#000" }, { color: "#fff" }] }),
    ).toBe("linear-gradient(180deg, #000, #fff)");
  });

  it("accepts a numeric angle or a keyword direction", () => {
    expect(
      linearGradient({ angle: 135, stops: [{ color: "a" }, { color: "b" }] }),
    ).toBe("linear-gradient(135deg, a, b)");
    expect(
      linearGradient({
        angle: "to right",
        stops: [{ color: "a" }, { color: "b" }],
      }),
    ).toBe("linear-gradient(to right, a, b)");
  });

  it("renders explicit stop positions and the repeating variant", () => {
    expect(
      linearGradient({
        angle: 90,
        repeating: true,
        stops: [
          { color: "red", at: "0px" },
          { color: "blue", at: "10px" },
        ],
      }),
    ).toBe("repeating-linear-gradient(90deg, red 0px, blue 10px)");
  });

  it("rejects a gradient with fewer than two stops", () => {
    expect(() => linearGradient({ stops: [{ color: "red" }] })).toThrow();
  });
});

describe("radialGradient", () => {
  it("emits only the position when no shape or size is given", () => {
    expect(
      radialGradient({
        position: "18% 12%",
        stops: [
          { color: "rgba(0,0,0,0.2)", at: "0px" },
          { color: "transparent", at: "55%" },
        ],
      }),
    ).toBe("radial-gradient(at 18% 12%, rgba(0,0,0,0.2) 0px, transparent 55%)");
  });

  it("composes shape, size and position", () => {
    expect(
      radialGradient({
        shape: "circle",
        size: "farthest-corner",
        position: "center",
        stops: [{ color: "a" }, { color: "b" }],
      }),
    ).toBe("radial-gradient(circle farthest-corner at center, a, b)");
  });

  it("tolerates a leading 'at' in the position", () => {
    expect(
      radialGradient({
        position: "at 50% 50%",
        stops: [{ color: "a" }, { color: "b" }],
      }),
    ).toBe("radial-gradient(at 50% 50%, a, b)");
  });
});

describe("conicGradient", () => {
  it("builds a from-angle conic gradient", () => {
    expect(
      conicGradient({
        from: 45,
        position: "center",
        stops: [{ color: "a" }, { color: "b" }],
      }),
    ).toBe("conic-gradient(from 45deg at center, a, b)");
  });
});

describe("brandMeshGradient", () => {
  it("reproduces the four-lobe ambient wash from two brand colours", () => {
    const mesh = brandMeshGradient("#047BFA", "#032457");
    expect(mesh).toBe(
      "radial-gradient(at 18% 12%, rgba(4, 123, 250, 0.28) 0px, transparent 55%), " +
        "radial-gradient(at 82% 8%, rgba(3, 36, 87, 0.22) 0px, transparent 50%), " +
        "radial-gradient(at 70% 88%, rgba(4, 123, 250, 0.18) 0px, transparent 55%), " +
        "radial-gradient(at 8% 78%, rgba(3, 36, 87, 0.16) 0px, transparent 50%)",
    );
  });

  it("falls back to the primary colour when no secondary is given", () => {
    const mesh = brandMeshGradient("#047BFA");
    expect(mesh).toContain("rgba(4, 123, 250, 0.22)");
  });

  it("scales every lobe's alpha by intensity", () => {
    const mesh = brandMeshGradient("#047BFA", "#032457", { intensity: 0.5 });
    expect(mesh).toContain("rgba(4, 123, 250, 0.14)"); // 0.28 * 0.5
    expect(mesh).toContain("rgba(3, 36, 87, 0.11)"); // 0.22 * 0.5
  });
});

describe("gradientTokens", () => {
  it("brandSheen is a 135deg two-stop gradient", () => {
    expect(gradientTokens.brandSheen("#047BFA", "#032457")).toBe(
      "linear-gradient(135deg, #047BFA, #032457)",
    );
  });

  it("shimmerSweep frames a highlight with transparent ends", () => {
    expect(gradientTokens.shimmerSweep("#fff")).toBe(
      "linear-gradient(90deg, transparent, #fff, transparent)",
    );
  });

  it("exposes brandMesh for tenant-driven washes", () => {
    expect(gradientTokens.brandMesh).toBe(brandMeshGradient);
  });
});
