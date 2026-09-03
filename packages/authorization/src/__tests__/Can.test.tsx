import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Can } from "../enforcement/Can";
import { policyEngine } from "../engine/engine";
import { useAppStore } from "@cap/platform-store";

describe("Can Component", () => {
  beforeEach(() => {
    policyEngine.setPolicySet({
      version: "1.0.0",
      defaultEffect: "deny",
      policies: [
        {
          id: "ui-policy",
          rules: [
            {
              effect: "allow",
              permissions: ["delete:users"],
              actions: ["delete"],
              resources: ["user-card"],
            },
          ],
        },
      ],
    });
  });

  it("renders children if action is allowed", () => {
    useAppStore.setState({
      isAuthenticated: true,
      user: {
        id: 1,
        email: "mgr@test.com",
        role: "admin",
        permissions: ["delete:users"],
      } as any,
    });

    render(
      <Can action="delete" resource={{ type: "user-card" }}>
        <button>Delete User</button>
      </Can>,
    );

    expect(screen.getByText("Delete User")).toBeDefined();
  });

  it("renders fallback or nothing if action is denied", () => {
    useAppStore.setState({
      isAuthenticated: true,
      user: {
        id: 2,
        email: "user@test.com",
        role: "user",
        permissions: [],
      } as any,
    });

    render(
      <Can
        action="delete"
        resource={{ type: "user-card" }}
        fallback={<span>No permission</span>}
      >
        <button>Delete User</button>
      </Can>,
    );

    expect(screen.queryByText("Delete User")).toBeNull();
    expect(screen.getByText("No permission")).toBeDefined();
  });
});
