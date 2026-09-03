import type { GridLayout } from '@cap/shared-types'

export { default as HeroBannerWidget } from './HeroBannerWidget'
export { default as FeaturesWidget } from './FeaturesWidget'
export { default as AboutWidget } from './AboutWidget'
export { default as StatsWidget } from './StatsWidget'
export { default as CtaWidget } from './CtaWidget'

export const LANDING_WIDGET_IDS = {
  heroBanner: 'landing-widget-hero',
  features: 'landing-widget-features',
  about: 'landing-widget-about',
  stats: 'landing-widget-stats',
  cta: 'landing-widget-cta',
} as const

export type LandingWidgetId = (typeof LANDING_WIDGET_IDS)[keyof typeof LANDING_WIDGET_IDS]

export const DEFAULT_LANDING_GRID_LAYOUT: GridLayout = {
  slots: ['slot-1', 'slot-2', 'slot-3', 'slot-4', 'slot-5'],
  slotWidgets: {
    'slot-1': LANDING_WIDGET_IDS.heroBanner,
    'slot-2': LANDING_WIDGET_IDS.features,
    'slot-3': LANDING_WIDGET_IDS.about,
    'slot-4': LANDING_WIDGET_IDS.stats,
    'slot-5': LANDING_WIDGET_IDS.cta,
  },
  slotSizes: {
    'slot-1': { span: 12, height: 400 },
    'slot-2': { span: 12, height: 400 },
    'slot-3': { span: 8, height: 400 },
    'slot-4': { span: 4, height: 400 },
    'slot-5': { span: 12, height: 280 },
  },
}
