import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { sendTelemetry } from '../../utils/telemetry';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  errorMessage: string | null;
}

// Для надёжного перехвата ошибок рендера здесь используется компонент-граница ошибок на классе.
// Это точечное исключение из процедурного стиля, потому что без него ошибки дерева
// компонентов не перехватываются достаточно рано и безопасно для восстановления интерфейса.
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { errorMessage: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { errorMessage: error.message || 'Неизвестная ошибка рендера' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    sendTelemetry({
      type: 'react_render_error',
      level: 'error',
      message: error.message || 'Неизвестная ошибка рендера',
      details: {
        componentStack: errorInfo.componentStack?.slice(0, 4000) ?? ''
      }
    });
  }

  handleReset(): void {
    this.setState({ errorMessage: null });
  }

  render() {
    if (this.state.errorMessage) {
      return (
        <div className="min-h-screen bg-cyber-black text-cyber-text flex items-center justify-center p-6">
          <div className="card-cyber max-w-xl w-full space-y-4">
            <h1 className="text-xl font-bold text-cyber-accent">Ошибка рендера интерфейса</h1>
            <p className="text-cyber-muted">
              Один из компонентов упал во время рендера. Данные не удалены, можно попробовать восстановиться.
            </p>
            <pre className="text-xs text-cyber-cyan bg-cyber-dark/80 border border-cyber-cyan/30 rounded-lg p-3 overflow-x-auto">
              {this.state.errorMessage}
            </pre>
            <div className="flex gap-2">
              <button type="button" className="btn" onClick={() => window.location.reload()}>
                Перезагрузить
              </button>
              <button type="button" className="btn-outline" onClick={this.handleReset}>
                Попробовать продолжить
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
