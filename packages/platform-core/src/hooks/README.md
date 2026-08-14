# Domain Hooks
This directory contains domain-specific React hooks (e.g. auth, navigation, user state) for the application logic.

**Canonical hooks in this directory:**
- `useAuth` - Authentication state and methods
- `useNavigation` - Navigation utilities
- `usePermissions` - Role and permission checks
- `useObjectCookie` - Cookie-based object storage (canonical implementation)
- `useDynamicTheme` - Dynamic theme switching
- `useModuleComponent` - Resolves and renders a dynamically registered module component
- `useNetworkSync` - Network state synchronization
- `useUser` - User data and preferences

**Container / Responsive layout hooks:**
- `useResizeObserver(ref, options)` - Singleton-backed element size observation returning `{ width, height, containerSize, entry }`. Supports debounce, box model selection, CSS custom property injection (`--container-width`/`--container-height`), and an imperative `onResize` callback mode.
- `useContainerQuery(ref, predicate)` - Returns a stable boolean that flips only when the predicate result changes, not on every pixel. Use for conditional rendering.
- `useContainerSize()` - Reads the nearest `ContainerSizeProvider` ancestor's measured size (use inside widgets to get their host slot dimensions without prop drilling).
- `useContainerSizeClass()` - Returns just the `ContainerSize` enum (`'xs' | 'sm' | 'md' | 'lg' | 'xl'`).

For infrastructure or technical utility hooks (like debouncing, API calls, optimistic updates, SSE connections), see the `src/services/hooks` directory.

## Re-exports
Components can re-export hooks from this directory for convenience:
```ts
export { useObjectCookie } from '@cap/platform-core'
export { useResizeObserver, useContainerQuery, useContainerSize } from '@cap/platform-core'
```
