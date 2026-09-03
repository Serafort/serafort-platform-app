import { globalPluginRegistry } from '../registry/PluginRegistry';
import type { ComponentType } from '@cap/shared-types';

/**
 * Hook to dynamically resolve a component from the global plugin registry.
 * This allows modules to consume components from other modules without hard dependencies.
 *
 * @param name The unique name of the component (e.g., 'CustomAvatar', 'UserPreferences')
 * @param fallback Optional fallback component to return if the requested component is not found
 * @returns The resolved component or the fallback
 */
export function useModuleComponent<T = ComponentType>(
  name: string,
  fallback?: T
): T | undefined {
  const component = globalPluginRegistry.getComponent<T>(name);
  return component ?? fallback;
}
