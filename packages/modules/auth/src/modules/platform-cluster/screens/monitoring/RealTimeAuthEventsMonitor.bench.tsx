import { bench, describe } from 'vitest'

const INITIAL_EVENTS = Array.from({ length: 1000 }, (_, i) => ({
  id: `evt_90214a${i}`,
  time: '14:02:05.233',
  email: `user${i}@company.com`,
  userName: `User ${i}`,
  initials: 'UU',
  role: 'Developer',
  orgId: 'org_4421',
  device: 'Mac OS / Chrome 124',
  type: i % 2 === 0 ? 'success' : 'failed',
  ip: '192.168.1.42',
  city: 'San Francisco, US',
  latency: '45ms',
}))

const selectedFilter = 'all'
const searchQuery = 'user500'

describe('RealTimeAuthEventsMonitor filtering', () => {
  bench('current filter implementation', () => {
    INITIAL_EVENTS.filter((ev) => {
      const matchesFilter = selectedFilter === 'all' || ev.type === selectedFilter
      const query = searchQuery.trim().toLowerCase()
      const matchesQuery =
        !query ||
        ev.id.toLowerCase().includes(query) ||
        ev.email.toLowerCase().includes(query) ||
        ev.ip.toLowerCase().includes(query) ||
        ev.device.toLowerCase().includes(query) ||
        ev.userName.toLowerCase().includes(query)
      return matchesFilter && matchesQuery
    })
  })

  bench('optimized filter implementation', () => {
    const query = searchQuery.trim().toLowerCase()
    INITIAL_EVENTS.filter((ev) => {
      if (selectedFilter !== 'all' && ev.type !== selectedFilter) return false
      if (!query) return true
      return (
        ev.id.toLowerCase().includes(query) ||
        ev.email.toLowerCase().includes(query) ||
        ev.ip.toLowerCase().includes(query) ||
        ev.device.toLowerCase().includes(query) ||
        ev.userName.toLowerCase().includes(query)
      )
    })
  })
})
