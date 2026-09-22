import { describe, it, expect } from 'vitest'
import { usageSeverity } from './billing.types'

const metric = (used: number, limit: number | null, percent: number | null) => ({
  used,
  limit,
  percent,
})

describe('usageSeverity', () => {
  it('is ok below 80%', () => {
    expect(usageSeverity(metric(799, 1000, 79.9))).toBe('ok')
  })

  it('warns from exactly 80%', () => {
    expect(usageSeverity(metric(800, 1000, 80))).toBe('warning')
    expect(usageSeverity(metric(999, 1000, 99.9))).toBe('warning')
  })

  it('errors at 100% and beyond', () => {
    expect(usageSeverity(metric(1000, 1000, 100))).toBe('error')
    expect(usageSeverity(metric(1500, 1000, 150))).toBe('error')
  })

  it('recomputes from used/limit when the server sent no percent', () => {
    // A missing percent must never under-report an exhausted limit.
    expect(usageSeverity(metric(1000, 1000, null))).toBe('error')
    expect(usageSeverity(metric(850, 1000, null))).toBe('warning')
  })

  it('treats null as unlimited and 0 as not included, never as a percentage', () => {
    expect(usageSeverity(metric(5000, null, null))).toBe('unlimited')
    expect(usageSeverity(metric(0, 0, null))).toBe('excluded')
    expect(usageSeverity(metric(3, 0, null))).toBe('excluded')
  })
})
