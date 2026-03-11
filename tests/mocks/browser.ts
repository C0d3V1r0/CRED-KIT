import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Worker моков для браузерного запуска (при необходимости)
export const worker = setupWorker(...handlers);
