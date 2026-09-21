import { describe, it, expect } from 'vitest'
import { resolveEventLocation } from './resolveEventLocation'

describe('resolveEventLocation', () => {
  it('places an event exactly when the server supplied coordinates', () => {
    const location = resolveEventLocation({
      ip: '81.2.69.142',
      latitude: 51.5074,
      longitude: -0.1278,
      city: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
    })

    expect(location).toMatchObject({
      kind: 'located',
      precision: 'exact',
      lat: 51.5074,
      lon: -0.1278,
      place: 'London, United Kingdom',
      countryCode: 'GB',
    })
  })

  it('falls back to the country anchor, and says so, when only a country is known', () => {
    const location = resolveEventLocation({
      ip: '81.2.69.142',
      city: 'Frankfurt',
      country: 'Germany',
      countryCode: 'DE',
    })

    expect(location.kind).toBe('located')
    if (location.kind !== 'located') return
    // The caption names the city, but precision must not claim city accuracy:
    // no coordinate for Frankfurt was ever supplied.
    expect(location.precision).toBe('country')
    expect(location.place).toBe('Frankfurt, Germany')
    expect(location.lat).toBeGreaterThan(45)
    expect(location.lat).toBeLessThan(56)
    expect(location.lon).toBeGreaterThan(5)
    expect(location.lon).toBeLessThan(16)
  })

  it.each([
    ['192.168.1.42', 'private'],
    ['10.0.0.58', 'private'],
    ['172.16.254.1', 'private'],
    ['127.0.0.1', 'loopback'],
    ['::1', 'loopback'],
    ['169.254.10.1', 'link-local'],
    ['100.72.0.4', 'shared'],
    ['203.0.113.1', 'documentation'],
    ['fd00::1', 'private'],
  ])('reports %s as unlocatable reserved space (%s)', (ip, scope) => {
    expect(resolveEventLocation({ ip })).toEqual({ kind: 'private', scope })
  })

  it('does not treat a routable address in a similar range as private', () => {
    // 172.15.x and 172.32.x sit outside the 172.16/12 private block.
    expect(resolveEventLocation({ ip: '172.15.0.1' })).toEqual({ kind: 'unresolved' })
    expect(resolveEventLocation({ ip: '172.32.0.1' })).toEqual({ kind: 'unresolved' })
  })

  it('reports a routable address with no geo data as unresolved', () => {
    expect(resolveEventLocation({ ip: '8.8.8.8' })).toEqual({ kind: 'unresolved' })
  })

  it('prefers real coordinates over the private-range check', () => {
    // A VPN egress can carry a private source address alongside a resolved
    // location; the resolved location is the more specific answer.
    const location = resolveEventLocation({
      ip: '10.0.0.1',
      latitude: 35.6895,
      longitude: 139.6917,
    })
    expect(location.kind).toBe('located')
  })

  it('ignores an unknown country code rather than inventing a position', () => {
    expect(resolveEventLocation({ ip: '8.8.8.8', countryCode: 'ZZ' })).toEqual({
      kind: 'unresolved',
    })
  })
})
