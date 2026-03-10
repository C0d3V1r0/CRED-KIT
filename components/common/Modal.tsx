import { useEffect, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../utils/icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showClose?: boolean;
}

// модальное окно
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true
}: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  }[size];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* оверлей */}
      <div
        className="absolute inset-0 bg-cyber-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* контент */}
      <div className={`relative w-full ${sizeClass} max-h-[calc(100vh-24px)] overflow-hidden rounded-2xl border border-cyber-gray/30 bg-cyber-surface shadow-2xl animate-scale-in sm:max-h-[calc(100vh-32px)]`}>
        {/* заголовок */}
        {title && (
          <div className="flex items-center justify-between gap-3 border-b border-cyber-gray/20 px-4 py-4 sm:px-6">
            <h3 className="text-base font-bold text-cyber-accent sm:text-lg">{title}</h3>
            {showClose && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                title="Close"
                className="w-8 h-8 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30 text-cyber-muted hover:text-cyber-text hover:border-cyber-gray/50 transition-all flex items-center justify-center"
              >
                {Icons.close}
              </button>
            )}
          </div>
        )}
        {/* тело */}
        <div className="max-h-[calc(100vh-96px)] overflow-y-auto px-4 py-4 sm:max-h-[calc(100vh-120px)] sm:px-6 sm:py-5">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

// диалог подтверждения
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'info'
}: ConfirmDialogProps) {
  const variantClass = {
    danger: 'btn-danger',
    warning: 'bg-cyber-orange/20 border-cyber-orange text-cyber-orange',
    info: 'btn'
  }[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-cyber-muted">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-outline">
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={variantClass}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
