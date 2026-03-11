import { beforeAll, afterAll, vi } from 'vitest';

// Убираем лишний шум логов в модульных тестах
const originalLog = console.log;
const originalError = console.error;

beforeAll(() => {
  console.log = vi.fn();
  console.error = vi.fn();
});

afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
});
