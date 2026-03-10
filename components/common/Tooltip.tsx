import { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

// тултип
export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const positionClass = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }[position];

  const arrowClass = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-cyber-gray/80',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-cyber-gray/80',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-cyber-gray/80',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-cyber-gray/80'
  }[position];

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && content && (
        <div className={`absolute z-50 ${positionClass}`}>
          <div className="px-3 py-1.5 bg-cyber-gray/90 backdrop-blur rounded text-xs text-cyber-text whitespace-nowrap shadow-lg">
            {content}
          </div>
          <div className={`absolute w-0 h-0 border-4 border-transparent ${arrowClass}`} />
        </div>
      )}
    </div>
  );
}

// тултип с иконкой
interface TooltipIconProps {
  content: string;
  icon?: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function TooltipIcon({ content, icon, position = 'top' }: TooltipIconProps) {
  return (
    <Tooltip content={content} position={position}>
      <span className="inline-flex items-center justify-center w-4 h-4 text-cyber-muted hover:text-cyber-cyan cursor-help">
        {icon || '?'}
      </span>
    </Tooltip>
  );
}
