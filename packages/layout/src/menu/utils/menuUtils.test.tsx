// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import React from 'react'
import { Link } from 'react-router-dom'
import { confirmUrlInChildren } from './menuUtils'

describe('confirmUrlInChildren', () => {
  it('matches a React Router <Link to="..."> passed as a component prop', () => {
    // Mirrors how MenuItem actually builds nav items:
    // component={item.path ? <Link to={item.path} /> : 'div'}
    const children = React.createElement('div', { component: <Link to='/dashboard' /> })

    expect(confirmUrlInChildren(children, '/dashboard')).toBe(true)
    expect(confirmUrlInChildren(children, '/account')).toBe(false)
  })

  it('matches a direct "to" prop', () => {
    const children = React.createElement('div', { to: '/account' })

    expect(confirmUrlInChildren(children, '/account')).toBe(true)
  })

  it('still matches a bare "href" prop for backward compatibility', () => {
    const children = React.createElement('div', { href: '/legacy' })

    expect(confirmUrlInChildren(children, '/legacy')).toBe(true)
  })

  it('recurses into nested children to find a matching descendant', () => {
    const children = React.createElement('div', {
      children: React.createElement('div', { component: <Link to='/settings/profile' /> }),
    })

    expect(confirmUrlInChildren(children, '/settings/profile')).toBe(true)
  })

  it('returns false when nothing matches', () => {
    const children = React.createElement('div', { component: <Link to='/dashboard' /> })

    expect(confirmUrlInChildren(children, '/nowhere')).toBe(false)
  })

  it('returns false for empty children', () => {
    expect(confirmUrlInChildren(undefined, '/dashboard')).toBe(false)
  })
})
