import type { CAPModule, NavItemConfig } from '@cap/shared-types'
import { landingRouteConfig, LandingPath } from './routes'
import { landingDictionaries, registerDictionary } from './i18n/registry'
import { registerModuleWidgets } from '@cap/platform-core'
import { LANDING_WIDGET_IDS } from './widgets'

// Routes
export {
  default as CommonRoutes,
  landingRoutes,
  LandingRoutes,
  landingRouteConfig,
  LandingPath,
  LandingPath as Path,
} from './routes'

// Screens
export { default as FeatureComparison } from './screens/FeatureComparison'
export { default as ContactUs } from './screens/ContactUs'
export { default as PrivacyPolicy } from './screens/PrivacyPolicy'
export { default as TermsOfService } from './screens/TermsOfService'
export { default as AboutUs } from './screens/AboutUs'
export { default as Pricing } from './screens/Pricing'

// Widgets export
export * from './widgets'

// Dynamically register all widgets in ./widgets/*.tsx with titleKey `landing.widgets.<widgetKey>.title`
registerModuleWidgets(
  'landing',
  import.meta.glob('./widgets/*.tsx') as Record<string, () => Promise<any>>,
  {
    idMapping: {
      heroBanner: LANDING_WIDGET_IDS.heroBanner,
      features: LANDING_WIDGET_IDS.features,
      about: LANDING_WIDGET_IDS.about,
      stats: LANDING_WIDGET_IDS.stats,
      cta: LANDING_WIDGET_IDS.cta,
    },
  },
)

// I18n Registry & Dictionaries
export {
  landingDictionaries,
  registerDictionary,
  getMergedDictionary,
  getAvailableLocales,
  i18n,
  type Locale,
} from './i18n/registry'

// Register i18n dictionaries for landing module
registerDictionary(landingDictionaries as any)

export const landingNavItems: NavItemConfig[] = [
  { id: 'nav-home', label: 'landing.home', path: LandingPath.home, variant: ['public'], guestOnly: true, order: 10 },
  { id: 'guest-features', label: 'landing.features', path: LandingPath.features, variant: ['public'], order: 20 },
  { id: 'guest-pricing', label: 'landing.pricing', path: LandingPath.pricing, variant: ['public'], order: 30 },
  { id: 'guest-about', label: 'landing.about', path: LandingPath.about, variant: ['public'], order: 40 },
  { id: 'guest-contact', label: 'landing.contact', path: LandingPath.contact, variant: ['public'], order: 50 },
]

export const LandingModule: CAPModule = {
  id: 'landing-module',
  version: '1.0.0',
  routes: landingRouteConfig,
  i18n: landingDictionaries,
  navItems: landingNavItems,
}

export default LandingModule
