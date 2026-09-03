import React from 'react'
import { Route, type RoutesProps } from 'react-router-dom'
import type { ModuleRouteConfig } from '@cap/shared-types'
import { LayoutRouteWrapper } from '@cap/layout'
import { LandingPath } from './path'
import i18next from 'i18next'

const t = (key: string, fallback?: string) => {
  const i18nInstance = (i18next as any)?.default || i18next
  return i18nInstance?.isInitialized && i18nInstance.exists?.(key)
    ? i18nInstance.t(key)
    : fallback || key
}

const Home = React.lazy(() => import('../screens/Home'))
const ChronosMycelium = React.lazy(() => import('../screens/ChronosMycelium'))
const FeatureComparison = React.lazy(() => import('../screens/FeatureComparison'))
const PrivacyPolicy = React.lazy(() => import('../screens/PrivacyPolicy'))
const TermsOfService = React.lazy(() => import('../screens/TermsOfService'))
const ContactUs = React.lazy(() => import('../screens/ContactUs'))
const AboutUs = React.lazy(() => import('../screens/AboutUs'))
const Pricing = React.lazy(() => import('../screens/Pricing'))

export const landingRouteConfig: ModuleRouteConfig[] = [
  {
    path: LandingPath.home,
    id: 'nav-home',
    element: <Home />,
    label: 'landing.home',
    layout: 'public',
    variant: ['public'],
    guestOnly: true,
  },
  {
    path: LandingPath.chronosMycelium,
    element: <ChronosMycelium />,
    label: 'landing.chronosMycelium',
    layout: 'public',
  },
  {
    path: LandingPath.features,
    id: 'guest-features',
    element: <FeatureComparison />,
    label: 'landing.features',
    layout: 'public',
    variant: ['public'],
  },
  {
    path: LandingPath.privacyPolicy,
    element: <PrivacyPolicy />,
    label: 'landing.privacyPolicy',
    layout: 'public',
    variant: ['public'],
  },
  {
    path: LandingPath.termsOfService,
    element: <TermsOfService />,
    label: 'landing.termsOfService',
    layout: 'public',
    variant: ['public'],
  },
  {
    path: LandingPath.contact,
    id: 'guest-contact',
    element: <ContactUs />,
    label: 'landing.contact',
    layout: 'public',
    variant: ['public'],
  },
  {
    path: LandingPath.about,
    id: 'guest-about',
    element: <AboutUs />,
    label: 'landing.about',
    layout: 'public',
    variant: ['public'],
  },
  {
    path: LandingPath.pricing,
    id: 'guest-pricing',
    element: <Pricing />,
    label: 'landing.pricing',
    layout: 'public',
    variant: ['public'],
  },
]

/**
 * Route component for standalone or sub-router rendering of Landing module routes.
 * Wrapped with LayoutRouteWrapper to respect route layout intent.
 */
export const landingRoutes: React.FC<RoutesProps> = () => (
  <>
    {landingRouteConfig.map((route) => (
      <Route
        key={route.path}
        path={route.path}
        element={
          <LayoutRouteWrapper layout={route.layout || 'public'}>
            {route.element}
          </LayoutRouteWrapper>
        }
      />
    ))}
  </>
)

export const LandingRoutes = landingRoutes
export default landingRoutes
