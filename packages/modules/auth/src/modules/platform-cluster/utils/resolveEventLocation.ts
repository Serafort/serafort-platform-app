import { COUNTRY_ANCHORS } from '../components/monitoring/worldGeography'

/**
 * Where an auth event can be placed on the world map, and how confidently.
 *
 * The console plots only what the pipeline actually resolved. An event whose
 * address is a private LAN range has no location to plot — saying so is a real
 * answer, and a more useful one than dropping a pin on a plausible-looking
 * city. The previous screen drew a decorative pin for every event regardless,
 * which made an unlocatable internal request indistinguishable from a
 * geolocated one from abroad.
 */
export type EventLocation =
  | {
      kind: 'located'
      /** Degrees east, -180..180. */
      lon: number
      /** Degrees north, -90..90. */
      lat: number
      /**
       * `exact` when the source gave real coordinates; `country` when we only
       * know the country and are drawing its cartographic label point.
       */
      precision: 'exact' | 'country'
      /** Human-readable place, already assembled ("Berlin, DE"). */
      place: string
      /** ISO 3166-1 alpha-2, when known — lets the map highlight the country. */
      countryCode: string | null
    }
  | {
      /** RFC1918 / loopback / link-local / CGNAT / documentation ranges. */
      kind: 'private'
      /** Which reserved class it fell in, for the explanatory caption. */
      scope: 'loopback' | 'private' | 'link-local' | 'shared' | 'documentation'
    }
  /** A routable address that no geo lookup has resolved. */
  | { kind: 'unresolved' }

export interface LocatableEvent {
  ip?: string | null
  city?: string | null
  country?: string | null
  countryCode?: string | null
  latitude?: number | null
  longitude?: number | null
}

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/

/**
 * Classifies reserved IPv4/IPv6 space. These addresses are not globally
 * routable, so no geolocation database can place them — and the seeded
 * `192.168.x` / `203.0.113.x` rows this screen ships with are exactly that.
 */
const classifyReserved = (
  ip: string,
): Extract<EventLocation, { kind: 'private' }>['scope'] | null => {
  const address = ip.trim().toLowerCase()
  if (!address) return null

  // IPv6
  if (address.includes(':')) {
    if (address === '::1' || address === '::') return 'loopback'
    if (/^f[cd][0-9a-f]{2}:/.test(address)) return 'private' // fc00::/7 unique-local
    if (/^fe[89ab][0-9a-f]:/.test(address)) return 'link-local' // fe80::/10
    if (address.startsWith('2001:db8:')) return 'documentation'
    return null
  }

  const match = IPV4.exec(address)
  if (!match) return null
  const [a, b] = match.slice(1, 3).map(Number)
  if ([a, b].some((n) => Number.isNaN(n) || n > 255)) return null

  if (a === 127 || a === 0) return 'loopback'
  if (a === 10) return 'private'
  if (a === 192 && b === 168) return 'private'
  if (a === 172 && b >= 16 && b <= 31) return 'private'
  if (a === 169 && b === 254) return 'link-local'
  if (a === 100 && b >= 64 && b <= 127) return 'shared' // CGNAT, RFC 6598
  // RFC 5737 documentation ranges — 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24
  if (a === 192 && b === 0) return 'documentation'
  if (a === 198 && b === 51) return 'documentation'
  if (a === 203 && b === 0) return 'documentation'
  return null
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

/**
 * Resolves an event to a map position, preferring the most precise source
 * available: real coordinates, then the country's label point.
 *
 * A city name narrows the *caption* but not the *position*: the backend's
 * IP2Location tier returns city names without coordinates, so pinning a city
 * would mean inventing a latitude. When that database is upgraded to a
 * coordinate-bearing tier, those events arrive with `latitude`/`longitude` and
 * are placed exactly, with no change needed here.
 */
export const resolveEventLocation = (event: LocatableEvent): EventLocation => {
  const countryCode = event.countryCode?.trim().toUpperCase() || null
  const cityName = event.city?.trim() || ''
  const countryName = event.country?.trim() || ''

  const placeParts = [cityName, countryName || countryCode].filter(Boolean)
  const place = placeParts.join(', ')

  if (isFiniteNumber(event.latitude) && isFiniteNumber(event.longitude)) {
    return {
      kind: 'located',
      lat: event.latitude,
      lon: event.longitude,
      precision: 'exact',
      place: place || `${event.latitude.toFixed(2)}, ${event.longitude.toFixed(2)}`,
      countryCode,
    }
  }

  const anchor = countryCode ? COUNTRY_ANCHORS[countryCode] : undefined
  if (anchor) {
    return {
      kind: 'located',
      lon: anchor[0],
      lat: anchor[1],
      precision: 'country',
      place: place || countryCode!,
      countryCode,
    }
  }

  const reserved = event.ip ? classifyReserved(event.ip) : null
  if (reserved) return { kind: 'private', scope: reserved }

  return { kind: 'unresolved' }
}

export default resolveEventLocation
