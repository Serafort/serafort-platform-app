import { describe, it, expect } from 'vitest'
import { globalWidgetRegistry, registerModuleWidgets } from './WidgetRegistry'

describe('WidgetRegistry & registerModuleWidgets', () => {
  it('registers widgets dynamically from glob with titleKey module-name.widgets.<key>.title', () => {
    const mockGlob = {
      './widgets/HeroBannerWidget.tsx': () => Promise.resolve({ default: () => null }),
      './widgets/FeaturesWidget.tsx': () => Promise.resolve({ default: () => null }),
    }

    registerModuleWidgets('landing', mockGlob as any)

    const heroWidget = globalWidgetRegistry.get('landing-widget-heroBanner')
    expect(heroWidget).toBeDefined()
    expect(heroWidget?.titleKey).toBe('landing.widgets.heroBanner.title')

    const featuresWidget = globalWidgetRegistry.get('landing-widget-features')
    expect(featuresWidget).toBeDefined()
    expect(featuresWidget?.titleKey).toBe('landing.widgets.features.title')
  })

  it('supports custom id mapping override', () => {
    const mockGlob = {
      './widgets/RevenueChart.tsx': () => Promise.resolve({ default: () => null }),
    }

    registerModuleWidgets('dashboard', mockGlob as any, {
      idMapping: {
        revenueChart: 'custom-revenue-chart-id',
      },
    })

    const chartWidget = globalWidgetRegistry.get('custom-revenue-chart-id')
    expect(chartWidget).toBeDefined()
    expect(chartWidget?.titleKey).toBe('dashboard.widgets.revenueChart.title')
  })
})
