import { getDerangementLevel } from '../../logic/character/statsCalculator';
import { getDerangementLabel } from '../../utils/dice';
import { useLanguage } from '../../features/settings/model/hooks';

const DERANGEMENT_THRESHOLDS = [
  { value: 80, label: { ru: 'Норма', en: 'Normal' }, color: 'cyber-green', severity: 0 },
  { value: 60, label: { ru: 'Лёгкая паранойя', en: 'Mild paranoia' }, color: 'cyber-yellow', severity: 1 },
  { value: 40, label: { ru: 'Паранойя', en: 'Paranoia' }, color: 'cyber-orange', severity: 2 },
  { value: 20, label: { ru: 'Сильная паранойя', en: 'Severe paranoia' }, color: 'cyber-accent', severity: 3 },
  { value: 0, label: { ru: 'Киберпсихоз', en: 'Cyberpsychosis' }, color: 'cyber-red', severity: 4 }
];

interface HumanityMeterProps {
  currentHL?: number;
  maxHumanity?: number;
  showDetails?: boolean;
  // - добавляем humanity напрямую из derivedStats
  humanity?: number;
}

interface NextThresholdResult {
  threshold: typeof DERANGEMENT_THRESHOLDS[number];
  toNext: number;
}

interface ColorScheme {
  text: string;
  fill: string;
  bg: string;
  border: string;
}

export function HumanityMeter({ currentHL = 0, maxHumanity = 100, showDetails = true, humanity }: HumanityMeterProps) {
  const { language } = useLanguage();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);
  // - humanity приходит напрямую из derivedStats (уже правильно посчитана)
  const actualHumanity = humanity !== undefined ? humanity : Math.max(maxHumanity - currentHL, 0);
  const thresholds = getMeterThresholds(maxHumanity);
  const currentLevel = getDerangementLevel(actualHumanity, maxHumanity);
  const nextThreshold = findNextThreshold(actualHumanity, thresholds);
  const colorScheme = getColorScheme(currentLevel.severity);
  const humanityPercent = maxHumanity > 0 ? (actualHumanity / maxHumanity) * 100 : 0;

  return (
    <div className="p-4 rounded-xl bg-cyber-dark/40 border border-cyber-gray/30">
      <div className="flex justify-between items-center mb-3">
        <span className="text-cyber-muted text-sm font-medium">{tr('ЧЕЛОВЕЧНОСТЬ', 'HUMANITY')}</span>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold font-mono ${colorScheme.text}`}>
            {actualHumanity}
          </span>
          <span className="text-cyber-muted text-sm">/ {maxHumanity}</span>
        </div>
      </div>

      <div className="relative">
        <div className="h-3 rounded-full bg-cyber-dark overflow-hidden flex">
          {thresholds.map((threshold, i) => (
            <div
              key={i}
              className="h-full border-r border-cyber-gray/40 relative"
              style={{ width: `${getThresholdSegmentWidth(thresholds, i, maxHumanity)}%` }}
            />
          ))}
        </div>

        <div
          className={`h-full rounded-full absolute top-0 left-0 transition-all duration-500 ${colorScheme.fill}`}
          style={{ width: `${humanityPercent}%` }}
        />
      </div>

      <div className="flex justify-between mt-1 text-2xs text-cyber-muted">
        {thresholds.map((threshold, i) => (
          <span
            key={i}
            className={isThresholdActive(actualHumanity, thresholds, i) ? 'text-cyber-text font-bold' : ''}
          >
            {threshold.value}
          </span>
        ))}
      </div>

      <div className={`mt-3 p-3 rounded-lg border ${colorScheme.bg} ${colorScheme.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-cyber-muted text-xs block mb-1">{tr('ТЕКУЩЕЕ СОСТОЯНИЕ', 'CURRENT STATE')}</span>
            <span className={`font-medium ${colorScheme.text}`}>
              {getDerangementLabel(actualHumanity, language, maxHumanity)}
            </span>
          </div>
          {nextThreshold && (
            <div className="text-right">
              <span className="text-cyber-muted text-xs block mb-1">{tr('ДО СЛЕДУЮЩЕГО', 'TO NEXT')}</span>
              <span className="text-cyber-cyan font-mono">
                {nextThreshold.toNext} HL
              </span>
            </div>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 space-y-2">
          <span className="text-cyber-muted text-xs">{tr('ПОРОГИ DERANGEMENT', 'DERANGEMENT THRESHOLDS')}</span>
          <div className="grid grid-cols-5 gap-1">
            {thresholds.map((threshold, i) => {
              const isActive = isThresholdActive(actualHumanity, thresholds, i);
              return (
                <div
                  key={i}
                  className={`p-2 rounded text-center text-xs ${
                    isActive
                      ? `${colorScheme.bg} ${colorScheme.text} border ${colorScheme.border}`
                      : 'bg-cyber-dark text-cyber-muted'
                  }`}
                >
                  <div className="font-mono font-bold mb-1">{threshold.value}</div>
                  <div className="text-2xs">{tr(threshold.label.ru, threshold.label.en).split(' ')[0]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function findNextThreshold(
  humanity: number,
  thresholds: typeof DERANGEMENT_THRESHOLDS
): NextThresholdResult | null {
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (humanity > thresholds[i].value) {
      return {
        threshold: thresholds[i + 1],
        toNext: humanity - thresholds[i + 1].value
      };
    }
  }
  return null;
}

function getMeterThresholds(maxHumanity: number) {
  const safeMax = Math.max(0, maxHumanity);

  return DERANGEMENT_THRESHOLDS.map((threshold, index) => {
    if (index === DERANGEMENT_THRESHOLDS.length - 1) {
      return { ...threshold, value: 0 };
    }

    return {
      ...threshold,
      value: Math.round(safeMax * (threshold.value / 100))
    };
  });
}

function getThresholdSegmentWidth(
  thresholds: typeof DERANGEMENT_THRESHOLDS,
  index: number,
  maxHumanity: number
): number {
  if (maxHumanity <= 0) {
    return 0;
  }

  const upperBound = index === 0 ? maxHumanity : thresholds[index - 1].value;
  const lowerBound = thresholds[index].value;

  return ((upperBound - lowerBound) / maxHumanity) * 100;
}

function isThresholdActive(
  humanity: number,
  thresholds: typeof DERANGEMENT_THRESHOLDS,
  index: number
): boolean {
  const upperBound = index === 0 ? Number.POSITIVE_INFINITY : thresholds[index - 1].value;
  const lowerBound = thresholds[index].value;

  return humanity >= lowerBound && humanity < upperBound;
}

function getColorScheme(severity: number): ColorScheme {
  const schemes: ColorScheme[] = [
    { text: 'text-cyber-green', fill: 'bg-gradient-to-r from-cyber-green to-cyber-cyan', bg: 'bg-cyber-green/8', border: 'border-cyber-green/25' },
    { text: 'text-cyber-yellow', fill: 'bg-gradient-to-r from-cyber-yellow to-cyber-green', bg: 'bg-cyber-yellow/8', border: 'border-cyber-yellow/25' },
    { text: 'text-cyber-orange', fill: 'bg-gradient-to-r from-cyber-orange to-cyber-yellow', bg: 'bg-cyber-orange/8', border: 'border-cyber-orange/25' },
    { text: 'text-cyber-accent', fill: 'bg-gradient-to-r from-cyber-accent to-cyber-orange', bg: 'bg-cyber-accent/8', border: 'border-cyber-accent/25' },
    { text: 'text-cyber-red', fill: 'bg-cyber-accent', bg: 'bg-cyber-accent/15', border: 'border-cyber-accent/40' }
  ];
  return schemes[Math.min(severity, schemes.length - 1)];
}

interface HumanityMeterCompactProps {
  totalHL?: number;
  maxHumanity?: number;
}

export function HumanityMeterCompact({ totalHL = 0, maxHumanity = 100 }: HumanityMeterCompactProps) {
  const humanity = Math.max(maxHumanity - totalHL, 0);
  const currentLevel = getDerangementLevel(humanity, maxHumanity);
  const colorScheme = getColorScheme(currentLevel.severity);
  const humanityPercent = maxHumanity > 0 ? (humanity / maxHumanity) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-cyber-muted text-2xs">HUMANITY</span>
        <span className={`font-mono font-bold text-sm ${colorScheme.text}`}>
          {humanity}
        </span>
        <span className="text-cyber-muted text-2xs">({totalHL} HL)</span>
      </div>
      <div className="h-1.5 rounded-full bg-cyber-dark overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorScheme.fill}`}
          style={{ width: `${humanityPercent}%` }}
        />
      </div>
    </div>
  );
}

export default HumanityMeter;
