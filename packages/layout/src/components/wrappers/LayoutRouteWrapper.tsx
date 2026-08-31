import React from 'react'
import i18next from 'i18next'
import { useAppStore, type AppStore } from '@cap/platform-store'
import { RouteLayoutEnum, type RouteLayout } from '@cap/shared-types'

export interface LayoutRouteWrapperProps {
  element?: React.ReactNode
  children?: React.ReactNode
  layout?: RouteLayout | string
  label?: string
}

/**
 * Wraps a route element and syncs the layoutOverride Zustand slice based on
 * the layout value declared in AuthRouteConfig.
 *
 * Admin routes do NOT need to set layoutOverride here — AdminRoute.tsx handles
 * that directly (it calls updateLayoutOverride('admin') in a useEffect).
 * This wrapper handles non-default layout overrides like 'noLayout'.
 */
export const LayoutRouteWrapper: React.FC<LayoutRouteWrapperProps> = ({
  element,
  children,
  layout = RouteLayoutEnum.PUBLIC,
  label,
}) => {
  const updateLayoutOverride = useAppStore((state: AppStore) => state.updateLayoutOverride)

  React.useEffect(() => {
    const effectiveLayout =
      !layout || layout === RouteLayoutEnum.NONE
        ? RouteLayoutEnum.PUBLIC
        : (layout as RouteLayoutEnum)
    updateLayoutOverride(effectiveLayout)

    return () => {
      updateLayoutOverride(RouteLayoutEnum.NONE)
    }
  }, [layout, updateLayoutOverride])

  React.useEffect(() => {
    if (label) {
      const i18nInstance = (i18next as any)?.default || i18next
      const translated =
        i18nInstance?.isInitialized && i18nInstance.exists?.(label)
          ? i18nInstance.t(label)
          : i18nInstance?.t
            ? i18nInstance.t(label)
            : label
      document.title = translated || label
    }
  }, [label])

  const content = children ?? element

  return <React.Fragment>{content}</React.Fragment>
}

export default LayoutRouteWrapper
