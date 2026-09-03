// ---------------------------------------------------------------------------
// Canonical path registry for the Landing module.
// Single source of truth for landing route URLs.
// ---------------------------------------------------------------------------

export const LandingPath = {
  home: '/',
  chronosMycelium: '/chronos-mycelium',
  features: '/features',
  privacyPolicy: '/privacy-policy',
  termsOfService: '/terms-of-service',
  contact: '/contact',
  about: '/about',
  pricing: '/pricing',
} as const

export const Path = LandingPath
export default LandingPath
