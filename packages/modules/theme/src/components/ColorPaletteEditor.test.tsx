// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ColorPaletteEditor } from "./ColorPaletteEditor";

// This package has no global test setup, so RTL's auto-cleanup never registers.
afterEach(cleanup);

const baseProps = {
  colors: {
    primary: { value: "#047BFA" },
    secondary: { value: "#032457" },
  },
  onChange: vi.fn(),
};

describe("ColorPaletteEditor - brand gradient", () => {
  it("hides the Brand gradient section until onGradientsChange is wired", () => {
    const { rerender } = render(<ColorPaletteEditor {...baseProps} />);
    expect(screen.queryByText("Brand gradient")).toBeNull();

    rerender(
      <ColorPaletteEditor
        {...baseProps}
        gradients={{ meshIntensity: 1 }}
        onGradientsChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Brand gradient")).toBeTruthy();
  });

  it("routes a mesh-intensity edit through onGradientsChange", () => {
    const onGradientsChange = vi.fn();
    render(
      <ColorPaletteEditor
        {...baseProps}
        gradients={{ meshIntensity: 1 }}
        onGradientsChange={onGradientsChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Mesh intensity"), {
      target: { value: "0.5" },
    });

    expect(onGradientsChange).toHaveBeenCalledWith({ meshIntensity: 0.5 });
  });

  it("falls back to intensity 1 for a non-numeric value", () => {
    const onGradientsChange = vi.fn();
    render(
      <ColorPaletteEditor
        {...baseProps}
        gradients={{ meshIntensity: 1.5 }}
        onGradientsChange={onGradientsChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Mesh intensity"), {
      target: { value: "" },
    });

    expect(onGradientsChange).toHaveBeenCalledWith({ meshIntensity: 1 });
  });
});
