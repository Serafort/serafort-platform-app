import { apiClient, FetchResponse, ENDPOINTS } from '@cap/platform-core'
import type {
  QueueTelemetryResponse,
  QueueJobsResponse,
  QueueJobState,
  QueueRetryJobResponse,
  QueueRetryFailedResponse,
} from '../types/queue.types'

/**
 * BullMQ queue telemetry.
 *
 * Like the audit chain, every route here is platform-scoped on the backend and
 * answers 403 `E_PLATFORM_SCOPE_REQUIRED` to a tenant-scoped admin — queues are
 * shared infrastructure carrying cross-tenant payloads.
 *
 * Note there is no "job detail" call: the backend never returns `job.data`,
 * because queue payloads hold recipient addresses, phone numbers and one-time
 * codes. What comes back is enough to diagnose a failure and nothing more.
 */
const queueTelemetryService = {
  /** Per-queue counts across the whole registry. */
  getQueues: (): Promise<FetchResponse<QueueTelemetryResponse>> => {
    return apiClient.get<QueueTelemetryResponse>(ENDPOINTS.admin.queues.index)
  },

  /** The jobs behind a count. Defaults to `failed`, the state worth acting on. */
  getJobs: (
    queue: string,
    params?: { state?: QueueJobState; start?: number; limit?: number },
  ): Promise<FetchResponse<QueueJobsResponse>> => {
    const search = new URLSearchParams()
    search.append('state', params?.state ?? 'failed')
    if (params?.start !== undefined) search.append('start', String(params.start))
    if (params?.limit !== undefined) search.append('limit', String(params.limit))
    return apiClient.get<QueueJobsResponse>(
      `${ENDPOINTS.admin.queues.jobs(queue)}?${search.toString()}`,
    )
  },

  /** Requeue one failed job. 409 if the job is not in a retryable state. */
  retryJob: (
    queue: string,
    jobId: string | number,
  ): Promise<FetchResponse<QueueRetryJobResponse>> => {
    return apiClient.post<QueueRetryJobResponse>(ENDPOINTS.admin.queues.retryJob(queue, jobId))
  },

  /**
   * Requeue the failed backlog. Capped at 100 per call on the backend and
   * throttled, because an unbounded requeue stampedes whatever caused the
   * failures. Read `truncated` in the response before reporting a clean drain.
   */
  retryFailed: (
    queue: string,
    limit?: number,
  ): Promise<FetchResponse<QueueRetryFailedResponse>> => {
    return apiClient.post<QueueRetryFailedResponse>(
      ENDPOINTS.admin.queues.retryFailed(queue),
      limit === undefined ? {} : { limit },
    )
  },
}

export default queueTelemetryService
