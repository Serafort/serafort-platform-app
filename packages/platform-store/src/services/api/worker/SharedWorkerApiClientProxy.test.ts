import { describe, it, expect, vi, beforeEach } from "vitest";
import { SharedApiService } from "./api.shared-worker";

describe("SharedApiService & Deduplication", () => {
  let service: SharedApiService;
  let fetchSpy: any;

  beforeEach(() => {
    service = new SharedApiService();
    fetchSpy = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ success: true, items: [1, 2, 3] }),
      }),
    );
    global.fetch = fetchSpy;
  });

  it("stores and attaches tenant ID and auth token to request headers", async () => {
    service.setTenantId("tenant-xyz");
    service.setAuthToken("bearer-abc");

    expect(service.getTenantId()).toBe("tenant-xyz");
    expect(service.getAuthToken()).toBe("bearer-abc");

    await service.executeRequest({
      url: "https://api.example.com/data",
      method: "GET",
      headers: {},
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const callHeaders = fetchSpy.mock.calls[0][1].headers;
    expect(callHeaders["X-Tenant-Id"]).toBe("tenant-xyz");
    expect(callHeaders["Authorization"]).toBe("Bearer bearer-abc");
  });

  it("deduplicates identical in-flight GET requests", async () => {
    let resolveFetch: (val: any) => void;
    const slowFetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    fetchSpy.mockImplementation(() => slowFetchPromise);

    // Tab 1 triggers request
    const req1 = service.executeRequest({
      url: "https://api.example.com/users",
      method: "GET",
      headers: {},
    });

    // Tab 2 triggers identical request while req1 is in-flight
    const req2 = service.executeRequest({
      url: "https://api.example.com/users",
      method: "GET",
      headers: {},
    });

    // Network call should only happen ONCE
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Resolve the single network request
    resolveFetch!({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve([{ id: 1, name: "Alice" }]),
    });

    const [res1, res2] = await Promise.all([req1, req2]);

    // Both tabs receive the exact same response
    expect(res1.data).toEqual([{ id: 1, name: "Alice" }]);
    expect(res2.data).toEqual([{ id: 1, name: "Alice" }]);
  });

  it("does NOT deduplicate POST requests", async () => {
    service.executeRequest({
      url: "https://api.example.com/submit",
      method: "POST",
      headers: {},
      body: JSON.stringify({ a: 1 }),
    });

    service.executeRequest({
      url: "https://api.example.com/submit",
      method: "POST",
      headers: {},
      body: JSON.stringify({ a: 1 }),
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
