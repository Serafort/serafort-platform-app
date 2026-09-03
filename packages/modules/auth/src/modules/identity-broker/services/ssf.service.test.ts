import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@cap/platform-core'
import ssfService from './ssf.service'
import {
  historyRecipientCount,
  historyTimestamp,
  type SSFHistoryLog,
} from '../types/ssf.types'

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

describe('ssfService.broadcastEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends the field names the backend actually reads', async () => {
    // `AdminSsfController.broadcast` reads
    // `request.only(['eventType', 'subject', 'reason'])` and answers 400 when
    // eventType or subject is missing. The service previously sent `event_type`
    // and `event_payload`, so every broadcast failed — this pins the contract.
    vi.mocked(apiClient.post).mockResolvedValueOnce(createMockResponse({ success: true }))

    await ssfService.broadcastEvent({
      eventType: 'session-revoked',
      subject: 'user@example.test',
      reason: 'credential compromise',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/api/admin/ssf/broadcast', {
      eventType: 'session-revoked',
      subject: 'user@example.test',
      reason: 'credential compromise',
    })
  })

  it('sends no snake_cased keys', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(createMockResponse({ success: true }))

    await ssfService.broadcastEvent({ eventType: 'account-disabled', subject: 'user-1' })

    const [, body] = vi.mocked(apiClient.post).mock.calls[0]
    expect(Object.keys(body as object)).toEqual(['eventType', 'subject', 'reason'])
  })
})

describe('SSF history helpers', () => {
  const log = (overrides: Partial<SSFHistoryLog>): SSFHistoryLog => ({
    id: 1,
    action: 'SSF_SIGNAL_BROADCAST',
    created_at: '2026-09-03T10:00:00Z',
    ...overrides,
  })

  it('reads the recipient count under either casing', () => {
    // The backend has written this key both ways. Reading only one produced a
    // silent zero next to a broadcast that did reach clients.
    expect(historyRecipientCount(log({ metadata: { clientCount: 4 } }))).toBe(4)
    expect(historyRecipientCount(log({ metadata: { client_count: 7 } }))).toBe(7)
  })

  it('reports zero recipients when the metadata says nothing', () => {
    expect(historyRecipientCount(log({ metadata: null }))).toBe(0)
    expect(historyRecipientCount(log({}))).toBe(0)
  })

  it('reads the timestamp under either casing', () => {
    expect(historyTimestamp(log({ created_at: '2026-01-01T00:00:00Z' }))).toBe(
      '2026-01-01T00:00:00Z',
    )
    expect(
      historyTimestamp({ id: 2, action: 'SSF_TEST_SIGNAL', createdAt: '2026-02-02T00:00:00Z' } as any),
    ).toBe('2026-02-02T00:00:00Z')
  })
})
