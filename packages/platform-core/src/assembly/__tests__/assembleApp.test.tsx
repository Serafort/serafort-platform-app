
import { describe, it, expect } from 'vitest';
import i18next from 'i18next';
import { assembleApp } from '../index';
import { CAPModule } from '../../types';

describe('assembleApp layout association', () => {
  it('compiles app with routes wrapped in LayoutRouteWrapper', () => {
    const dummyModule: CAPModule = {
      id: 'dummy-module',
      version: '1.0.0',
      authRouteConfig: [
        {
          path: '/test-auth',
          element: <div>Auth Screen</div>,
          layout: 'noLayout',
        },
      ],
    }

    const App = assembleApp({ modules: [dummyModule] })
    expect(App).toBeDefined()
    expect(typeof App).toBe('function')
  })
})

describe('assembleApp i18n namespace isolation', () => {
  it('isolates module i18n resources strictly by module id/name to prevent collisions', () => {
    const moduleA: CAPModule = {
      id: 'module-a',
      version: '1.0.0',
      i18n: {
        en: {
          title: 'Module A Title',
          welcome: 'Welcome to A',
        },
      },
    }

    const moduleB: CAPModule = {
      id: 'module-b',
      version: '1.0.0',
      i18n: {
        en: {
          title: 'Module B Title',
          welcome: 'Welcome to B',
        },
      },
    }

    assembleApp({ modules: [moduleA, moduleB] })

    const i18nInstance = (i18next as any)?.default || i18next
    const bundleA = i18nInstance.getResourceBundle('en', 'module-a')
    const bundleB = i18nInstance.getResourceBundle('en', 'module-b')

    expect(bundleA).toEqual({ title: 'Module A Title', welcome: 'Welcome to A' })
    expect(bundleB).toEqual({ title: 'Module B Title', welcome: 'Welcome to B' })
  })
})

describe('assembleApp catch-all route', () => {
  it('renders NotFound component for unmatched URLs', () => {
    const { MemoryRouter } = require('react-router-dom')
    const { render, screen } = require('@testing-library/react')

    const App = assembleApp({ modules: [] })
    render(
      <MemoryRouter initialEntries={['/non-existent-route']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
  })
})
