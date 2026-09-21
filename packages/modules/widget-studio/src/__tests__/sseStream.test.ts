// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { globalWidgetRegistry } from "@cap/platform-core";

/**
 * The SSE reducer is the module's largest state machine and, until now, its
 * only untested one: every agent transition, the DSL gate, the lifecycle and
 * the reconnection policy all live in `connectPipelineStream`.
 *
 * jsdom has no EventSource, which is convenient - the fake below is the seam
 * that lets a run be driven event by event, and lets a dropped connection be
 * simulated without a server.
 */

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  closed = false;

  constructor(public url: string) {
    FakeEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
  }

  /** Push one server event into the reducer. */
  emit(payload: unknown, lastEventId = "") {
    this.onmessage?.({
      data: JSON.stringify(payload),
      lastEventId,
    } as MessageEvent);
  }

  /** Simulate the socket dropping. */
  drop() {
    this.onerror?.(new Event("error"));
  }

  static get latest(): FakeEventSource {
    return FakeEventSource.instances[FakeEventSource.instances.length - 1];
  }

  static reset() {
    FakeEventSource.instances = [];
  }
}

const store = {
  selectedModel: "gemini-3.6-flash",
  widgetDrafts: [] as Array<{ id: string; agents: unknown[] }>,
  updateWidgetAgent: vi.fn(),
  appendAgentStream: vi.fn(),
  setWidgetDsl: vi.fn(),
  setWidgetLifecycle: vi.fn(),
  setWidgetStudioRunning: vi.fn(),
  setActiveRunId: vi.fn(),
  appendAuditEntry: vi.fn(),
};

vi.mock("@cap/platform-store", () => ({
  useAppStore: Object.assign(() => store, { getState: () => store }),
}));

const REGISTERED_ID = "dashboard-widget-revenueChart";

const validDsl = {
  id: "widget-1",
  name: "Revenue",
  version: "1.0.0",
  component: REGISTERED_ID,
  layout: { width: 4, height: 280 },
  props: {},
};

let connectPipelineStream: typeof import("../services/widgetAgentClient")["connectPipelineStream"];
let disconnectStream: typeof import("../services/widgetAgentClient")["disconnectStream"];

beforeEach(async () => {
  vi.useFakeTimers();
  FakeEventSource.reset();
  Object.values(store).forEach((v) => {
    if (typeof v === "function" && "mockClear" in v) v.mockClear();
  });
  (globalThis as { EventSource?: unknown }).EventSource = FakeEventSource;

  globalWidgetRegistry.register({
    id: REGISTERED_ID,
    titleKey: "test.revenue",
    Component: (() => null) as never,
  });

  const mod = await import("../services/widgetAgentClient");
  connectPipelineStream = mod.connectPipelineStream;
  disconnectStream = mod.disconnectStream;
});

afterEach(() => {
  vi.useRealTimers();
});

const connect = (overrides: Record<string, unknown> = {}) => {
  const onComplete = vi.fn();
  const onError = vi.fn();
  const stop = connectPipelineStream({
    runId: 7,
    draftId: "draft-1",
    prompt: "Revenue by region",
    onComplete,
    onError,
    maxRetries: 2,
    retryBaseMs: 1000,
    idleTimeoutMs: 10_000,
    ...overrides,
  });
  return { onComplete, onError, stop };
};

describe("agent events", () => {
  it("records the run so the UI can offer Stop, and clears it when done", () => {
    connect();
    expect(store.setActiveRunId).toHaveBeenCalledWith(7);

    FakeEventSource.latest.emit({ event: "run_completed", runId: 7 });
    expect(store.setActiveRunId).toHaveBeenLastCalledWith(null);
    expect(store.setWidgetStudioRunning).toHaveBeenLastCalledWith(false);
  });

  it("applies an agent status to the draft", () => {
    connect();
    FakeEventSource.latest.emit({
      event: "agent_status",
      agentId: "design",
      status: "running",
    });

    expect(store.updateWidgetAgent).toHaveBeenCalledWith(
      "draft-1",
      "design",
      expect.objectContaining({ status: "running" }),
    );
  });

  it("advances the lifecycle as agents finish", () => {
    connect();
    const source = FakeEventSource.latest;

    source.emit({ event: "agent_status", agentId: "requirement", status: "done" });
    expect(store.setWidgetLifecycle).toHaveBeenCalledWith("draft-1", "generated");

    source.emit({ event: "agent_status", agentId: "validation", status: "done" });
    expect(store.setWidgetLifecycle).toHaveBeenCalledWith("draft-1", "validated");

    source.emit({ event: "agent_status", agentId: "preview", status: "done" });
    expect(store.setWidgetLifecycle).toHaveBeenCalledWith("draft-1", "previewed");
  });

  it("appends streamed text to the agent that produced it", () => {
    connect();
    FakeEventSource.latest.emit({
      event: "stream_chunk",
      agentId: "component",
      text: '{"component":',
    });

    expect(store.appendAgentStream).toHaveBeenCalledWith(
      "draft-1",
      "component",
      '{"component":',
    );
  });

  it("ignores a malformed payload instead of killing the run", () => {
    const { onError } = connect();
    FakeEventSource.latest.onmessage?.({
      data: "{not json",
      lastEventId: "",
    } as MessageEvent);

    expect(onError).not.toHaveBeenCalled();
    expect(store.setWidgetStudioRunning).not.toHaveBeenCalledWith(false);
  });
});

describe("the DSL gate", () => {
  it("stores a widget that validates", () => {
    const { onComplete } = connect();
    FakeEventSource.latest.emit({
      event: "run_completed",
      runId: 7,
      dsl: validDsl,
    });

    expect(store.setWidgetDsl).toHaveBeenCalledWith(
      "draft-1",
      expect.objectContaining({ component: REGISTERED_ID }),
    );
    expect(store.setWidgetLifecycle).toHaveBeenLastCalledWith(
      "draft-1",
      "approved",
    );
    expect(onComplete).toHaveBeenCalled();
  });

  it("refuses a widget naming a component that is not registered", () => {
    const { onError, onComplete } = connect();
    FakeEventSource.latest.emit({
      event: "run_completed",
      runId: 7,
      dsl: { ...validDsl, component: "dashboard-widget-nope" },
    });

    expect(store.setWidgetDsl).not.toHaveBeenCalled();
    expect(store.updateWidgetAgent).toHaveBeenCalledWith(
      "draft-1",
      "validation",
      expect.objectContaining({ status: "error" }),
    );
    // The lifecycle must not advance: `canPublish` gates on it, so this is
    // what keeps the Publish button off.
    expect(store.setWidgetLifecycle).not.toHaveBeenCalledWith(
      "draft-1",
      "approved",
    );
    expect(onError).toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("ends the run when the component agent produces an unusable DSL", () => {
    const { onError } = connect();
    FakeEventSource.latest.emit({
      event: "agent_status",
      agentId: "component",
      status: "done",
      output: { dsl: { ...validDsl, layout: { width: 5, height: 42 } } },
    });

    expect(store.setWidgetDsl).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
    expect(FakeEventSource.latest.closed).toBe(true);
  });
});

describe("reconnection", () => {
  it("does not end the run on a single dropped connection", () => {
    const { onError } = connect();
    const first = FakeEventSource.latest;

    first.drop();
    expect(onError).not.toHaveBeenCalled();
    expect(FakeEventSource.instances).toHaveLength(1);

    vi.advanceTimersByTime(1000);
    expect(FakeEventSource.instances).toHaveLength(2);
    expect(FakeEventSource.latest).not.toBe(first);
  });

  it("backs off, doubling the wait between attempts", () => {
    connect();

    FakeEventSource.latest.drop();
    vi.advanceTimersByTime(999);
    expect(FakeEventSource.instances).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(FakeEventSource.instances).toHaveLength(2);

    FakeEventSource.latest.drop();
    vi.advanceTimersByTime(1999);
    expect(FakeEventSource.instances).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(FakeEventSource.instances).toHaveLength(3);
  });

  it("gives up once the budget is spent, and says so", () => {
    const { onError } = connect();

    FakeEventSource.latest.drop();
    vi.advanceTimersByTime(1000);
    FakeEventSource.latest.drop();
    vi.advanceTimersByTime(2000);
    FakeEventSource.latest.drop();

    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining("2 reconnection attempts"),
    );
    expect(store.setWidgetStudioRunning).toHaveBeenLastCalledWith(false);
  });

  it("resets the budget after the connection proves healthy", () => {
    const { onError } = connect();

    FakeEventSource.latest.drop();
    vi.advanceTimersByTime(1000);
    // One good event is enough to say the connection recovered.
    FakeEventSource.latest.emit({ event: "connected" });

    FakeEventSource.latest.drop();
    vi.advanceTimersByTime(1000);
    FakeEventSource.latest.drop();
    vi.advanceTimersByTime(2000);

    expect(onError).not.toHaveBeenCalled();
  });

  it("treats a silent stream as a dropped one", () => {
    // The case `onerror` never fires for: a half-open socket. The run used to
    // sit at whichever agent it had reached, with the panel stuck on Running.
    connect();
    expect(FakeEventSource.instances).toHaveLength(1);

    vi.advanceTimersByTime(10_000);
    vi.advanceTimersByTime(1000);
    expect(FakeEventSource.instances).toHaveLength(2);
  });

  it("keeps quiet while events keep arriving", () => {
    connect();
    for (let i = 0; i < 3; i++) {
      vi.advanceTimersByTime(9000);
      FakeEventSource.latest.emit({ event: "connected" });
    }

    vi.advanceTimersByTime(1000);
    expect(FakeEventSource.instances).toHaveLength(1);
  });

  it("offers the last event id back so a server can resume", () => {
    connect();
    FakeEventSource.latest.emit({ event: "connected" }, "42");
    FakeEventSource.latest.drop();
    vi.advanceTimersByTime(1000);

    expect(FakeEventSource.latest.url).toContain("lastEventId=42");
  });
});

describe("stopping", () => {
  it("cancels a pending retry, so a stopped run stays stopped", () => {
    const { stop } = connect();
    FakeEventSource.latest.drop();

    stop();
    vi.advanceTimersByTime(60_000);

    expect(FakeEventSource.instances).toHaveLength(1);
    expect(store.setActiveRunId).toHaveBeenLastCalledWith(null);
  });

  it("disconnectStream closes the live stream by run id", () => {
    connect();
    disconnectStream(7);

    expect(FakeEventSource.latest.closed).toBe(true);
    vi.advanceTimersByTime(60_000);
    expect(FakeEventSource.instances).toHaveLength(1);
  });

  it("stops the watchdog too, so a completed run never reconnects", () => {
    connect();
    FakeEventSource.latest.emit({ event: "run_completed", runId: 7 });

    vi.advanceTimersByTime(60_000);
    expect(FakeEventSource.instances).toHaveLength(1);
  });
});
