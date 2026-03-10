import { ReactNode } from 'react';
import { Icons } from '../../utils/icons';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'search' | 'error' | 'success';
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className = ''
}: EmptyStateProps) {
  const variantContent = {
    default: {
      icon: icon || Icons.gear,
      desc: description || 'Тут пока ничего нет',
      iconClass: 'text-5xl'
    },
    search: {
      icon: icon || Icons.gear,
      desc: description || 'Ничего не найдено. Попробуйте изменить запрос.',
      iconClass: 'text-5xl'
    },
    error: {
      icon: icon || Icons.warning,
      desc: description || 'Произошла ошибка при загрузке данных.',
      iconClass: 'text-5xl'
    },
    success: {
      icon: icon || Icons.check,
      desc: description || 'Всё готово!',
      iconClass: 'text-5xl'
    }
  }[variant];

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className={`${variantContent.iconClass} mb-4 opacity-60 animate-float`}>
        {variantContent.icon}
      </div>
      <h3 className="text-lg font-semibold text-cyber-text mb-2">{title}</h3>
      <p className="text-cyber-muted text-sm mb-6 max-w-sm leading-relaxed">
        {variantContent.desc}
      </p>
      {action && (
        <div className="animate-slide-up">
          {action}
        </div>
      )}
    </div>
  );
}

export function WarningState({
  title,
  description,
  action,
  variant = 'warning'
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'warning' | 'danger' | 'info';
}) {
  const colors = {
    warning: 'text-cyber-yellow',
    danger: 'text-cyber-accent',
    info: 'text-cyber-cyan'
  };

  const icons = {
    warning: Icons.warning,
    danger: Icons.warning,
    info: Icons.warning
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="text-5xl mb-3 animate-pulse">{icons[variant]}</div>
      <h3 className={`text-lg font-medium ${colors[variant]} mb-2`}>{title}</h3>
      {description && (
        <p className="text-cyber-muted text-sm mb-4 max-w-md">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export function LoadingState({
  title = 'Загрузка...',
  description
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative mb-4">
        <div className="w-16 h-16 border-4 border-cyber-gray/30 border-t-cyber-cyan rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-cyber-dark rounded-full" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-cyber-text mb-1">{title}</h3>
      {description && (
        <p className="text-cyber-muted text-sm">{description}</p>
      )}
    </div>
  );
}
