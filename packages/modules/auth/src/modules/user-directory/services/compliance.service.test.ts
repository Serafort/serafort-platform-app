import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@cap/platform-core'
import complianceService from './compliance.service'
import {
  CONSENT_PURPOSES,
  ERASURE_CONFIRMATION_PHRASE,
  canSubmitErasure,
} from '../types/compliance.types'

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

describe('complianceService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reads consents and consent status from their own endpoints', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(createMockResponse([]))

    await complianceService.getConsents()
    await complianceService.getConsentStatus()

    expect(apiClient.get).toHaveBeenNthCalledWith(1, '/api/gdpr/consent')
    expect(apiClient.get).toHaveBeenNthCalledWith(2, '/api/gdpr/consent/status')
  })

  it('PATCHes a consent decision with the purpose in the body', async () => {
    // The backend upserts on (userId, purpose) and stamps the request IP and
    // user agent — the evidence half of Article 7(1). The purpose has to be in
    // the body for that upsert to find the right row.
    vi.mocked(apiClient.patch).mockResolvedValueOnce(createMockResponse({}))

    await complianceService.updateConsent({ purpose: 'marketing', isGranted: false })

    expect(apiClient.patch).toHaveBeenCalledWith('/api/gdpr/consent', {
      purpose: 'marketing',
      isGranted: false,
    })
  })

  it('posts the erasure request with the password as the confirmation factor', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(createMockResponse({ userId: 1 }))

    await complianceService.requestErasure({ password: 'secret', hardDelete: true })

    expect(apiClient.post).toHaveBeenCalledWith('/api/gdpr/erasure', {
      password: 'secret',
      hardDelete: true,
    })
  })

  it('reads the Article 30 register and the retention report', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(createMockResponse({ activities: [] }))

    await complianceService.getProcessingActivities()
    await complianceService.getRetentionReport()

    expect(apiClient.get).toHaveBeenNthCalledWith(1, '/api/gdpr/processing-activities')
    expect(apiClient.get).toHaveBeenNthCalledWith(2, '/api/gdpr/retention-report')
  })
})

describe('CONSENT_PURPOSES', () => {
  it('matches the union the backend validator accepts', () => {
    // `UserConsent.purpose` is a fixed union and `updateConsentValidator`
    // enforces it. Offering a purpose outside this list would render a toggle
    // whose every use is rejected.
    expect([...CONSENT_PURPOSES]).toEqual([
      'marketing',
      'analytics',
      'data_sharing',
      'newsletter',
    ])
  })
})

describe('canSubmitErasure', () => {
  const valid = {
    confirmationPhrase: ERASURE_CONFIRMATION_PHRASE,
    password: 'secret',
    acknowledged: true,
  }

  it('accepts only when all three are satisfied', () => {
    expect(canSubmitErasure(valid)).toBe(true)
  })

  it('requires the typed phrase', () => {
    // The phrase proves intent: a stray click or an autofilled form cannot
    // produce it.
    expect(canSubmitErasure({ ...valid, confirmationPhrase: '' })).toBe(false)
    expect(canSubmitErasure({ ...valid, confirmationPhrase: 'delete my data' })).toBe(false)
    expect(canSubmitErasure({ ...valid, confirmationPhrase: 'DELETE MY DATA PLEASE' })).toBe(false)
  })

  it('tolerates surrounding whitespace in the phrase', () => {
    // A trailing space from a copy-paste is not a different intent.
    expect(canSubmitErasure({ ...valid, confirmationPhrase: '  DELETE MY DATA  ' })).toBe(true)
  })

  it('requires the password', () => {
    // The password proves identity. The phrase alone would let anyone at an
    // unlocked screen destroy the account.
    expect(canSubmitErasure({ ...valid, password: '' })).toBe(false)
  })

  it('requires the acknowledgement', () => {
    expect(canSubmitErasure({ ...valid, acknowledged: false })).toBe(false)
  })
})
