interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValue?: boolean;
  color?: 'accent' | 'cyan' | 'green' | 'orange' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

// линейный прогресс-бар
export function ProgressBar({
  value,
  max,
  label,
  showValue = false,
  color = 'accent',
  size = 'md',
  animated = true
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClass = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }[size];

  const colorClass = {
    accent: 'bg-cyber-accent',
    cyan: 'bg-cyber-cyan',
    green: 'bg-cyber-green',
    orange: 'bg-cyber-orange',
    purple: 'bg-cyber-purple'
  }[color];

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-cyber-muted">{label}</span>}
          {showValue && (
            <span className="text-xs text-cyber-text">{value}/{max}</span>
          )}
        </div>
      )}
      <div className={`w-full bg-cyber-gray/40 rounded-full overflow-hidden ${sizeClass}`}>
        <div
          className={`${colorClass} h-full transition-all duration-500 ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// круговой прогресс
interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: 'accent' | 'cyan' | 'green' | 'orange';
  showLabel?: boolean;
}

export function CircularProgress({
  value,
  max,
  size = 80,
  strokeWidth = 8,
  color = 'accent',
  showLabel = true
}: CircularProgressProps) {
  const percentage = (value / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClass = {
    accent: '#ff2a2a',
    cyan: '#7ecdd3',
    green: '#00ff88',
    orange: '#ff6b35'
  }[color];

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-cyber-gray/40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorClass}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-cyber-text">{value}</span>
        </div>
      )}
    </div>
  );
}
