import { describe, it, expect } from 'vitest'
import {
  READER_STALE_AFTER_MS,
  normaliseCardUid,
  readerPresence,
} from './accessControl.types'

describe('normaliseCardUid', () => {
  it('trims and upper-cases, matching the backend', () => {
    expect(normaliseCardUid('  04:a2:2f  ')).toBe('04:A2:2F')
  })

  it('leaves an already-normalised UID alone', () => {
    expect(normaliseCardUid('04A22F')).toBe('04A22F')
  })
})

describe('readerPresence', () => {
  const now = new Date('2026-09-03T12:00:00Z').getTime()
  const minutesAgo = (n: number) => new Date(now - n * 60_000).toISOString()

  it('is online when the reader scanned recently', () => {
    expect(readerPresence({ status: 'active', lastSeenAt: minutesAgo(2) }, now)).toBe('online')
  })

  it('is stale past the threshold', () => {
    expect(readerPresence({ status: 'active', lastSeenAt: minutesAgo(20) }, now)).toBe('stale')
  })

  it('treats the threshold itself as online', () => {
    const exactly = new Date(now - READER_STALE_AFTER_MS).toISOString()
    expect(readerPresence({ status: 'active', lastSeenAt: exactly }, now)).toBe('online')
  })

  it('distinguishes a reader that has never called in from one that went quiet', () => {
    // A reader that never reported was probably never given its token or never
    // wired up — a failed installation, not a transient fault. Collapsing both
    // into "offline" hides the first behind the second.
    expect(readerPresence({ status: 'active', lastSeenAt: null }, now)).toBe('never-seen')
    expect(readerPresence({ status: 'active', lastSeenAt: minutesAgo(20) }, now)).toBe('stale')
  })

  it('reports a disabled reader as disabled regardless of its last scan', () => {
    // A deliberately disabled door must not read as a fault, even though it is
    // by definition not scanning.
    expect(readerPresence({ status: 'inactive', lastSeenAt: minutesAgo(1) }, now)).toBe('disabled')
    expect(readerPresence({ status: 'inactive', lastSeenAt: null }, now)).toBe('disabled')
  })

  it('treats an unparseable timestamp as never seen rather than online', () => {
    // Fail towards "something is wrong": a malformed timestamp must never
    // produce a green reader nobody looks at again.
    expect(readerPresence({ status: 'active', lastSeenAt: 'not-a-date' }, now)).toBe('never-seen')
  })
})
