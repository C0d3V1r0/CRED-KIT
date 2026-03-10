interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'accent' | 'cyan' | 'green' | 'white';
}

// спиннер
export function Spinner({ size = 'md', color = 'accent' }: SpinnerProps) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }[size];

  const colorClass = {
    accent: 'border-cyber-accent',
    cyan: 'border-cyber-cyan',
    green: 'border-cyber-green',
    white: 'border-white'
  }[color];

  return (
    <div className={`${sizeClass} border-2 border-transparent ${colorClass} border-t-transparent rounded-full animate-spin`} />
  );
}

// спиннер с текстом
interface SpinnerWithTextProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SpinnerWithText({ text = 'Загрузка...', size = 'md' }: SpinnerWithTextProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <Spinner size={size} />
      <span className="text-cyber-muted text-sm animate-pulse">{text}</span>
    </div>
  );
}

// пульсирующий индикатор
export function PulseIndicator({ color = 'accent' }: { color?: 'accent' | 'cyan' | 'green' | 'orange' }) {
  const colorClass = {
    accent: 'bg-cyber-accent',
    cyan: 'bg-cyber-cyan',
    green: 'bg-cyber-green',
    orange: 'bg-cyber-orange'
  }[color];

  return (
    <div className="relative">
      <div className={`w-2 h-2 ${colorClass} rounded-full`} />
      <div className={`absolute inset-0 ${colorClass} rounded-full animate-ping opacity-75`} />
    </div>
  );
}
