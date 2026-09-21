// Minimal test setup for theme module
import "@testing-library/jest-dom";

/**
 * Node 22+ ships an experimental `localStorage` global that is `undefined`
 * unless the process is started with `--localstorage-file`. Under Node 26 that
 * global shadows the jsdom-provided `window.localStorage`, so `savedThemeStore`
 * and anything else that reaches for web storage sees `undefined` and throws
 * `Cannot read properties of undefined (reading 'clear')`. When that happens,
 * install a small in-memory `Storage` implementation and point the global
 * `Storage` constructor at it too, so tests that spy on `Storage.prototype`
 * (e.g. `vi.spyOn(Storage.prototype, "setItem")`) patch the methods the shimmed
 * instances actually use.
 */
class MemoryStorage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

const storageWorks = (candidate: unknown): boolean => {
  try {
    if (!candidate || typeof (candidate as Storage).setItem !== "function") return false;
    (candidate as Storage).setItem("__probe__", "1");
    (candidate as Storage).removeItem("__probe__");
    return true;
  } catch {
    return false;
  }
};

if (!storageWorks((globalThis as { localStorage?: unknown }).localStorage)) {
  const g = globalThis as Record<string, unknown>;
  g.Storage = MemoryStorage;
  for (const scope of [g, typeof window !== "undefined" ? (window as unknown as Record<string, unknown>) : undefined]) {
    if (!scope) continue;
    for (const name of ["localStorage", "sessionStorage"]) {
      Object.defineProperty(scope, name, {
        configurable: true,
        writable: true,
        value: new MemoryStorage(),
      });
    }
  }
}
