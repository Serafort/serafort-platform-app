/**
 * Singleton ResizeObserver utility for high-performance element resize tracking across the app.
 * Uses a single ResizeObserver instance and a WeakMap callback lookup to prevent memory leaks
 * and avoid overhead from creating multiple observers.
 *
 * Also injects CSS custom properties (--container-width, --container-height) onto observed
 * elements so widget stylesheets can use var(--container-width) without any JS in the widget.
 */

export type ResizeBoxSizing = 'content-box' | 'border-box' | 'device-pixel-content-box'

export interface ObserveOptions {
  /** Which box model to observe. Defaults to 'content-box'. */
  box?: ResizeBoxSizing
  /** Whether to inject --container-width / --container-height CSS custom properties onto the element. Defaults to true. */
  injectCssVars?: boolean
}

type ResizeCallback = (entry: ResizeObserverEntry) => void

interface ObserverState {
  callback: ResizeCallback
  options: Required<ObserveOptions>
}

const registry = new WeakMap<Element, ObserverState>()
let observerInstance: ResizeObserver | null = null

function getObserver(): ResizeObserver | null {
  if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
    return null
  }

  if (!observerInstance) {
    observerInstance = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const state = registry.get(entry.target)
        if (!state) continue

        const { callback, options } = state

        if (options.injectCssVars && entry.target instanceof HTMLElement) {
          const { width, height } = entry.contentRect
          entry.target.style.setProperty('--container-width', `${width}px`)
          entry.target.style.setProperty('--container-height', `${height}px`)
        }

        callback(entry)
      }
    })
  }

  return observerInstance
}

/**
 * Observe a DOM element's size changes.
 * @param element The target HTMLElement or Element to observe.
 * @param callback Callback function triggered when element resizes.
 * @param options Box model and CSS variable injection options.
 * @returns Cleanup function to unobserve the element.
 */
export function observeElement(
  element: Element,
  callback: ResizeCallback,
  options: ObserveOptions = {}
): () => void {
  const observer = getObserver()
  if (!observer || !element) {
    return () => {}
  }

  const resolvedOptions: Required<ObserveOptions> = {
    box: options.box ?? 'content-box',
    injectCssVars: options.injectCssVars ?? true,
  }

  registry.set(element, { callback, options: resolvedOptions })
  observer.observe(element, { box: resolvedOptions.box })

  return () => {
    unobserveElement(element)
  }
}

/**
 * Unobserve a DOM element and clean up injected CSS custom properties.
 * @param element The target Element to stop observing.
 */
export function unobserveElement(element: Element): void {
  const observer = getObserver()
  const state = registry.get(element)

  if (state?.options.injectCssVars && element instanceof HTMLElement) {
    element.style.removeProperty('--container-width')
    element.style.removeProperty('--container-height')
  }

  if (registry.has(element)) {
    registry.delete(element)
  }

  if (observer && element) {
    observer.unobserve(element)
  }
}

