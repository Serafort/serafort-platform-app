/**
 * BullMQ queue telemetry types.
 *
 * Mirrors `QueueTelemetryController`. Two properties of that surface drive the
 * dashboard's design:
 *
 * - Job **payloads are never returned**. The backend serialises id, name,
 *   attempts, timings and `failedReason` only, because queue data carries
 *   recipient addresses, phone numbers and one-time codes across every tenant.
 *   There is deliberately no `data` field to render.
 * - A queue whose worker is disabled still accepts jobs. A rising `waiting`
 *   count there is expected, not an incident, so `workerEnabled` has to be read
 *   alongside the counts or the dashboard cries wolf on every dark subsystem.
 */

export interface QueueJobCounts {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

export interface QueueSummary {
  /** Stable queue name used in URLs, e.g. `user-erasure`. */
  name: string;
  description: string;
  /**
   * The `config/features` flag governing whether this queue's worker boots, or
   * null for a core queue that always runs.
   */
  featureFlag: string | null;
  workerEnabled: boolean;
  /** False when the queue could not be reached — Redis down, or not registered. */
  reachable: boolean;
  paused: boolean | null;
  counts: QueueJobCounts | null;
  error: string | null;
}

export interface QueueTelemetryResponse {
  queues: QueueSummary[];
  totals: Omit<QueueJobCounts, "paused">;
  unreachable: number;
  timestamp: string;
}

export type QueueJobState = "failed" | "waiting" | "active" | "delayed";

/** Note the absence of `data` — see the module comment. */
export interface QueueJob {
  id: string;
  name: string;
  attemptsMade: number;
  timestamp: number | null;
  processedOn: number | null;
  finishedOn: number | null;
  failedReason: string | null;
}

export interface QueueJobsResponse {
  queue: string;
  state: QueueJobState;
  data: QueueJob[];
  meta: { start: number; limit: number };
}

export interface QueueRetryJobResponse {
  queue: string;
  jobId: string;
  retried: boolean;
}

export interface QueueRetryFailedResponse {
  queue: string;
  retried: number;
  remaining: number;
  /**
   * True when the per-call cap, not the backlog, ended the run. The UI must say
   * "press again" rather than reporting a clean drain.
   */
  truncated: boolean;
  errors: Array<{ jobId: string; error: string }>;
}

/**
 * Whether a queue's numbers warrant attention, given that a dark subsystem's
 * backlog is expected. Kept next to the types so the dashboard and its tests
 * agree on one definition of "unhealthy".
 */
export function queueSeverity(
  queue: QueueSummary,
): "healthy" | "warning" | "error" | "idle" {
  if (!queue.reachable) return "error";
  if (!queue.counts) return "idle";
  if (queue.counts.failed > 0) return "error";
  // A backlog on a queue nothing is draining is the configured state, not a
  // fault — flagging it would make every dark subsystem look broken.
  if (!queue.workerEnabled) return "idle";
  if (queue.paused) return "warning";
  if (queue.counts.waiting > 0) return "warning";
  return "healthy";
}
