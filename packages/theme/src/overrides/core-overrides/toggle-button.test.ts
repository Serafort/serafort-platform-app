import { describe, it, expect } from "vitest";
import toggleButton from "./toggle-button";

type RootFn = (args: {
  ownerState: { size?: string; orientation?: string };
}) => Record<string, unknown>;

const groupRoot = (
  toggleButton.MuiToggleButtonGroup!.styleOverrides!.root as unknown as RootFn
);

describe("MuiToggleButtonGroup radius override", () => {
  it("rounds only the leading/trailing corners of a horizontal group", () => {
    const style = groupRoot({ ownerState: { size: "medium" } });
    const grouped = style["& .MuiToggleButtonGroup-grouped"] as Record<
      string,
      Record<string, unknown>
    >;

    expect(grouped.borderRadius).toBe(0);
    // First segment: start corners rounded via logical properties, seam square.
    expect(grouped["&:first-of-type"]).toEqual({
      borderStartStartRadius: "var(--radius-md, 8px)",
      borderEndStartRadius: "var(--radius-md, 8px)",
    });
    // Last segment: end corners rounded.
    expect(grouped["&:last-of-type"]).toEqual({
      borderStartEndRadius: "var(--radius-md, 8px)",
      borderEndEndRadius: "var(--radius-md, 8px)",
    });
  });

  it("switches to top/bottom corners when the group is vertical", () => {
    const style = groupRoot({
      ownerState: { size: "small", orientation: "vertical" },
    });
    const grouped = style["& .MuiToggleButtonGroup-grouped"] as Record<
      string,
      Record<string, unknown>
    >;

    expect(grouped["&:first-of-type"]).toEqual({
      borderStartStartRadius: "var(--radius-sm, 4px)",
      borderStartEndRadius: "var(--radius-sm, 4px)",
    });
    expect(grouped["&:last-of-type"]).toEqual({
      borderEndStartRadius: "var(--radius-sm, 4px)",
      borderEndEndRadius: "var(--radius-sm, 4px)",
    });
  });

  it("scales the corner radius with the group size", () => {
    const large = groupRoot({ ownerState: { size: "large" } });
    const grouped = large["& .MuiToggleButtonGroup-grouped"] as Record<
      string,
      Record<string, unknown>
    >;
    expect(grouped["&:first-of-type"]).toMatchObject({
      borderStartStartRadius: "var(--radius-lg, 12px)",
    });
  });
});
