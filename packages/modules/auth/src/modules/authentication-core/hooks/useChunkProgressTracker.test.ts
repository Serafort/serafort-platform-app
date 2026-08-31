import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useChunkProgressTracker } from './useChunkProgressTracker'

describe('useChunkProgressTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes with default state values', () => {
    const { result } = renderHook(() =>
      useChunkProgressTracker({
        totalChunks: 10,
        chunkSize: 50,
        bytesPerChunk: 1024,
      }),
    )

    expect(result.current.progress).toBe(0)
    expect(result.current.processedChunks).toBe(0)
    expect(result.current.totalChunks).toBe(10)
    expect(result.current.totalItems).toBe(500)
    expect(result.current.processedItems).toBe(0)
    expect(result.current.isProcessing).toBe(false)
    expect(result.current.isComplete).toBe(false)
    expect(result.current.totalBytesFormatted).toBe('10 KB')
  })

  it('increments chunks and updates progress smoothly over intervals when started', () => {
    const { result } = renderHook(() =>
      useChunkProgressTracker({
        totalChunks: 20,
        chunkSize: 10,
        updateIntervalMs: 100,
      }),
    )

    act(() => {
      result.current.start()
    })

    expect(result.current.isProcessing).toBe(true)

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.processedChunks).toBeGreaterThan(0)
    expect(result.current.progress).toBeGreaterThan(0)
  })

  it('completes operation when finish() is called', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useChunkProgressTracker({
        totalChunks: 10,
        chunkSize: 100,
        onComplete,
      }),
    )

    act(() => {
      result.current.start()
    })

    act(() => {
      result.current.finish()
    })

    expect(result.current.progress).toBe(100)
    expect(result.current.processedChunks).toBe(10)
    expect(result.current.isProcessing).toBe(false)
    expect(result.current.isComplete).toBe(true)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('resets state correctly when reset() is called', () => {
    const { result } = renderHook(() =>
      useChunkProgressTracker({
        totalChunks: 10,
        chunkSize: 100,
      }),
    )

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(500)
      result.current.reset()
    })

    expect(result.current.progress).toBe(0)
    expect(result.current.processedChunks).toBe(0)
    expect(result.current.isProcessing).toBe(false)
    expect(result.current.isComplete).toBe(false)
  })

  it('allows manual stepChunk execution', () => {
    const { result } = renderHook(() =>
      useChunkProgressTracker({
        totalChunks: 5,
        chunkSize: 20,
      }),
    )

    act(() => {
      result.current.stepChunk(2)
    })

    expect(result.current.processedChunks).toBe(2)
    expect(result.current.progress).toBe(40)
  })
})
