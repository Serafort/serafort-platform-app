// ---------------------------------------------------------------------------
// Canonical path registry for the Dashboard module.
// Single source of truth for dashboard route URLs.
// ---------------------------------------------------------------------------

export const DashboardPath = {
  dashboard: '/dashboard',
} as const

export const Path = DashboardPath
export default DashboardPath
