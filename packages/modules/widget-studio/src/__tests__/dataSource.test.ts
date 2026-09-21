// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

const get = vi.fn();

vi.mock("@cap/platform-core", () => ({
  apiClient: { get: (...args: unknown[]) => get(...args) },
  globalWidgetRegistry: { getAll: () => [], get: () => undefined },
}));

import {
  DataSourceError,
  dataSourceKey,
  describeBindingProblem,
  resolveDataSource,
} from "../data/dataSourceRuntime";

beforeEach(() => {
  get.mockReset();
  get.mockResolvedValue({ data: { rows: [1, 2, 3] } });
});

describe("binding validation", () => {
  it("passes a binding that can resolve", () => {
    expect(
      describeBindingProblem({ provider: "rest", config: { path: "/api/x" } }),
    ).toBeNull();
    expect(
      describeBindingProblem({ provider: "static", config: { data: [] } }),
    ).toBeNull();
  });

  it("names a provider the platform does not serve", () => {
    expect(describeBindingProblem({ provider: "s3" })).toContain("s3");
  });

  it("says what each provider is missing", () => {
    expect(describeBindingProblem({ provider: "static" })).toContain(
      "config.data",
    );
    expect(describeBindingProblem({ provider: "rest", config: {} })).toContain(
      "config.path",
    );
    expect(
      describeBindingProblem({ provider: "dashboard-metrics", config: {} }),
    ).toContain("config.metric");
    expect(
      describeBindingProblem({ provider: "tenant-analytics", config: {} }),
    ).toContain("config.report");
  });

  it("treats no binding as no problem", () => {
    expect(describeBindingProblem(undefined)).toBeNull();
  });
});

describe("path safety", () => {
  // Bindings are written by a language model, so the path is untrusted input.
  it.each([
    ["https://evil.example/steal", "an absolute url"],
    ["//evil.example/steal", "a protocol-relative url"],
    ["/api/../../etc/passwd", "traversal"],
    ["api/v1/metrics", "no leading slash"],
  ])("refuses %s (%s)", (path) => {
    expect(
      describeBindingProblem({ provider: "rest", config: { path } }),
    ).toContain("config.path");
  });

  it("never reaches the network for a path it refused", async () => {
    await expect(
      resolveDataSource({
        provider: "rest",
        config: { path: "https://evil.example" },
      }),
    ).rejects.toBeInstanceOf(DataSourceError);
    expect(get).not.toHaveBeenCalled();
  });
});

describe("resolving", () => {
  it("reads a static binding without any request", async () => {
    const result = await resolveDataSource({
      provider: "static",
      config: { data: { total: 42 } },
    });

    expect(result.data).toEqual({ total: 42 });
    expect(result.origin).toBe("inline");
    expect(get).not.toHaveBeenCalled();
  });

  it("fetches a rest binding from its path", async () => {
    const result = await resolveDataSource({
      provider: "rest",
      config: { path: "/api/v1/revenue", params: { range: "12m" } },
    });

    expect(get).toHaveBeenCalledWith(
      "/api/v1/revenue?range=12m",
      expect.anything(),
    );
    expect(result.data).toEqual({ rows: [1, 2, 3] });
    expect(result.origin).toBe("network");
  });

  it("sends a metric binding to the metrics endpoint", async () => {
    await resolveDataSource({
      provider: "dashboard-metrics",
      config: { metric: "mrr" },
    });

    const [url] = get.mock.calls[0];
    expect(url).toContain("/api/v1/dashboard/metrics");
    expect(url).toContain("metric=mrr");
  });

  it("reports a network failure as one, rather than as empty data", async () => {
    get.mockRejectedValue(new Error("503 Service Unavailable"));

    await expect(
      resolveDataSource({ provider: "rest", config: { path: "/api/v1/x" } }),
    ).rejects.toMatchObject({ kind: "network" });
  });

  it("rejects an unusable config before requesting anything", async () => {
    await expect(
      resolveDataSource({ provider: "static", config: {} }),
    ).rejects.toMatchObject({ kind: "config" });
    expect(get).not.toHaveBeenCalled();
  });
});

describe("cache keys", () => {
  it("distinguishes bindings that would return different data", () => {
    const a = dataSourceKey({ provider: "rest", config: { path: "/a" } });
    const b = dataSourceKey({ provider: "rest", config: { path: "/b" } });
    expect(a).not.toBe(b);
  });

  it("is stable for the same binding", () => {
    const binding = { provider: "rest", config: { path: "/a" } };
    expect(dataSourceKey(binding)).toBe(dataSourceKey({ ...binding }));
  });
});
