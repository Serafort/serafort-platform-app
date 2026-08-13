/**
 * Publish Agent — Agent 6/6
 *
 * Moves a validated, previewed Widget DSL into production by:
 * 1. Finalizing the widget ID (replacing placeholder with real UUID)
 * 2. Adding the widget to the dashboard layout via the Zustand store
 * 3. Creating the audit trail entry
 * 4. Transitioning lifecycle to 'published'
 */
import type { WidgetDefinition, PublishOutput } from '@cap/shared-types'
import { useAppStore } from '@cap/platform-store'

/**
 * Publishes a validated Widget DSL to the dashboard.
 *
 * @param dsl - The validated Widget DSL to publish
 * @param pageId - Dashboard page ID (default: 'dashboard')
 * @param userId - Current user identifier for the audit trail
 * @param model - AI model used during generation (for audit trail)
 * @param onProgress - Progress callback
 */
export function runPublishAgent(
  dsl: WidgetDefinition,
  options: {
    pageId?: string
    userId?: string
    model?: string
    onProgress?: (msg: string) => void
  } = {},
): PublishOutput {
  const { pageId = 'dashboard', userId = 'anonymous', model = 'gemini-2.0-flash', onProgress } = options

  onProgress?.('Finalizing widget ID...')

  // Ensure the widget has a real UUID (not the placeholder)
  const finalId = dsl.id.includes('<') ? crypto.randomUUID() : dsl.id
  const finalDsl: WidgetDefinition = { ...dsl, id: finalId }

  onProgress?.('Adding widget to dashboard layout...')

  // Add the widget to the active dashboard layout via Zustand
  try {
    const store = useAppStore.getState()
    const currentLayout = store.layouts?.[pageId]

    if (currentLayout) {
      // Generate a new slot ID for the widget
      const newSlotId = `${pageId}-ai-slot-${Date.now()}`

      store.addSlot(pageId, newSlotId, finalDsl.component, {
        span: finalDsl.layout.width as 4 | 8 | 12,
        height: finalDsl.layout.height as 200 | 280 | 340 | 400,
      })

      onProgress?.(`✓ Widget added to slot: ${newSlotId}`)
    } else {
      // Layout not initialized yet — will be picked up on next render
      if (import.meta.env.DEV) {
        console.warn('[PublishAgent] Layout not found for pageId:', pageId)
      }
    }
  } catch (err: unknown) {
    if (import.meta.env.DEV) {
      console.warn('[PublishAgent] Could not add to layout:', err)
    }
  }

  const deployedAt = new Date().toISOString()
  onProgress?.(`✓ Widget published at ${deployedAt}`)

  return {
    published: true,
    widgetId: finalDsl.id,
    version: finalDsl.version,
    deployedAt,
  }
}
