/**
 * Regenerates the world-geography module the real-time auth events map draws.
 *
 *   node scripts/generate-world-geography.mjs
 *
 * Downloads Natural Earth 1:110m admin-0 countries (public domain) into a cache
 * beside this script, projects it, and rewrites OUTPUT_PATH. Network access is
 * needed only here, at author time — never at runtime. The generated file is
 * committed precisely so the console has no tile server in the loop.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SOURCE_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson'
const CACHE_PATH = path.join(HERE, '.cache', 'ne_110m_admin_0_countries.geojson')
const OUTPUT_PATH = path.join(
  HERE,
  '..',
  'packages/modules/auth/src/modules/platform-cluster/components/monitoring/worldGeography.ts',
)

async function loadSource() {
  if (fs.existsSync(CACHE_PATH)) return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))

  console.log(`Downloading ${SOURCE_URL} ...`)
  const res = await fetch(SOURCE_URL)
  if (!res.ok) throw new Error(`Natural Earth download failed: ${res.status} ${res.statusText}`)
  const body = await res.text()
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true })
  fs.writeFileSync(CACHE_PATH, body)
  return JSON.parse(body)
}

const LON_MIN = -180
const LON_MAX = 180
const LAT_MAX = 84 // north clip: drops the polar stretch that equirectangular exaggerates
const LAT_MIN = -56 // south clip: drops Antarctica, which no auth event originates from

const WIDTH = 1000
const HEIGHT = Math.round((WIDTH * (LAT_MAX - LAT_MIN)) / (LON_MAX - LON_MIN))

const projectX = (lon) => ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * WIDTH
const projectY = (lat) => ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * HEIGHT

const round = (n) => Math.round(n)
const round2 = (n) => Number(n.toFixed(2))

/** Shoelace area, in projected square pixels. */
const ringArea = (ring) => {
  let area = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    area += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1]
  }
  return Math.abs(area / 2)
}

/** Drop consecutive points that land on the same rounded pixel. */
const dedupe = (points) => {
  const out = []
  for (const p of points) {
    const prev = out[out.length - 1]
    if (!prev || prev[0] !== p[0] || prev[1] !== p[1]) out.push(p)
  }
  return out
}

/**
 * Whole-pixel coordinates in a 1000px-wide viewBox, delta-encoded. The map
 * renders around 400 CSS px wide, so a 1px source grid is already
 * supersampled, and `l` deltas are single digits where `L` absolutes were
 * three — together that is roughly a third of the bytes of the naive encoding.
 */
const ringToPath = (ring) => {
  const projected = dedupe(ring.map(([lon, lat]) => [round(projectX(lon)), round(projectY(lat))]))
  if (projected.length < 3) return null
  if (ringArea(projected) < 1.5) return null

  const [first, ...rest] = projected
  let d = `M${first[0]} ${first[1]}`
  let [cx, cy] = first
  for (const [x, y] of rest) {
    const dx = x - cx
    const dy = y - cy
    d += `l${dx} ${dy}`
    cx = x
    cy = y
  }
  return d + 'Z'
}

const polygonsOf = (geometry) => {
  if (!geometry) return []
  if (geometry.type === 'Polygon') return [geometry.coordinates]
  if (geometry.type === 'MultiPolygon') return geometry.coordinates
  return []
}

const geo = await loadSource()

const countries = []
for (const feature of geo.features) {
  const props = feature.properties
  if (props.CONTINENT === 'Antarctica') continue

  const code = props.ISO_A2_EH && props.ISO_A2_EH !== '-99' ? props.ISO_A2_EH : props.ISO_A2
  if (!code || code === '-99') continue

  const parts = []
  for (const polygon of polygonsOf(feature.geometry)) {
    // Index 0 is the outer ring; the rest are holes. At 110m resolution the
    // holes that survive (Lesotho, the Vatican) matter visually, so keep them
    // and let the path's even-odd fill cut them out.
    for (const ring of polygon) {
      const clipped = ring.map(([lon, lat]) => [
        Math.max(LON_MIN, Math.min(LON_MAX, lon)),
        Math.max(LAT_MIN, Math.min(LAT_MAX, lat)),
      ])
      const path = ringToPath(clipped)
      if (path) parts.push(path)
    }
  }
  if (parts.length === 0) continue

  countries.push({
    code,
    name: props.NAME_EN || props.NAME,
    d: parts.join(''),
    anchor: [round2(props.LABEL_X), round2(props.LABEL_Y)],
  })
}

countries.sort((a, b) => a.code.localeCompare(b.code))

const anchors = countries
  .map((c) => `  ${c.code}: [${c.anchor[0]}, ${c.anchor[1]}],`)
  .join('\n')

const paths = countries
  .map((c) => `  { code: '${c.code}', name: ${JSON.stringify(c.name)}, d: '${c.d}' },`)
  .join('\n')

const out = `/**
 * World geography for the real-time auth events map, precomputed at author time.
 *
 * Derived from Natural Earth 1:110m admin-0 countries (public domain), projected
 * equirectangularly into a ${WIDTH}x${HEIGHT} viewBox, snapped to whole pixels and
 * delta-encoded. It is generated rather than fetched so the console draws a real map with
 * no tile server in the loop: an admin viewing an event never discloses that
 * event's location to a third party, and the screen works air-gapped.
 *
 * Latitude is clipped to [${LAT_MIN}, ${LAT_MAX}] — Antarctica is dropped, and the polar
 * stretch that equirectangular projection exaggerates is cut off.
 *
 * DO NOT EDIT BY HAND. Regenerate with scripts/generate-world-geography.mjs.
 */

/** Projected drawing surface. Matches the \`viewBox\` the map component renders. */
export const WORLD_MAP_VIEWBOX = { width: ${WIDTH}, height: ${HEIGHT} } as const

/** Geographic bounds the projection covers, in degrees. */
export const WORLD_MAP_BOUNDS = {
  lonMin: ${LON_MIN},
  lonMax: ${LON_MAX},
  latMin: ${LAT_MIN},
  latMax: ${LAT_MAX},
} as const

export interface CountryShape {
  /** ISO 3166-1 alpha-2 code. */
  readonly code: string
  /** English country name, for the shape's accessible label. */
  readonly name: string
  /** SVG path data in \`WORLD_MAP_VIEWBOX\` coordinates. */
  readonly d: string
}

/**
 * Natural Earth's cartographic label points, not raw centroids: for countries
 * like Norway or Indonesia a centroid falls in the sea, while these sit on land.
 * Used to place an event whose location resolved to a country but not a city.
 */
export const COUNTRY_ANCHORS: Readonly<Record<string, readonly [number, number]>> = {
${anchors}
}

export const WORLD_COUNTRY_PATHS: ReadonlyArray<CountryShape> = [
${paths}
]
`

fs.writeFileSync(OUTPUT_PATH, out)
console.log(
  `Wrote ${path.relative(path.join(HERE, '..'), OUTPUT_PATH)} — ` +
    `${countries.length} countries, ${WIDTH}x${HEIGHT} viewBox, ${(out.length / 1024).toFixed(1)} KB`,
)
