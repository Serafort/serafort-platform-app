// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SpacingEditor } from "./SpacingEditor";

// This package has no global test setup, so RTL's auto-cleanup never registers.
afterEach(cleanup);

const baseProps = {
  spacing: { xs: "0.25rem", md: "1rem" },
  borderRadius: { md: "8px", lg: "12px" },
  onSpacingChange: vi.fn(),
  onBorderRadiusChange: vi.fn(),
};

describe("SpacingEditor", () => {
  it("shows only the core sections when the optional callbacks are omitted", () => {
    render(<SpacingEditor {...baseProps} />);

    expect(screen.getByText("Spacing scale")).toBeTruthy();
    expect(screen.getByText("Corner radius")).toBeTruthy();
    expect(screen.queryByText("Fluid spacing")).toBeNull();
    expect(screen.queryByText("Elevation")).toBeNull();
  });

  it("renders the elevation, fluid spacing and grouped-control sections when wired", () => {
    render(
      <SpacingEditor
        {...baseProps}
        shadows={{ md: "0px 3px 12px rgba(0,0,0,0.14)" }}
        fluidSpacing={{ sectionGap: "clamp(2.5rem, 1.5rem + 5vw, 6rem)" }}
        onShadowsChange={vi.fn()}
        onFluidSpacingChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Elevation")).toBeTruthy();
    expect(screen.getByText("Fluid spacing")).toBeTruthy();
    expect(screen.getByText("Grouped controls")).toBeTruthy();
    expect(screen.getByText("Spacing, radius & elevation")).toBeTruthy();
  });

  it("merges an edit into the shadow map without dropping the other anchors", () => {
    const onShadowsChange = vi.fn();
    render(
      <SpacingEditor
        {...baseProps}
        shadows={{ sm: "S", md: "M" }}
        fluidSpacing={{}}
        onShadowsChange={onShadowsChange}
        onFluidSpacingChange={vi.fn()}
      />,
    );

    // "Large" labels both the radius `lg` row and the shadow `lg` row; the
    // Elevation section renders last, so its field is the second match.
    const largeFields = screen.getAllByLabelText("Large");
    fireEvent.change(largeFields[largeFields.length - 1], {
      target: { value: "0px 4px 18px rgba(0,0,0,0.16)" },
    });

    expect(onShadowsChange).toHaveBeenCalledWith({
      sm: "S",
      md: "M",
      lg: "0px 4px 18px rgba(0,0,0,0.16)",
    });
  });

  it("routes a fluid-spacing edit through onFluidSpacingChange", () => {
    const onFluidSpacingChange = vi.fn();
    render(
      <SpacingEditor
        {...baseProps}
        shadows={{}}
        fluidSpacing={{ sectionGap: "clamp(2rem, 4vw, 5rem)" }}
        onShadowsChange={vi.fn()}
        onFluidSpacingChange={onFluidSpacingChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Section gap"), {
      target: { value: "clamp(1rem, 3vw, 4rem)" },
    });

    expect(onFluidSpacingChange).toHaveBeenCalledWith({
      sectionGap: "clamp(1rem, 3vw, 4rem)",
    });
  });
});
