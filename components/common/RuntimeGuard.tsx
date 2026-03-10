import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { sendTelemetry } from '../../utils/telemetry';

interface RuntimeGuardProps {
  children: ReactNode;
}

interface RuntimeIssue {
  message: string;
}

export function RuntimeGuard({ children }: RuntimeGuardProps) {
  const [issue, setIssue] = useState<RuntimeIssue | null>(null);

  useEffect(() => {
    // Ловим фатальные ошибки на уровне окна и переключаем интерфейс в безопасный режим.
    // Это лучше, чем "тихое" падение рендер-дерева без понятного действия для пользователя.
    const onError = (event: ErrorEvent) => {
      const message = event.error instanceof Error ? event.error.message : (event.message || 'Неизвестная ошибка');
      setIssue({ message });
      sendTelemetry({
        type: 'runtime_error',
        level: 'error',
        message,
        details: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason ?? 'Unhandled rejection');
      setIssue({ message: reason });
      sendTelemetry({
        type: 'unhandled_rejection',
        level: 'error',
        message: reason
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  if (issue) {
    return (
      <div className="min-h-screen bg-cyber-black text-cyber-text flex items-center justify-center p-6">
        <div className="card-cyber max-w-xl w-full space-y-4">
          <h1 className="text-xl font-bold text-cyber-accent">Критическая ошибка интерфейса</h1>
          <p className="text-cyber-muted">
            Приложение поймало исключение и остановило рендер, чтобы не испортить данные.
          </p>
          <pre className="text-xs text-cyber-cyan bg-cyber-dark/80 border border-cyber-cyan/30 rounded-lg p-3 overflow-x-auto">
            {issue.message}
          </pre>
          <div className="flex gap-2">
            <button type="button" className="btn" onClick={() => window.location.reload()}>
              Перезагрузить
            </button>
            <button type="button" className="btn-outline" onClick={() => setIssue(null)}>
              Попробовать продолжить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
