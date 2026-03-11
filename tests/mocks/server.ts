import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Сервер моков для node/jsdom тестов
export const server = setupServer(...handlers);
