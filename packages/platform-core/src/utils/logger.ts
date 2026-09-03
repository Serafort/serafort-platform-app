/**
 * Core Platform Logger
 */
export const logger = {
  info: (message: string, ...args: unknown[]): void => {
    if (import.meta.env.DEV) {
      console.info(`[Platform] ${message}`, ...args)
    }
  },
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(`[Platform] ${message}`, ...args)
  },
  error: (message: string, ...args: unknown[]): void => {
    console.error(`[Platform] ${message}`, ...args)
  },
  debug: (message: string, ...args: unknown[]): void => {
    if (import.meta.env.DEV) {
      console.debug(`[Platform] ${message}`, ...args)
    }
  },
}

export default logger
