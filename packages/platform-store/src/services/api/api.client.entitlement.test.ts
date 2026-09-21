import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  apiClient,
  onEntitlementRequired,
  setGlobalNotificationHandler,
} from "./api.client";

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("402 feature_not_entitled handling", () => {
  const notifications = vi.fn();
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    notifications.mockReset();
    setGlobalNotificationHandler(notifications);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("hands a recognised 402 to subscribers and suppresses the generic warning", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(402, {
        error: "feature_not_entitled",
        feature: "allow_scim",
        required_plan: "pro",
        upgrade_url: "/dashboard/billing/upgrade",
      }),
    );
    const handler = vi.fn();
    const off = onEntitlementRequired(handler);

    await expect(apiClient.get("/api/v1/scim/tokens")).rejects.toMatchObject({
      status: 402,
    });

    off();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ feature: "allow_scim", required_plan: "pro" }),
    );
    expect(notifications).not.toHaveBeenCalled();
    // Never retried: the plan is what is missing, not the session.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("ignores a 402 that does not carry the entitlement payload", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(402, { error: "something_else" }));
    const handler = vi.fn();
    const off = onEntitlementRequired(handler);

    await expect(apiClient.get("/api/v1/anything")).rejects.toMatchObject({
      status: 402,
    });

    off();
    expect(handler).not.toHaveBeenCalled();
    expect(notifications).toHaveBeenCalledTimes(1);
  });

  it("rejects an unknown feature or plan instead of surfacing it", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(402, {
        error: "feature_not_entitled",
        feature: "<script>",
        required_plan: "pro",
      }),
    );
    const handler = vi.fn();
    const off = onEntitlementRequired(handler);

    await expect(apiClient.get("/api/v1/anything")).rejects.toBeDefined();

    off();
    expect(handler).not.toHaveBeenCalled();
  });

  it("keeps the generic warning when nobody subscribed", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(402, {
        error: "feature_not_entitled",
        feature: "allow_jit",
        required_plan: "enterprise",
      }),
    );

    await expect(apiClient.get("/api/v1/anything")).rejects.toBeDefined();

    expect(notifications).toHaveBeenCalledTimes(1);
  });

  it("does not let a throwing subscriber mask the 402", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(402, {
        error: "feature_not_entitled",
        feature: "allow_saml_sso",
        required_plan: "pro",
      }),
    );
    const off = onEntitlementRequired(() => {
      throw new Error("boom");
    });

    await expect(apiClient.get("/api/v1/anything")).rejects.toMatchObject({
      status: 402,
    });
    off();
  });
});
