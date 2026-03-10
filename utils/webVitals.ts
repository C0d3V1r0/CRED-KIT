import { APP_CONFIG } from '../config/appConfig';

type WebVitalName = 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB';

interface WebVitalMetric {
  name: WebVitalName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

const metricsBuffer = new Set<string>();

function getRating(name: WebVitalName, value: number): WebVitalMetric['rating'] {
  switch (name) {
    case 'LCP':
      if (value <= 2500) return 'good';
      if (value <= 4000) return 'needs-improvement';
      return 'poor';
    case 'CLS':
      if (value <= 0.1) return 'good';
      if (value <= 0.25) return 'needs-improvement';
      return 'poor';
    case 'FID':
      if (value <= 100) return 'good';
      if (value <= 300) return 'needs-improvement';
      return 'poor';
    case 'FCP':
      if (value <= 1800) return 'good';
      if (value <= 3000) return 'needs-improvement';
      return 'poor';
    case 'TTFB':
      if (value <= 800) return 'good';
      if (value <= 1800) return 'needs-improvement';
      return 'poor';
    default:
      return 'needs-improvement';
  }
}

function sendMetric(metric: WebVitalMetric): void {
  const dedupeKey = `${metric.name}:${Math.round(metric.value)}`;
  if (metricsBuffer.has(dedupeKey)) return;
  metricsBuffer.add(dedupeKey);

  // Держим единый формат payload для RUM и локальной диагностики.
  const payload = {
    ...metric,
    path: window.location.pathname,
    ts: Date.now(),
    userAgent: navigator.userAgent
  };

  if (APP_CONFIG.webVitalsEndpoint) {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(APP_CONFIG.webVitalsEndpoint, body);
      return;
    }
    void fetch(APP_CONFIG.webVitalsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true
    });
    return;
  }

  // По умолчанию сохраняем метрики локально, чтобы можно было
  // быстро проверить реальное поведение в прод-сборке без backend.
  console.info('[web-vitals]', payload);
}

function reportMetric(name: WebVitalName, value: number): void {
  if (!Number.isFinite(value)) return;
  sendMetric({
    name,
    value,
    rating: getRating(name, value)
  });
}

export function initWebVitals(): void {
  if (!APP_CONFIG.enableWebVitals) return;
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;

  // TTFB/FCP стараемся взять сразу из уже накопленных записей performance,
  // чтобы не терять метрики при поздней инициализации приложения.
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (navEntry?.responseStart) {
    reportMetric('TTFB', navEntry.responseStart);
  }

  const firstPaintEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry | undefined;
  if (firstPaintEntry?.startTime) {
    reportMetric('FCP', firstPaintEntry.startTime);
  } else {
    try {
      const paintObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            reportMetric('FCP', entry.startTime);
          }
        }
      });
      paintObserver.observe({ type: 'paint', buffered: true });
    } catch {
      // Пустой обработчик: ошибка не критична для выполнения.
    }
  }

  try {
    let lcp = 0;
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) lcp = lastEntry.startTime;
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    const onHidden = () => {
      if (document.visibilityState === 'hidden' && lcp > 0) {
        reportMetric('LCP', lcp);
        lcpObserver.disconnect();
      }
    };
    document.addEventListener('visibilitychange', onHidden, { once: true });
  } catch {
    // Пустой обработчик: ошибка не критична для выполнения.
  }

  try {
    let cls = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as Array<PerformanceEntry & { value?: number; hadRecentInput?: boolean }>) {
        if (!entry.hadRecentInput && typeof entry.value === 'number') {
          cls += entry.value;
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    const onHidden = () => {
      if (document.visibilityState === 'hidden') {
        reportMetric('CLS', cls);
        clsObserver.disconnect();
      }
    };
    document.addEventListener('visibilitychange', onHidden, { once: true });
  } catch {
    // Пустой обработчик: ошибка не критична для выполнения.
  }

  try {
    const fidObserver = new PerformanceObserver((entryList) => {
      const firstInput = entryList.getEntries()[0] as PerformanceEntry & { processingStart?: number };
      if (!firstInput || typeof firstInput.processingStart !== 'number') return;
      reportMetric('FID', firstInput.processingStart - firstInput.startTime);
      fidObserver.disconnect();
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch {
    // Пустой обработчик: ошибка не критична для выполнения.
  }
}
