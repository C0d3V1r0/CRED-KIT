import { APP_CONFIG } from '../config/appConfig';

export type TelemetryLevel = 'info' | 'warning' | 'error';

export interface TelemetryEvent {
  type: string;
  level: TelemetryLevel;
  message: string;
  details?: Record<string, unknown>;
}

export function sendTelemetry(event: TelemetryEvent): void {
  if (!APP_CONFIG.enableClientTelemetry) return;
  if (typeof window === 'undefined') return;

  // Добавляем базовый контекст здесь централизованно, чтобы во всех местах
  // отправки не дублировать path/ts/userAgent вручную.
  const payload = {
    ...event,
    path: window.location.pathname,
    ts: Date.now(),
    userAgent: navigator.userAgent
  };

  if (APP_CONFIG.telemetryEndpoint) {
    // Сначала sendBeacon: событие успеет уйти даже при закрытии вкладки.
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(APP_CONFIG.telemetryEndpoint, body);
      return;
    }

    // fetch оставляем как запасной канал для браузеров без sendBeacon.
    void fetch(APP_CONFIG.telemetryEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true
    });
    return;
  }

  if (event.level === 'error') {
    console.error('[telemetry]', payload);
    return;
  }

  console.info('[telemetry]', payload);
}
