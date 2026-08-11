import "@testing-library/jest-dom/vitest";

// jsdom does not implement IntersectionObserver, which framer-motion's
// `whileInView` relies on. Provide a no-op stub so components animated on
// scroll can be rendered in unit tests.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(): void {}
}

globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

// jsdom does not implement ResizeObserver, which Radix UI primitives (e.g. the
// Select trigger) rely on. Provide a no-op stub so those components render.
class MockResizeObserver implements ResizeObserver {
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
}

globalThis.ResizeObserver =
  MockResizeObserver as unknown as typeof ResizeObserver;

// Node ≥ 24 exposes its own experimental `localStorage` global, which shadows
// jsdom's `Storage` with an inert object whose methods are missing entirely
// (`getItem is not a function`). Install a plain in-memory Storage so code
// that persists a preference behaves the same here as in a browser.
class MemoryStorage implements Storage {
  #entries = new Map<string, string>();

  get length(): number {
    return this.#entries.size;
  }

  clear(): void {
    this.#entries.clear();
  }

  getItem(key: string): string | null {
    return this.#entries.get(String(key)) ?? null;
  }

  key(index: number): string | null {
    return [...this.#entries.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.#entries.delete(String(key));
  }

  setItem(key: string, value: string): void {
    this.#entries.set(String(key), String(value));
  }
}

for (const name of ["localStorage", "sessionStorage"] as const) {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    value: new MemoryStorage(),
    writable: true,
  });
}
