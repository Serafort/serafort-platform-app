// cspell:ignore languagedetector reactour Toastify
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { BrowserRouter } from 'react-router-dom';
import { TenantProvider, themeConfig, i18n, onForbiddenError, useNetworkSync, getModules, useTenant, LayoutEngineProvider } from '@cap/platform-core';
import type { ChildrenType } from '@cap/platform-core';
import { TourProvider } from '@reactour/tour';
import { toast } from 'react-toastify';
import common_us from './data/dictionaries/en.json';
import common_fr from './data/dictionaries/fr.json';
import common_ar from './data/dictionaries/ar.json';
import { ThemeBridge, AppReactToastify } from '@cap/layout';
import { GlobalZIndexStyles, WidgetMarketplaceDrawer, WidgetInspectorDrawer } from '@cap/theme';

import { ThemeEditor } from '@cap/module-theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

const deepMergeObj = (target: any, source: any): any => {
  const output = { ...target }
  if (target && typeof target === 'object' && source && typeof source === 'object') {
    Object.keys(source).forEach((key) => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = deepMergeObj(target[key] || {}, source[key])
      } else {
        output[key] = source[key]
      }
    })
  }
  return output
}

if (!i18next.isInitialized) {
  const initialResources: any = {
    en: { common: { ...common_us } },
    fr: { common: { ...common_fr } },
    ar: { common: { ...common_ar } },
  }

  // Dynamically merge i18n from all registered modules isolated by module name/id & into defaultNS common
  const modules = getModules()

  modules.forEach((module: any) => {
    const moduleNs = module.id || module.name || 'common'
    if (module.i18n) {
      Object.entries(module.i18n).forEach(([lang, resources]: [string, any]) => {
        const langKey = lang.toLowerCase()
        if (initialResources[langKey]) {
          initialResources[langKey][moduleNs] = deepMergeObj(
            initialResources[langKey][moduleNs] || {},
            resources
          )
          initialResources[langKey]['common'] = deepMergeObj(
            initialResources[langKey]['common'] || {},
            resources
          )
        }
      })
    }
  })

  i18next.use(LanguageDetector).init({
    interpolation: { escapeValue: false },
    lng: i18n.defaultLocale,
    fallbackLng: i18n.defaultLocale,
    defaultNS: 'common',
    fallbackNS: 'common',
    resources: initialResources,
  })
}

const tourConfig = [
  {
    selector: '[data-tut="reactour__logo"]',
    content: `And this is our cool bus...`,
  },
  {
    selector: '[data-tut="reactour__iso"]',
    content: `Ok, let's start with the name of the Tour that is about to begin.`,
  },
]

const ForbiddenListener = () => {
  React.useEffect(() => {
    const unregister = onForbiddenError(() => {
      toast.error('Access Denied: You do not have permission to perform this action.', {
        toastId: 'forbidden-error',
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
      })
    })
    return () => {
      unregister()
    }
  }, [])

  return null
}

const NetworkSync = () => {
  useNetworkSync()
  return null
}

const ThemedTourProvider: React.FC<ChildrenType> = ({ children }) => {
  const theme = useTheme()

  const tourStyles = React.useMemo(
    () => ({
      close: (base: React.CSSProperties) => ({
        ...base,
        color: theme.palette.text.primary,
      }),
      popover: (base: React.CSSProperties) => ({
        ...base,
        boxShadow: '0 0 3em rgba(0, 0, 0, 0.5)',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }),
    }),
    [theme.palette.text.primary, theme.palette.background.paper]
  )

  return (
    <TourProvider steps={tourConfig} defaultOpen={false} rtl={theme.direction === 'rtl'} styles={tourStyles}>
      {children}
    </TourProvider>
  )
}

const GlobalThemeEditor = () => {
  const { saveTheme } = useTenant();
  const handleSave = React.useCallback((theme: any) => saveTheme(theme), [saveTheme]);
  return <ThemeEditor asDrawer onSave={handleSave} />;
};

const Providers: React.FC<ChildrenType> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18next}>
        <TenantProvider>
          <ThemeBridge>
            <GlobalZIndexStyles />
            <BrowserRouter>
              <ForbiddenListener />
              <NetworkSync />
              <ThemedTourProvider>
                <LayoutEngineProvider>
                  {children}
                </LayoutEngineProvider>
              </ThemedTourProvider>
              <GlobalThemeEditor />
              <WidgetMarketplaceDrawer />
              <WidgetInspectorDrawer />
            </BrowserRouter>
            <AppReactToastify position={themeConfig.toastPosition} hideProgressBar />
            <ReactQueryDevtools initialIsOpen={false} />
          </ThemeBridge>
        </TenantProvider>
      </I18nextProvider>
    </QueryClientProvider>
  )
}


export default Providers
