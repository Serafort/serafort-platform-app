import { describe, it, expect, vi, beforeEach } from "vitest";
import { WorkerApiClientProxy } from "./WorkerApiClientProxy";

describe("WorkerApiClientProxy", () => {
  let mockWorker: {
    postMessage: ReturnType<typeof vi.fn>;
    terminate: ReturnType<typeof vi.fn>;
    onmessage: ((event: MessageEvent) => void) | null;
    onerror: ((error: ErrorEvent) => void) | null;
  };

  beforeEach(() => {
    mockWorker = {
      postMessage: vi.fn(),
      terminate: vi.fn(),
      onmessage: null,
      onerror: null,
    };
  });

  it("sends sync tenant message to worker", () => {
    const proxy = new WorkerApiClientProxy(mockWorker as any);
    proxy.syncTenantId("tenant-123");

    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      id: "sync-tenant",
      type: "SYNC_STATE",
      payload: { tenantId: "tenant-123" },
    });
  });

  it("sends sync auth token message to worker", () => {
    const proxy = new WorkerApiClientProxy(mockWorker as any);
    proxy.syncAuthToken("jwt-token-456");

    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      id: "sync-auth",
      type: "SYNC_STATE",
      payload: { authToken: "jwt-token-456" },
    });
  });

  it("dispatches request to worker and resolves response", async () => {
    const proxy = new WorkerApiClientProxy(mockWorker as any);

    const promise = proxy.get("/api/users");

    expect(mockWorker.postMessage).toHaveBeenCalledTimes(1);
    const callArgs = mockWorker.postMessage.mock.calls[0][0];
    expect(callArgs.type).toBe("REQUEST");
    expect(callArgs.payload.url).toBe("/api/users");
    expect(callArgs.payload.method).toBe("GET");

    const requestId = callArgs.id;

    // Simulate worker returning successful response
    mockWorker.onmessage!({
      data: {
        id: requestId,
        ok: true,
        status: 200,
        statusText: "OK",
        data: [{ id: 1, name: "Alice" }],
        headers: { "content-type": "application/json" },
      },
    } as any);

    const response = await promise;
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data).toEqual([{ id: 1, name: "Alice" }]);
  });

  it("rejects promise on worker network error", async () => {
    const proxy = new WorkerApiClientProxy(mockWorker as any);

    const promise = proxy.post("/api/data", { foo: "bar" });

    const callArgs = mockWorker.postMessage.mock.calls[0][0];
    const requestId = callArgs.id;

    // Simulate worker responding with error
    mockWorker.onmessage!({
      data: {
        id: requestId,
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        data: null,
        headers: {},
        error: "Database connection failed",
      },
    } as any);

    await expect(promise).rejects.toThrow("Database connection failed");
  });

  it("terminates worker correctly", () => {
    const proxy = new WorkerApiClientProxy(mockWorker as any);
    proxy.terminate();
    expect(mockWorker.terminate).toHaveBeenCalledTimes(1);
  });
});
