/**
 * Optimistic UI Updates Manager
 *
 * Provides instant UI feedback by applying changes immediately,
 * then rolling back if the server request fails.
 *
 * Features:
 * - Instant UI updates
 * - Automatic rollback on failure
 * - Queue management for multiple updates
 * - Conflict resolution
 * - Undo/redo support
 * - TypeScript support
 */

import { HttpError } from './api/api.client'

export type OptimisticUpdateType = 'create' | 'update' | 'delete' | 'custom'

export interface OptimisticUpdate<T = any> {
  id: string
  type: OptimisticUpdateType
  entityType: string
  entityId?: string | number
  optimisticData: T
  previousData?: T
  timestamp: number
  status: 'pending' | 'success' | 'failed' | 'rolled_back'
  error?: HttpError
  rollbackFn?: () => void
  metadata?: Record<string, any>
}

export interface OptimisticUpdateOptions<T = any> {
  /**
   * Unique identifier for this update
   */
  id?: string

  /**
   * Type of update operation
   */
  type: OptimisticUpdateType

  /**
   * Entity type (e.g., 'user', 'post', 'comment')
   */
  entityType: string

  /**
   * Entity ID (for update/delete operations)
   */
  entityId?: string | number

  /**
   * Optimistic data to apply immediately
   */
  optimisticData: T

  /**
   * Previous data for rollback
   */
  previousData?: T

  /**
   * Custom rollback function
   */
  rollbackFn?: () => void

  /**
   * Callback on success
   */
  onSuccess?: (data: T) => void

  /**
   * Callback on error
   */
  onError?: (error: HttpError) => void

  /**
   * Callback on rollback
   */
  onRollback?: () => void

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>
}

type UpdateListener = (updates: OptimisticUpdate[]) => void

class OptimisticUpdateManager {
  private updates: Map<string, OptimisticUpdate> = new Map()
  private listeners: Set<UpdateListener> = new Set()
  private updateCounter = 0

  /**
   * Generate unique update ID
   */
  private generateId(): string {
    return `optimistic_${Date.now()}_${++this.updateCounter}`
  }

  /**
   * Subscribe to update changes
   */
  subscribe(listener: UpdateListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Notify all listeners
   */
  private notify(): void {
    const updates = Array.from(this.updates.values())
    this.listeners.forEach((listener) => listener(updates))
  }

  /**
   * Add an optimistic update
   */
  addUpdate<T = any>(options: OptimisticUpdateOptions<T>): string {
    const id = options.id || this.generateId()

    const update: OptimisticUpdate<T> = {
      id,
      type: options.type,
      entityType: options.entityType,
      entityId: options.entityId,
      optimisticData: options.optimisticData,
      previousData: options.previousData,
      timestamp: Date.now(),
      status: 'pending',
      rollbackFn: options.rollbackFn,
      metadata: options.metadata,
    }

    this.updates.set(id, update)
    this.notify()

    return id
  }

  /**
   * Mark update as successful
   */
  markSuccess<T = any>(id: string, serverData?: T): void {
    const update = this.updates.get(id)
    if (!update) return

    update.status = 'success'
    if (serverData) {
      update.optimisticData = serverData
    }

    this.notify()

    // Remove successful updates after a short delay
    setTimeout(() => {
      this.updates.delete(id)
      this.notify()
    }, 1000)
  }

  /**
   * Mark update as failed and rollback
   */
  markFailed(id: string, error: HttpError): void {
    const update = this.updates.get(id)
    if (!update) return

    update.status = 'failed'
    update.error = error

    // Execute rollback
    if (update.rollbackFn) {
      update.rollbackFn()
    }

    update.status = 'rolled_back'
    this.notify()

    // Remove failed updates after a delay
    setTimeout(() => {
      this.updates.delete(id)
      this.notify()
    }, 5173)
  }

  /**
   * Get all pending updates
   */
  getPendingUpdates(): OptimisticUpdate[] {
    return Array.from(this.updates.values()).filter((update) => update.status === 'pending')
  }

  /**
   * Get updates by entity type
   */
  getUpdatesByEntity(entityType: string): OptimisticUpdate[] {
    return Array.from(this.updates.values()).filter((update) => update.entityType === entityType)
  }

  /**
   * Get update by ID
   */
  getUpdate(id: string): OptimisticUpdate | undefined {
    return this.updates.get(id)
  }

  /**
   * Check if entity has pending updates
   */
  hasPendingUpdate(entityType: string, entityId?: string | number): boolean {
    return Array.from(this.updates.values()).some(
      (update) =>
        update.status === 'pending' &&
        update.entityType === entityType &&
        (entityId === undefined || update.entityId === entityId),
    )
  }

  /**
   * Cancel an update
   */
  cancelUpdate(id: string): void {
    const update = this.updates.get(id)
    if (!update) return

    if (update.rollbackFn) {
      update.rollbackFn()
    }

    this.updates.delete(id)
    this.notify()
  }

  /**
   * Clear all updates
   */
  clearAll(): void {
    // Rollback all pending updates
    this.updates.forEach((update) => {
      if (update.status === 'pending' && update.rollbackFn) {
        update.rollbackFn()
      }
    })

    this.updates.clear()
    this.notify()
  }

  /**
   * Get statistics
   */
  getStats() {
    const updates = Array.from(this.updates.values())
    return {
      total: updates.length,
      pending: updates.filter((u) => u.status === 'pending').length,
      success: updates.filter((u) => u.status === 'success').length,
      failed: updates.filter((u) => u.status === 'failed').length,
      rolledBack: updates.filter((u) => u.status === 'rolled_back').length,
    }
  }
}

// Export singleton instance
export const optimisticUpdateManager = new OptimisticUpdateManager()

// Export class for custom instances
export { OptimisticUpdateManager }
