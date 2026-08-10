import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RouteGuard } from '../enforcement/RouteGuard'
import { policyEngine } from '../engine/engine'
import { useAppStore } from '@cap/platform-store'

describe('RouteGuard Component', () => {
  beforeEach(() => {
    policyEngine.setPolicySet({
      version: '1.0.0',
      defaultEffect: 'deny',
      policies: [
        {
          id: 'test-policy',
          rules: [
            {
              effect: 'allow',
              roles: ['admin'],
              actions: ['access'],
              resources: ['admin-route'],
            },
          ],
        },
      ],
    })
  })

  it('renders children when allowed', () => {
    useAppStore.setState({
      isAuthenticated: true,
      user: { id: 1, email: 'admin@test.com', role: 'admin', permissions: [] } as any,
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RouteGuard action="access" resource={{ type: 'admin-route' }}>
                <div>Admin Dashboard Content</div>
              </RouteGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Admin Dashboard Content')).toBeDefined()
  })

  it('redirects/renders fallback when denied', () => {
    useAppStore.setState({
      isAuthenticated: true,
      user: { id: 2, email: 'user@test.com', role: 'user', permissions: [] } as any,
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RouteGuard
                action="access"
                resource={{ type: 'admin-route' }}
                fallback={<div>Access Denied (403)</div>}
              >
                <div>Admin Dashboard Content</div>
              </RouteGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.queryByText('Admin Dashboard Content')).toBeNull()
    expect(screen.getByText('Access Denied (403)')).toBeDefined()
  })
})
