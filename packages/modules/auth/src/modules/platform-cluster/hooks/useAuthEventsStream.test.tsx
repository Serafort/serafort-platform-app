// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import useAuthEventsStream from './useAuthEventsStream'

vi.mock('../services/admin-monitoring.service', () => ({
  default: {
    getAuditLogs: vi.fn(),
  },
}))

describe('useAuthEventsStream', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock global EventSource
    global.EventSource = vi.fn().mockImplementation(() => ({
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
    })) as any
  })

  it('initializes with disconnected status and allows pause toggling', () => {
    const { result } = renderHook(() =>
      useAuthEventsStream({
        autoConnect: false,
        enableFallbackPolling: false,
      })
    )

    expect(result.current.status).toBe('disconnected')
    expect(result.current.isPaused).toBe(false)
    expect(result.current.events).toHaveLength(0)

    act(() => {
      result.current.togglePause()
    })

    expect(result.current.status).toBe('paused')
    expect(result.current.isPaused).toBe(true)
  })

  it('clearEvents resets event buffer', () => {
    const { result } = renderHook(() =>
      useAuthEventsStream({
        autoConnect: false,
        enableFallbackPolling: false,
      })
    )

    act(() => {
      result.current.clearEvents()
    })

    expect(result.current.events).toHaveLength(0)
    expect(result.current.count).toBe(0)
  })
})
