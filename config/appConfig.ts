export const APP_CONFIG = {
  versionLabel: 'v1.0.2 [BETA]',
  siteUrl: '',
  donateUrl: '',
  bugReportEmail: 'den.ku0005@gmail.com',
  bugReportEndpoint: 'https://formsubmit.co/ajax/den.ku0005@gmail.com',
  // По умолчанию отключено: без endpoint локальные логи в проде только шумят.
  webVitalsEndpoint: '',
  enableWebVitals: false,
  telemetryEndpoint: '',
  enableClientTelemetry: false
} as const;
