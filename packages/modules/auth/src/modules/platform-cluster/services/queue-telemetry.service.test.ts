import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@cap/platform-core'
import queueTelemetryService from './queue-telemetry.service'
import { queueSeverity, type QueueSummary } from '../types/queue.types'

vi.mock('@cap/platform-core', async () => {
  const actual = await vi.importActual('@cap/platform-core')
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }
})

const createMockResponse = (data: any) => ({
  data,
  status: 200,
  statusText: 'OK',
  ok: true,
  headers: new Headers(),
  config: {} as any,
})

describe('queueTelemetryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reads all queue counts from one call', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      createMockResponse({ queues: [], totals: {}, unreachable: 0 }),
    )

    await queueTelemetryService.getQueues()

    expect(apiClient.get).toHaveBeenCalledWith('/api/admin/queues')
  })

  it('defaults the job listing to the failed state', async () => {
    // `failed` is the only state an operator has to act on; defaulting to
    // anything else would open the drawer on jobs that are working fine.
    vi.mocked(apiClient.get).mockResolvedValueOnce(createMockResponse({ data: [] }))

    await queueTelemetryService.getJobs('user-erasure')

    expect(apiClient.get).toHaveBeenCalledWith('/api/admin/queues/user-erasure/jobs?state=failed')
  })

  it('builds the per-job retry path', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(createMockResponse({ retried: true }))

    await queueTelemetryService.retryJob('scim-sync', '42')

    expect(apiClient.post).toHaveBeenCalledWith('/api/admin/queues/scim-sync/jobs/42/retry')
  })

  it('sends no limit when the caller did not choose one', async () => {
    // An absent limit lets the backend apply its own cap. Sending a made-up
    // number here would silently override that ceiling.
    vi.mocked(apiClient.post).mockResolvedValueOnce(createMockResponse({ retried: 0 }))

    await queueTelemetryService.retryFailed('audit-exports')

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/admin/queues/audit-exports/retry-failed',
      {},
    )
  })
})

describe('queueSeverity', () => {
  const base: QueueSummary = {
    name: 'email-otp',
    description: 'Email one-time passcodes',
    featureFlag: null,
    workerEnabled: true,
    reachable: true,
    paused: false,
    counts: { waiting: 0, active: 0, completed: 10, failed: 0, delayed: 0, paused: 0 },
    error: null,
  }

  it('is healthy when nothing is waiting or failed', () => {
    expect(queueSeverity(base)).toBe('healthy')
  })

  it('is an error when a job has failed', () => {
    expect(queueSeverity({ ...base, counts: { ...base.counts!, failed: 1 } })).toBe('error')
  })

  it('is an error when the queue cannot be reached', () => {
    expect(queueSeverity({ ...base, reachable: false, counts: null })).toBe('error')
  })

  it('is a warning on a backlog behind a running worker', () => {
    expect(queueSeverity({ ...base, counts: { ...base.counts!, waiting: 5 } })).toBe('warning')
  })

  it('is a warning when the queue is paused', () => {
    expect(queueSeverity({ ...base, paused: true })).toBe('warning')
  })

  it('is idle — not a warning — when a backlog sits behind a disabled worker', () => {
    // A dark subsystem's queue still accepts jobs and nothing drains it. That
    // is the configured state; flagging it would make every feature-flagged
    // subsystem look broken and train operators to ignore this column.
    expect(
      queueSeverity({
        ...base,
        workerEnabled: false,
        featureFlag: 'scim',
        counts: { ...base.counts!, waiting: 250 },
      }),
    ).toBe('idle')
  })

  it('still reports failures on a disabled worker', () => {
    // A failure predates the worker being switched off, or came from a manual
    // dispatch. Either way it is real and must not be hidden by the idle rule.
    expect(
      queueSeverity({
        ...base,
        workerEnabled: false,
        counts: { ...base.counts!, failed: 3, waiting: 10 },
      }),
    ).toBe('error')
  })
})
