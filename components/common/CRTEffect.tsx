import type { ReactNode } from 'react';

/**
 * Компонент полосы статов
 * Показывает значение с визуальной подсветкой
 */
interface StatBarProps {
  value: number;
  max?: number;
  color?: 'cyan' | 'red' | 'green' | 'yellow' | 'purple';
  showValue?: boolean;
}

export function StatBar({ value, max = 100, color = 'cyan', showValue = true }: StatBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorMap: Record<string, string> = {
    cyan: '#00f0ff',
    red: '#ff2a2a',
    green: '#00ff88',
    yellow: '#ffcc00',
    purple: '#a855f7'
  };

  const barColor = colorMap[color] || colorMap.cyan;

  return (
    <div className="stat-bar">
      <div
        className="stat-bar-fill"
        style={{
          width: `${percentage}%`,
          backgroundColor: barColor,
          color: barColor,
          boxShadow: `0 0 10px ${barColor}60`
        }}
      />
      {showValue && (
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-mono text-cyber-muted">
          {value}/{max}
        </span>
      )}
    </div>
  );
}

/**
 * Декоратор угловых скобок
 * Обрамляет контент фирменными уголками
 */
interface CornerBracketsProps {
  children: ReactNode;
  color?: 'cyan' | 'red' | 'green' | 'yellow' | 'purple';
  className?: string;
}

export function CornerBrackets({ children, color = 'cyan', className = '' }: CornerBracketsProps) {
  const colorMap: Record<string, string> = {
    cyan: '#00f0ff',
    red: '#ff2a2a',
    green: '#00ff88',
    yellow: '#ffcc00',
    purple: '#a855f7'
  };

  const borderColor = colorMap[color] || colorMap.cyan;

  return (
    <div className={`relative ${className}`} style={{ color: borderColor }}>
      <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t border-l border-current opacity-50" />
      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t border-r border-current opacity-50" />
      <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b border-l border-current opacity-50" />
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b border-r border-current opacity-50" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default StatBar;
