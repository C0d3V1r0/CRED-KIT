import { useState, ReactNode } from 'react';

interface AccordionItem {
  title: string;
  content: ReactNode;
  icon?: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: number[];
}

// аккордеон
export function Accordion({ items, allowMultiple = false, defaultOpen = [] }: AccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>(defaultOpen);

  const toggle = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenIndexes(prev =>
        prev.includes(index) ? [] : [index]
      );
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-cyber-gray/40 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => toggle(index)}
            className="w-full px-4 py-3 flex items-center justify-between bg-cyber-dark/50 hover:bg-cyber-gray/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              {item.icon && <span className="text-cyber-cyan">{item.icon}</span>}
              <span className="text-sm text-cyber-text">{item.title}</span>
            </div>
            <span className={`text-cyber-muted transition-transform ${
              openIndexes.includes(index) ? 'rotate-180' : ''
            }`}>
              ▼
            </span>
          </button>
          {openIndexes.includes(index) && (
            <div className="px-4 py-3 bg-cyber-dark/30 border-t border-cyber-gray/40">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
