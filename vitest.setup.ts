import "@testing-library/jest-dom";

// Provide a fake API key so agent tests don't throw before constructing the mocked client
process.env["ANTHROPIC_API_KEY"] = process.env["ANTHROPIC_API_KEY"] ?? "test-api-key";

// Node 22+ ships a built-in `localStorage` stub that emits a warning and
// doesn't implement the Web Storage API properly when run without
// --localstorage-file. Replace it with a simple in-memory map so that
// jsdom tests work correctly on Node 22+.
if (typeof localStorage === "undefined" || typeof localStorage.removeItem !== "function") {
  const store = new Map<string, string>();
  const mock: Storage = {
    get length() { return store.size; },
    key(index: number) { return [...store.keys()][index] ?? null; },
    getItem(key: string) { return store.get(key) ?? null; },
    setItem(key: string, value: string) { store.set(key, value); },
    removeItem(key: string) { store.delete(key); },
    clear() { store.clear(); },
  };
  Object.defineProperty(globalThis, "localStorage", { value: mock, writable: true });
}
