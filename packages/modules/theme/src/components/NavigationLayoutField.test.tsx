// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { NavigationLayoutField } from "./NavigationLayoutField";

// This package has no global test setup, so RTL's auto-cleanup never registers.
afterEach(cleanup);

describe("NavigationLayoutField", () => {
  it("offers the three shell layouts and marks the current one", () => {
    render(<NavigationLayoutField value="vertical" onChange={vi.fn()} />);

    expect(screen.getByText("Sidebar")).toBeTruthy();
    expect(screen.getByText("Collapsed rail")).toBeTruthy();
    expect(screen.getByText("Top bar")).toBeTruthy();

    expect(
      screen.getByRole("button", { name: "Sidebar" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("emits the picked layout as its enum string value", () => {
    const onChange = vi.fn();
    render(<NavigationLayoutField value="vertical" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Top bar" }));
    expect(onChange).toHaveBeenCalledWith("horizontal");

    fireEvent.click(screen.getByRole("button", { name: "Collapsed rail" }));
    expect(onChange).toHaveBeenCalledWith("collapsed");
  });

  it("falls back to Sidebar when handed an unknown layout", () => {
    render(
      <NavigationLayoutField
        value={"diagonal" as never}
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Sidebar" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });
});
