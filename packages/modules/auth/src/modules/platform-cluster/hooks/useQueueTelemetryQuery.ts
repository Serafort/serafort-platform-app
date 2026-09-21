import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import queueTelemetryService from '../services/queue-telemetry.service'
import type {
  QueueTelemetryResponse,
  QueueJobsResponse,
  QueueJobState,
  QueueRetryJobResponse,
  QueueRetryFailedResponse,
} from '../types/queue.types'

export const QUEUE_TELEMETRY_KEYS = {
  all: ['admin', 'queues'] as const,
  index: () => [...QUEUE_TELEMETRY_KEYS.all, 'index'] as const,
  jobs: (queue: string, state: QueueJobState) =>
    [...QUEUE_TELEMETRY_KEYS.all, queue, 'jobs', state] as const,
}

/**
 * Per-queue counts.
 *
 * Polled every 15 seconds — this is the screen an operator leaves open while
 * draining a backlog, and a stale `failed` count is the one number that must
 * not lag. The call is a handful of Redis `getJobCounts` reads, so the interval
 * is cheap.
 */
export function useQueueTelemetryQuery(enabled = true) {
  return useQuery({
    queryKey: QUEUE_TELEMETRY_KEYS.index(),
    queryFn: async () => {
      const response = await queueTelemetryService.getQueues()
      return response.data as QueueTelemetryResponse
    },
    enabled,
    staleTime: 10_000,
    refetchInterval: 15_000,
    retry: false,
  })
}

/**
 * The jobs behind one count. Only fetched when a queue is selected, because
 * fetching every queue's job list to render a summary table would multiply the
 * Redis reads for data nobody is looking at.
 */
export function useQueueJobsQuery(
  queue: string | null,
  state: QueueJobState = 'failed',
  limit = 25,
) {
  return useQuery({
    queryKey: QUEUE_TELEMETRY_KEYS.jobs(queue ?? '', state),
    queryFn: async () => {
      const response = await queueTelemetryService.getJobs(queue as string, { state, limit })
      return response.data as QueueJobsResponse
    },
    enabled: Boolean(queue),
    staleTime: 10_000,
    retry: false,
  })
}

/**
 * Requeue one job. Invalidates both the counts and the job list: a successful
 * retry moves the job out of `failed`, so leaving either cached would show it
 * still sitting there.
 */
export function useRetryQueueJobMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vars: { queue: string; jobId: string }) => {
      const response = await queueTelemetryService.retryJob(vars.queue, vars.jobId)
      return response.data as QueueRetryJobResponse
    },
    retry: false,
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: QUEUE_TELEMETRY_KEYS.index() })
      queryClient.invalidateQueries({
        queryKey: [...QUEUE_TELEMETRY_KEYS.all, vars.queue, 'jobs'],
      })
    },
  })
}

/**
 * Requeue the failed backlog. Bounded and throttled on the backend; the caller
 * must read `truncated` from the result before telling the operator the queue
 * is drained.
 */
export function useRetryFailedQueueMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vars: { queue: string; limit?: number }) => {
      const response = await queueTelemetryService.retryFailed(vars.queue, vars.limit)
      return response.data as QueueRetryFailedResponse
    },
    retry: false,
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: QUEUE_TELEMETRY_KEYS.index() })
      queryClient.invalidateQueries({
        queryKey: [...QUEUE_TELEMETRY_KEYS.all, vars.queue, 'jobs'],
      })
    },
  })
}
