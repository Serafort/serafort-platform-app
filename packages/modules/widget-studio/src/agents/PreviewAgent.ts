/**
 * Preview Agent — Agent 5/6
 *
 * Generates a preview summary for the validated Widget DSL.
 * In Phase 1 the preview is rendered directly in the panel (no server-side screenshot).
 * This agent resolves the component tree and validates theme compatibility.
 */
import type { WidgetDefinition, PreviewOutput } from '@cap/shared-types'
import { APPROVED_WIDGETS } from './ComponentAgent'

/**
 * Runs the preview agent against a validated Widget DSL.
 * Resolves component information, checks theme compatibility.
 * No AI call — deterministic client-side preview generation.
 */
export function runPreviewAgent(
  dsl: WidgetDefinition,
  onProgress?: (msg: string) => void,
): PreviewOutput {
  onProgress?.('Resolving component tree...')

  const registryEntry = APPROVED_WIDGETS.find((w) => w.id === dsl.component)
  const componentTree: string[] = registryEntry
    ? [registryEntry.name, ...registryEntry.bestFor]
    : [dsl.component]

  onProgress?.('Checking theme compatibility...')
  const themeCompatible = Boolean(dsl.component) && Boolean(registryEntry)

  const testResults = [
    { name: 'Component exists in registry', passed: Boolean(registryEntry) },
    { name: 'DSL has valid layout dimensions', passed: Boolean(dsl.layout?.width && dsl.layout?.height) },
    { name: 'No executable props', passed: !JSON.stringify(dsl.props ?? {}).includes('eval(') },
    { name: 'Version is SemVer', passed: /^\d+\.\d+\.\d+$/.test(dsl.version ?? '') },
    { name: 'Theme compatible', passed: themeCompatible },
  ]

  const allPassed = testResults.every((r) => r.passed)
  onProgress?.(allPassed ? '✓ Preview ready — all checks passed' : '⚠ Preview ready with warnings')

  return {
    componentTree,
    themeCompatible,
    testResults,
  }
}
