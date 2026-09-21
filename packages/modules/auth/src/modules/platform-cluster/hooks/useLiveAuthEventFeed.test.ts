import { describe, it, expect } from 'vitest'
import { classifyAuthEvent, toLiveAuthEvent } from './useLiveAuthEventFeed'

describe('classifyAuthEvent', () => {
  it.each([
    ['auth.login_success', 'success', 'success'],
    ['UserAuthenticated', 'success', 'success'],
    ['auth.login_failed', 'failure', 'failed'],
    ['AuthenticationFailed', 'failure', 'failed'],
    ['auth.account_locked', 'locked', 'failed'],
    ['MfaVerified', 'success', 'mfa'],
    ['MfaChallengeIssued', 'success', 'mfa'],
    ['TokenRefreshed', 'success', 'refresh'],
    ['session:revoked', 'warning', 'logout'],
    ['audit_checkpoint:generated', 'success', 'other'],
  ])('maps %s/%s to %s', (action, status, expected) => {
    expect(classifyAuthEvent(action, status)).toBe(expected)
  })

  it('treats a failed MFA challenge as a failure, not an MFA event', () => {
    // Order matters: an operator scanning for failures must see this row.
    expect(classifyAuthEvent('MfaChallengeIssued', 'failure')).toBe('failed')
  })
})

describe('toLiveAuthEvent', () => {
  it('normalises a top-level audit payload', () => {
    const event = toLiveAuthEvent({
      id: 'evt_1',
      action: 'auth.login_success',
      actor: 'sarah@example.com',
      ipAddress: '81.2.69.142',
      userAgent: 'Chrome',
      status: 'success',
      timestamp: '2026-09-20T14:02:05.233Z',
      city: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
    })

    expect(event).toMatchObject({
      id: 'evt_1',
      kind: 'success',
      actor: 'sarah@example.com',
      ip: '81.2.69.142',
      city: 'London',
      countryCode: 'GB',
      timestamp: '2026-09-20T14:02:05.233Z',
    })
  })

  it('reads geo out of metadata, where ip-change events carry it', () => {
    const event = toLiveAuthEvent({
      id: 'evt_2',
      action: 'session:ip_changed',
      newIp: '81.2.69.142',
      metadata: { city: 'Frankfurt', countryLong: 'Germany', countryShort: 'DE' },
    })

    expect(event).toMatchObject({
      ip: '81.2.69.142',
      city: 'Frankfurt',
      country: 'Germany',
      countryCode: 'DE',
    })
  })

  it('keeps severity and status apart', () => {
    // The stream reports how bad an event is (severity) separately from
    // whether it succeeded (status); merging them made the severity column
    // read "success" on a failed sign-in.
    const event = toLiveAuthEvent({
      id: 'evt_sev',
      action: 'auth.login_failed',
      severity: 'error',
      status: 'failure',
    })
    expect(event).toMatchObject({ severity: 'error', status: 'failure', kind: 'failed' })
  })

  it('leaves status null when the server does not report one', () => {
    const event = toLiveAuthEvent({ id: 'evt_nostatus', action: 'audit_log:created' })
    expect(event?.status).toBeNull()
    expect(event?.severity).toBe('info')
  })

  it('keeps the untouched payload for the detail panel', () => {
    const payload = { id: 'evt_3', action: 'TokenIssued', custom: { nested: true } }
    expect(toLiveAuthEvent(payload)?.raw).toBe(payload)
  })

  it('synthesises a stable id when the server omits one', () => {
    const payload = { action: 'TokenIssued', timestamp: '2026-09-20T14:02:05.233Z', ipAddress: '8.8.8.8' }
    const first = toLiveAuthEvent(payload)
    const second = toLiveAuthEvent(payload)
    // Two relays of the same event must dedupe, so the id cannot be random.
    expect(first?.id).toBe(second?.id)
  })
})
