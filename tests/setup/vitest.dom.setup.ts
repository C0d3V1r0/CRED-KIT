import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from '../mocks/server';

let mockPathname = '/ru/app';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn((nextPath: string) => {
      mockPathname = nextPath;
    }),
    replace: vi.fn((nextPath: string) => {
      mockPathname = nextPath;
    }),
    prefetch: vi.fn()
  }),
  usePathname: () => mockPathname
}));

// Стабильный matchMedia для jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Стабильная имитация localStorage для тестовой среды
let localStorageStore = new Map<string, string>();
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore.set(key, String(value));
  }),
  clear: vi.fn(() => {
    localStorageStore.clear();
  }),
  removeItem: vi.fn((key: string) => {
    localStorageStore.delete(key);
  })
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorageStore = new Map<string, string>();
  mockPathname = '/ru/app';
});

afterAll(() => {
  server.close();
});
