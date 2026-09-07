/**
 * Widget Agent Client — Communicates with the backend AI Widget Pipeline via SSE.
 */
import type {
  WidgetDefinition,
  AgentId,
  WidgetAuditEntry,
} from "@cap/shared-types";
import { useAppStore } from "@cap/platform-store";
import {
  describeValidationFailure,
  resolveGeneratedDsl,
} from "../agents/ValidationAgent";
import {
  adoptServerAuditEntries,
  buildClientAuditEntry,
} from "../agents/auditTrail";
import type {
  PipelineRunOptions,
  PipelineRunResponse,
} from "../agents/pipeline";

/** Kept as aliases: the wire shape is defined once, in ../agents/pipeline. */
export type BackendGenerateRequest = PipelineRunOptions & {
  userId?: string | number;
  apiKey?: string;
};
export type BackendGenerateResponse = PipelineRunResponse;

export interface SSEPipelineEvent {
  runId: number;
  event: string;
  timestamp: string;
  agentId?: AgentId;
  status?: "idle" | "running" | "done" | "error";
  text?: string;
  output?: unknown;
  error?: string;
  dsl?: WidgetDefinition;
  stages?: Record<string, unknown>;
  /** Audit entries authored by the backend for this run, when it sends them. */
  audit?: unknown;
}

export interface ConnectStreamOptions {
  runId: number;
  draftId: string;
  prompt?: string;
  userId?: string | number;
  autoPublish?: boolean;
  onComplete?: (dsl?: WidgetDefinition) => void;
  onError?: (err: string) => void;
  /** How many times to reconnect before giving up (default 4). */
  maxRetries?: number;
  /** First backoff step in ms; doubles each attempt (default 1000). */
  retryBaseMs?: number;
  /** Silence for this long is treated as a dropped connection (default 45s). */
  idleTimeoutMs?: number;
}

/** Reconnection budget. A run is minutes long; a blip is seconds. */
export const STREAM_DEFAULTS = {
  maxRetries: 4,
  retryBaseMs: 1000,
  /**
   * An agent can legitimately think for a while, so this is deliberately
   * generous: it is here to end a run that will never speak again, not to
   * police pace.
   */
  idleTimeoutMs: 45_000,
} as const;

/**
 * Resolve the API base URL from Vite environment.
 */
export function getApiBaseUrl(): string {
  const env = (
    import.meta as ImportMeta & { env: Record<string, string | undefined> }
  ).env;
  const envUrl = env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }
  if (env.PROD || env.NODE_ENV === "production") {
    return typeof window !== "undefined" ? window.location.origin : "";
  }
  return "http://localhost:3333";
}

/**
 * Live runs, keyed by run id. The value is a controller rather than the
 * EventSource itself: a stream can now be between attempts, with no socket
 * open but a retry pending, and closing it has to cancel that too.
 */
interface StreamController {
  close: () => void;
}

const activeStreams = new Map<number, StreamController>();

/**
 * Disconnect an active SSE stream by run ID, cancelling any pending retry.
 */
export function disconnectStream(runId: number): void {
  const stream = activeStreams.get(runId);
  if (stream) {
    stream.close();
    activeStreams.delete(runId);
  }
}

/**
 * Connect to an active backend SSE stream for an agent run and dispatch milestones into Zustand.
 */
export function connectPipelineStream(
  options: ConnectStreamOptions,
): () => void {
  const {
    runId,
    draftId,
    prompt = "",
    userId = "anonymous",
    autoPublish = false,
    onComplete,
    onError,
  } = options;
  const store = useAppStore.getState();
  const baseUrl = getApiBaseUrl();
  const sseUrl = `${baseUrl}/api/v1/sse/agent-runs/${runId}`;

  let finalDsl: WidgetDefinition | undefined;

  /**
   * The security gate, on the one path a DSL can reach the store by.
   *
   * `validateWidgetDsl` is described in ValidationAgent.ts as "Agent 4/6 -
   * Security Layer 3 (Core Security Gate)", but until now nothing called it
   * outside its own tests: generated DSL went through `sanitizeWidgetDsl`
   * straight into the store and on to the renderer, so an unregistered
   * component, an off-grid size or a malformed version was accepted in the
   * running app while the unit tests said otherwise.
   *
   * Returns the DSL when it is safe to store, or null after recording why not.
   */
  const commitDsl = (
    rawDsl: unknown,
    opts: { draftId: string; fallbackName: string },
  ): WidgetDefinition | null => {
    const { dsl, validation } = resolveGeneratedDsl(rawDsl, {
      fallbackName: opts.fallbackName,
    });

    if (!validation.isValid) {
      store.updateWidgetAgent(opts.draftId, "validation", {
        status: "error",
        error: describeValidationFailure(validation),
        completedAt: new Date().toISOString(),
        output: validation,
      });
      return null;
    }

    store.setWidgetDsl(opts.draftId, dsl);
    return dsl;
  };

  const maxRetries = options.maxRetries ?? STREAM_DEFAULTS.maxRetries;
  const retryBaseMs = options.retryBaseMs ?? STREAM_DEFAULTS.retryBaseMs;
  const idleTimeoutMs = options.idleTimeoutMs ?? STREAM_DEFAULTS.idleTimeoutMs;

  let source: EventSource | null = null;
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let attempt = 0;
  let settled = false;
  let lastEventId: string | undefined;

  const clearTimers = () => {
    if (idleTimer) clearTimeout(idleTimer);
    if (retryTimer) clearTimeout(retryTimer);
    idleTimer = undefined;
    retryTimer = undefined;
  };

  /** Tear everything down. `settled` stops any in-flight retry from firing. */
  const teardown = () => {
    settled = true;
    clearTimers();
    source?.close();
    source = null;
    activeStreams.delete(runId);
    store.setActiveRunId(null);
  };

  const finish = (dsl?: WidgetDefinition) => {
    teardown();
    store.setWidgetStudioRunning(false);
    onComplete?.(dsl);
  };

  const fail = (message: string) => {
    teardown();
    store.setWidgetStudioRunning(false);
    onError?.(message);
  };

  /**
   * A dropped or silent connection is not the end of a run: the run lives on
   * the server and keeps going. Reconnect with a doubling backoff, and only
   * give up once the budget is spent - one transient blip used to end the run
   * with "Connection to server stream interrupted" and leave the draft frozen
   * at whichever agent it had reached.
   */
  const reconnect = (reason: string) => {
    if (settled) return;
    clearTimers();
    source?.close();
    source = null;

    if (attempt >= maxRetries) {
      fail(`${reason} after ${maxRetries} reconnection attempts`);
      return;
    }

    const delay = retryBaseMs * 2 ** attempt;
    attempt += 1;
    retryTimer = setTimeout(() => {
      retryTimer = undefined;
      open();
    }, delay);
  };

  /**
   * Silence is indistinguishable from a half-open socket, which is the case
   * `onerror` never fires for - the run stalls and `widgetStudioRunning`
   * stays true forever. Treat a long enough silence as a dropped connection.
   */
  const armIdleWatchdog = () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      idleTimer = undefined;
      reconnect("The run stopped sending updates");
    }, idleTimeoutMs);
  };

  const handleMessage = (msgEvent: MessageEvent) => {
    // Any traffic means the connection is healthy: reset the backoff and the
    // watchdog before doing anything with the payload.
    attempt = 0;
    armIdleWatchdog();
    if (msgEvent.lastEventId) lastEventId = msgEvent.lastEventId;
    try {
      const payload: SSEPipelineEvent = JSON.parse(msgEvent.data);

      switch (payload.event) {
        case "connected":
          // SSE stream connected
          break;

        case "agent_status": {
          const agentId = payload.agentId;
          if (agentId) {
            store.updateWidgetAgent(draftId, agentId, {
              status: payload.status || "running",
              startedAt:
                payload.status === "running"
                  ? new Date().toISOString()
                  : undefined,
              completedAt: ["done", "error"].includes(payload.status || "")
                ? new Date().toISOString()
                : undefined,
              output: payload.output,
              error: payload.error,
            });

            if (agentId === "requirement" && payload.status === "done") {
              store.setWidgetLifecycle(draftId, "generated");
            } else if (
              agentId === "component" &&
              payload.status === "done" &&
              payload.output
            ) {
              const compOut = payload.output as Record<string, unknown>;
              if (compOut?.dsl) {
                const accepted = commitDsl(compOut.dsl, {
                  draftId,
                  fallbackName: prompt.slice(0, 60),
                });
                if (accepted) {
                  finalDsl = accepted;
                } else {
                  // Nothing downstream can rescue a widget that will not
                  // render, and leaving the stream open would let the idle
                  // watchdog try to reconnect a run we have already given up
                  // on.
                  fail("The generated widget failed validation");
                  return;
                }
              }
            } else if (agentId === "validation" && payload.status === "done") {
              store.setWidgetLifecycle(draftId, "validated");
            } else if (agentId === "preview" && payload.status === "done") {
              store.setWidgetLifecycle(draftId, "previewed");
            } else if (agentId === "publish" && payload.status === "done") {
              store.setWidgetLifecycle(draftId, "published");
            }
          }
          break;
        }

        case "stream_chunk": {
          if (payload.agentId && payload.text) {
            store.appendAgentStream(draftId, payload.agentId, payload.text);
          }
          break;
        }

        case "run_completed": {
          if (payload.dsl) {
            const accepted = commitDsl(payload.dsl, {
              draftId,
              fallbackName: prompt.slice(0, 60),
            });
            if (!accepted) {
              // The run finished but its widget cannot be rendered. The
              // lifecycle is deliberately not advanced: `canPublish` in the
              // panel gates on it, so staying put is what blocks publishing.
              fail("The generated widget failed validation");
              return;
            }
            finalDsl = accepted;
          }

          if (autoPublish) {
            store.setWidgetLifecycle(draftId, "published");
            if (finalDsl) {
              // The backend's own record wins when it sends one: it is the
              // only half of this trail that is evidence.
              const attested = adoptServerAuditEntries(payload.audit, {
                runId,
                widgetId: finalDsl.id,
              });
              const entries = attested.length
                ? attested
                : [
                    buildClientAuditEntry({
                      dsl: finalDsl,
                      action: "published",
                      runId,
                    }),
                  ];
              for (const entry of entries) {
                store.appendAuditEntry(draftId, entry);
              }
            }
          } else {
            store.setWidgetLifecycle(draftId, "approved");
          }

          finish(finalDsl);
          break;
        }

        case "run_failed":
        case "run_cancelled": {
          fail(payload.error || "Agent pipeline execution failed on backend");
          break;
        }

        default:
          break;
      }
    } catch (parseErr) {
      console.warn("[widgetAgentClient] Failed to parse SSE event:", parseErr);
    }
  };

  /**
   * Open (or re-open) the stream. `lastEventId` is passed back so a server
   * that supports resumption can pick up where it left off; one that ignores
   * it simply replays from its own position.
   */
  function open() {
    if (settled) return;
    const url = lastEventId
      ? `${sseUrl}?lastEventId=${encodeURIComponent(lastEventId)}`
      : sseUrl;

    source = new EventSource(url);
    source.onmessage = handleMessage;
    source.onerror = () => {
      reconnect("Connection to the run was interrupted");
    };
    armIdleWatchdog();
  }

  activeStreams.set(runId, { close: teardown });
  store.setActiveRunId(runId);
  open();

  // Return unsubscribe / abort function
  return teardown;
}

/**
 * Starting and cancelling a run live in ../agents/pipeline, so there is one
 * request builder rather than three. They are exported from the package
 * barrel (src/index.ts) directly from that module: re-exporting them here
 * made services/ and agents/ import each other at runtime, a real value cycle.
 */
