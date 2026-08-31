// @vitest-environment jsdom
import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { LayoutRouteWrapper } from './LayoutRouteWrapper'
import { useAppStore } from '@cap/platform-store'
import { RouteLayoutEnum } from '@cap/shared-types'

beforeAll(() => {
  if (typeof (import.meta as any).env === 'undefined') {
    ;(import.meta as any).env = {}
  }
  ;(import.meta as any).env.VITE_STORAGE_ENCRYPTION_KEY = 'test-key-32-chars-long-secret-key-ok!'
})

describe('LayoutRouteWrapper', () => {
  beforeEach(() => {
    cleanup()
    useAppStore.setState({ layoutOverride: 'none' })
  })

  it('sets layoutOverride to noLayout on mount and resets to none on unmount', () => {
    const { unmount } = render(
      <LayoutRouteWrapper layout={RouteLayoutEnum.NO_LAYOUT}>
        <div>Test Page</div>
      </LayoutRouteWrapper>,
    )

    expect(useAppStore.getState().layoutOverride).toBe('noLayout')

    unmount()

    expect(useAppStore.getState().layoutOverride).toBe('none')
  })

  it('renders child element cleanly', () => {
    const { getByText } = render(
      <LayoutRouteWrapper layout='admin'>
        <div>Admin Content</div>
      </LayoutRouteWrapper>,
    )

    expect(getByText('Admin Content')).toBeTruthy()
  })
})
