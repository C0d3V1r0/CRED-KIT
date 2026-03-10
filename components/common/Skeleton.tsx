interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

// базовый скелетон
export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'wave'
}: SkeletonProps) {
  const variantClass = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }[variant];

  const animationClass = {
    pulse: 'animate-pulse',
    wave: 'skeleton',
    none: ''
  }[animation];

  return (
    <div
      className={`bg-cyber-gray/30 ${variantClass} ${animationClass} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
    />
  );
}

// группа для списков
export function SkeletonGroup({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}

// карточка
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card space-y-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={20} />
          <Skeleton width="80%" height={14} />
        </div>
      </div>
      <Skeleton width="100%" height={60} variant="rectangular" />
      <div className="flex gap-2">
        <Skeleton width={80} height={32} />
        <Skeleton width={80} height={32} />
      </div>
    </div>
  );
}

// таблица
export function SkeletonTable({ rows = 5, cols = 4, className = '' }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Шапка таблицы */}
      <div className="flex gap-2 p-2">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={`${100 / cols}%`} height={20} />
        ))}
      </div>
      {/* Строки таблицы */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-2 p-3 border-t border-cyber-gray/20">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} width={`${100 / cols}%`} height={16} />
          ))}
        </div>
      ))}
    </div>
  );
}

// профиль
export function SkeletonProfile() {
  return (
    <div className="card text-center space-y-4">
      <Skeleton variant="circular" width={80} height={80} className="mx-auto" />
      <div className="space-y-2">
        <Skeleton width="60%" height={24} className="mx-auto" />
        <Skeleton width="40%" height={16} className="mx-auto" />
      </div>
      <div className="flex justify-center gap-4 pt-2">
        <Skeleton width={60} height={16} />
        <Skeleton width={60} height={16} />
        <Skeleton width={60} height={16} />
      </div>
    </div>
  );
}

// инпут
export function SkeletonInput() {
  return (
    <div className="space-y-2">
      <Skeleton width={100} height={14} />
      <Skeleton width="100%" height={40} />
    </div>
  );
}

// статистика
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card text-center space-y-2">
          <Skeleton width="50%" height={32} className="mx-auto" />
          <Skeleton width="70%" height={12} className="mx-auto" />
        </div>
      ))}
    </div>
  );
}
