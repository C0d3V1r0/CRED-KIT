import { http, HttpResponse } from 'msw';

// Централизованные HTTP-моки (расширяются по мере роста проекта)
export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ ok: true });
  })
];
