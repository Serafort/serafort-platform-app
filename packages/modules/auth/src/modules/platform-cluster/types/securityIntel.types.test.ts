import { describe, it, expect } from 'vitest'
import {
  ALERT_SEVERITY_ORDER,
  availableTriageActions,
  type SecurityAlert,
} from './securityIntel.types'

/**
 * The triage rules are the one place where a wrong answer changes what an
 * operator is allowed to do to a security alert, so they are pinned here rather
 * than left implicit in the table that renders them.
 */

const alert = (
  overrides: Partial<Pick<SecurityAlert, 'status' | 'anomalyId'>>,
): Pick<SecurityAlert, 'status' | 'anomalyId'> => ({
  status: 'open',
  anomalyId: null,
  ...overrides,
})

describe('availableTriageActions', () => {
  it('offers acknowledge, resolve and dismiss on a fresh alert', () => {
    expect(availableTriageActions(alert({ status: 'open' }))).toEqual([
      'acknowledge',
      'resolve',
      'dismiss',
    ])
  })

  it('drops acknowledge once the alert is already acknowledged', () => {
    expect(availableTriageActions(alert({ status: 'acknowledged' }))).toEqual([
      'resolve',
      'dismiss',
    ])
  })

  it('offers nothing on a closed alert', () => {
    // Re-resolving a resolved alert would overwrite `resolvedBy` and
    // `resolvedAt`, destroying the record of who actually handled it.
    expect(availableTriageActions(alert({ status: 'resolved' }))).toEqual([])
    expect(availableTriageActions(alert({ status: 'expired' }))).toEqual([])
  })

  it('offers false positive only for a detector-raised alert', () => {
    // False positive is feedback about the detector. An alert with no anomaly
    // has no detector to be wrong about, so offering it there would send
    // meaningless feedback into the tuning signal.
    expect(availableTriageActions(alert({ status: 'open', anomalyId: null }))).not.toContain(
      'falsePositive',
    )
    expect(availableTriageActions(alert({ status: 'open', anomalyId: 12 }))).toContain(
      'falsePositive',
    )
  })

  it('still allows false-positive feedback on a suppressed alert', () => {
    // Dismissing suppressed the alert; it did not say the detector was right.
    // An operator who later realises the detection was wrong must still be able
    // to say so.
    const actions = availableTriageActions(alert({ status: 'suppressed', anomalyId: 3 }))
    expect(actions).toEqual(['falsePositive'])
  })
})

describe('ALERT_SEVERITY_ORDER', () => {
  it('ranks critical first and info last', () => {
    // The triage queue sorts on this. Reversing it would bury a critical alert
    // under a morning of informational ones.
    expect(ALERT_SEVERITY_ORDER[0]).toBe('critical')
    expect(ALERT_SEVERITY_ORDER[ALERT_SEVERITY_ORDER.length - 1]).toBe('info')
    expect(ALERT_SEVERITY_ORDER).toHaveLength(5)
  })
})
