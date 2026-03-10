import { ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  className?: string;
}

// хлебные крошки
export function Breadcrumbs({
  items,
  separator = '›',
  className = ''
}: BreadcrumbsProps) {
  return (
    <nav className={`breadcrumbs ${className}`} aria-label="Navigation">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index} className="flex items-center">
            {index > 0 && (
              <span className="breadcrumb-separator mx-2">{separator}</span>
            )}

            {isLast ? (
              <span className="breadcrumb-item current" aria-current="page">
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </span>
            ) : (
              <a
                href={item.href || '#'}
                className="breadcrumb-item"
                onClick={(e) => {
                  e.preventDefault();
                  item.onClick?.();
                }}
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}

// компактные крошки для мобильных
export function BreadcrumbsCompact({
  items,
  className = ''
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  if (items.length <= 1) return null;

  const firstItem = items[0];
  const lastItem = items[items.length - 1];

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <button
        onClick={firstItem.onClick}
        className="text-cyber-muted hover:text-cyber-cyan transition-colors flex items-center gap-1"
      >
        {firstItem.icon}
        {firstItem.label}
      </button>
      <span className="text-cyber-gray">/</span>
      <span className="text-cyber-text font-medium truncate">{lastItem.label}</span>
    </div>
  );
}
