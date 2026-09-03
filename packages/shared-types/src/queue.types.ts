/**
 * Offline Queue Type Definitions
 *
 * Generic types for offline request queue management.
 */

// ============================================
// Offline Queue Types
// ============================================

export type QueueHttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface OfflineQueueEntry {
  id: string
  method: QueueHttpMethod
  url: string
  body: unknown
  timestamp: number
  retryCount: number
}

export interface OfflineQueueEntryInput {
  method: QueueHttpMethod
  url: string
  body: unknown
}

// ============================================
// Generic Queue Types
// ============================================

export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface QueueItem<T = unknown> {
  id: string
  data: T
  status: QueueStatus
  createdAt: number
  processedAt?: number
  error?: string
  retryCount: number
  maxRetries: number
}

export interface QueueConfig {
  maxRetries: number
  retryDelay: number
  maxConcurrency: number
}

// ============================================
// Type Guards
// ============================================

export function isOfflineQueueEntry(value: unknown): value is OfflineQueueEntry {
  if (!value || typeof value !== 'object') return false
  const e = value as Record<string, unknown>
  const validMethods: QueueHttpMethod[] = ['POST', 'PUT', 'PATCH', 'DELETE']
  return (
    typeof e.id === 'string' &&
    validMethods.includes(e.method as QueueHttpMethod) &&
    typeof e.url === 'string' &&
    typeof e.timestamp === 'number' &&
    typeof e.retryCount === 'number'
  )
}

export function isQueueItem<T>(value: unknown): value is QueueItem<T> {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  const validStatuses: QueueStatus[] = ['pending', 'processing', 'completed', 'failed']
  return (
    typeof item.id === 'string' &&
    validStatuses.includes(item.status as QueueStatus) &&
    typeof item.createdAt === 'number' &&
    typeof item.retryCount === 'number'
  )
}
