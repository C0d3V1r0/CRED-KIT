import { useEffect, useState, type ReactNode } from 'react';

export type TranslateFn = (ru: string, en: string) => string;

interface NumericFieldProps {
  id: string;
  label: string;
  value: number;
  min?: number;
  onChange: (value: number) => void;
}

export function NumericField({ id, label, value, min = 0, onChange }: NumericFieldProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <div className="group">
      <label htmlFor={id} className="block text-cyber-muted text-xs mb-2 group-focus-within:text-cyber-cyan transition-colors">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(event) => {
          const nextDraft = event.target.value;
          if (nextDraft === '' || /^-?\d+$/.test(nextDraft)) {
            setDraft(nextDraft);
            if (nextDraft !== '') {
              const parsed = parseInt(nextDraft, 10);
              if (!Number.isNaN(parsed)) {
                onChange(Math.max(min, parsed));
              }
            }
          }
        }}
        onBlur={() => {
          if (draft === '') {
            onChange(min);
            setDraft(String(min));
            return;
          }

          const parsed = parseInt(draft, 10);
          if (Number.isNaN(parsed)) {
            setDraft(String(value));
            return;
          }

          const normalized = Math.max(min, parsed);
          onChange(normalized);
          setDraft(String(normalized));
        }}
        className="input w-full font-mono focus:border-cyber-cyan"
      />
    </div>
  );
}

interface ResourceEditorProps {
  title: string;
  accentClass: string;
  current: number;
  max: number;
  currentLabel: string;
  maxLabel: string;
  barColorClass: string;
  onCurrentChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  footer?: ReactNode;
}

export function ResourceEditor({
  title,
  accentClass,
  current,
  max,
  currentLabel,
  maxLabel,
  barColorClass,
  onCurrentChange,
  onMaxChange,
  footer
}: ResourceEditorProps) {
  const progress = max > 0 ? Math.min(100, (current / max) * 100) : 0;

  return (
    <div className="rounded-xl border border-cyber-gray/30 bg-cyber-dark/60 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className={`font-semibold ${accentClass}`}>{title}</h3>
        <div className="text-cyber-text font-mono font-bold">{current} / {max}</div>
      </div>

      <div className="h-3 bg-cyber-dark rounded-full overflow-hidden border border-cyber-gray/30">
        <div className={`h-full transition-all duration-300 ${barColorClass}`} style={{ width: `${progress}%` }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumericField id={`${title}-current`} label={currentLabel} value={current} onChange={onCurrentChange} />
        <NumericField id={`${title}-max`} label={maxLabel} value={max} onChange={onMaxChange} />
      </div>

      {footer}
    </div>
  );
}

interface ActionButtonProps {
  tone: 'damage' | 'heal';
  label: string;
  value: string;
  tr: TranslateFn;
  onApply: (amount: number) => void;
}

export function ActionButton({ tone, label, value, tr, onApply }: ActionButtonProps) {
  const amount = parseInt(value, 10) || 0;
  const isActive = amount > 0;
  const palette = tone === 'damage'
    ? {
        border: isActive ? 'border-cyber-orange/35' : 'border-cyber-orange/20',
        bg: isActive ? 'from-cyber-orange/18 to-cyber-orange/8' : 'from-cyber-orange/10 to-cyber-orange/5',
        text: isActive ? 'text-cyber-orange' : 'text-cyber-orange/65',
        hover: isActive ? 'hover:-translate-y-0.5 hover:border-cyber-orange/55 hover:from-cyber-orange/24 hover:to-cyber-orange/12 hover:shadow-[0_14px_28px_rgba(255,106,58,0.14)]' : '',
        caption: 'text-cyber-orange/70',
        valueTone: 'border-cyber-orange/24 bg-cyber-orange/10 text-cyber-orange'
      }
    : {
        border: isActive ? 'border-cyber-green/35' : 'border-cyber-green/20',
        bg: isActive ? 'from-cyber-green/18 to-cyber-green/8' : 'from-cyber-green/10 to-cyber-green/5',
        text: isActive ? 'text-cyber-green' : 'text-cyber-green/65',
        hover: isActive ? 'hover:-translate-y-0.5 hover:border-cyber-green/55 hover:from-cyber-green/24 hover:to-cyber-green/12 hover:shadow-[0_14px_28px_rgba(0,255,170,0.12)]' : '',
        caption: 'text-cyber-green/70',
        valueTone: 'border-cyber-green/24 bg-cyber-green/10 text-cyber-green'
      };

  return (
    <button
      type="button"
      onClick={() => {
        if (amount > 0) {
          onApply(amount);
        }
      }}
      className={`w-full min-h-[54px] rounded-xl border px-3 py-2.5 text-left shadow-[0_10px_24px_rgba(0,0,0,0.24)] transition-all duration-200 bg-gradient-to-br ${palette.border} ${palette.bg} ${palette.text} ${palette.hover}`}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="min-w-0">
          <span className={`block text-[10px] uppercase tracking-[0.14em] ${palette.caption}`}>
            {tr('Ручной ввод', 'Manual input')}
          </span>
          <span className="mt-0.5 block text-sm font-semibold leading-snug sm:text-[13px]">
            {label}
          </span>
        </span>
        <span
          className={`shrink-0 rounded-lg border px-2 py-1 text-xs font-mono font-bold ${isActive ? palette.valueTone : 'border-cyber-gray/20 bg-cyber-dark/40 text-cyber-muted'}`}
        >
          {isActive ? amount : '0'}
        </span>
      </span>
    </button>
  );
}

interface DerivedStatCardProps {
  label?: string | number;
  value?: number;
  sublabel: string;
  color?: 'accent' | 'cyan' | 'green' | 'purple' | 'orange';
  icon?: ReactNode;
}

export function DerivedStatCard({ label, value, sublabel, color = 'accent', icon }: DerivedStatCardProps) {
  const colorClasses = {
    accent: 'bg-cyber-accent/8 border-cyber-accent/18 text-cyber-accent',
    cyan: 'bg-cyber-cyan/8 border-cyber-cyan/18 text-cyber-cyan',
    green: 'bg-cyber-green/8 border-cyber-green/18 text-cyber-green',
    purple: 'bg-cyber-purple/8 border-cyber-purple/18 text-cyber-purple',
    orange: 'bg-cyber-orange/8 border-cyber-orange/18 text-cyber-orange'
  };

  const iconColor = {
    accent: 'text-cyber-accent',
    cyan: 'text-cyber-cyan',
    green: 'text-cyber-green',
    purple: 'text-cyber-purple',
    orange: 'text-cyber-orange'
  }[color];

  return (
    <div className={`card-cyber p-4 text-center hover-lift transition-all duration-300 ${colorClasses[color]}`}>
      {icon && <div className={`mb-2 ${iconColor}`}>{icon}</div>}
      <div className="text-2xl font-bold font-mono">{value ?? label}</div>
      <div className="text-cyber-muted text-xs mt-1">{sublabel}</div>
    </div>
  );
}

export function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M12 3l7 3v6c0 4.5-2.9 7.7-7 9-4.1-1.3-7-4.5-7-9V6l7-3Z" />
    </svg>
  );
}

export function SpeedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M13 4v16M19 10l-4-6M19 14l-4 6M5 10h9M5 14h9" />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export function AbilityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-cyber-orange">
      <path d="M12 20V10M18 20V4M6 20v-4" />
      <path d="M12 4l-4 8M12 4l4 8" />
    </svg>
  );
}
