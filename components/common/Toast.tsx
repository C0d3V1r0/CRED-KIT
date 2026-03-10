import { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  title?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type'], duration?: number, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_ICONS = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'ℹ'
};

const TOAST_STYLES = {
  success: 'bg-cyber-green/15 border-cyber-green/30 text-cyber-green',
  error: 'bg-cyber-accent/15 border-cyber-accent/30 text-cyber-accent',
  warning: 'bg-cyber-yellow/15 border-cyber-yellow/30 text-cyber-yellow',
  info: 'bg-cyber-cyan/15 border-cyber-cyan/30 text-cyber-cyan'
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [progress, setProgress] = useState(100);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!toast.duration) return;

    const interval = 100;
    const step = 100 / (toast.duration / interval);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast.duration]);

  const handleClose = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  }, [toast.id, onRemove]);

  useEffect(() => {
    if (progress <= 0) {
      handleClose();
    }
  }, [progress, handleClose]);

  return (
    <div
      className={`
        toast-item
        relative overflow-hidden
        px-4 py-3 rounded-lg shadow-lg
        flex items-start gap-3 min-w-[320px] max-w-md
        border backdrop-blur-sm
        transition-all duration-200
        ${exiting ? 'animate-scale-out opacity-0 translate-x-full' : 'animate-slide-in-right'}
        ${TOAST_STYLES[toast.type]}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Полоса прогресса */}
      {toast.duration && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-current opacity-20">
          <div
            className="h-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Иконка */}
      <span className="text-lg flex-shrink-0 mt-0.5">
        {TOAST_ICONS[toast.type]}
      </span>

      {/* Контент уведомления */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-sm mb-0.5">{toast.title}</p>
        )}
        <p className="text-sm opacity-90">{toast.message}</p>
      </div>

      {/* Кнопка закрытия */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded hover:bg-current/10 transition-colors"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 4000, title?: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, type, message, duration, title }]);
  }, []);

  const success = useCallback((message: string, title?: string) => {
    showToast(message, 'success', 4000, title);
  }, [showToast]);

  const error = useCallback((message: string, title?: string) => {
    showToast(message, 'error', 5000, title);
  }, [showToast]);

  const warning = useCallback((message: string, title?: string) => {
    showToast(message, 'warning', 4000, title);
  }, [showToast]);

  const info = useCallback((message: string, title?: string) => {
    showToast(message, 'info', 4000, title);
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {createPortal(
        <div className="toast-viewport fixed bottom-6 right-6 z-[9999] space-y-3">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
