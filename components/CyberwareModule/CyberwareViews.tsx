import { Icons } from '../../utils/icons';
import { formatCyberwareEffects, formatSlot } from '../../utils/dice';
import { useLanguage } from '../../features/settings/model/hooks';
import type { CompatibilityResult, Cyberware, CyberwareSlot } from '@/types';
import standardImplants from '../../data/implants/standard.json';

export const ZONE_SLOT_MAP: Record<string, CyberwareSlot[]> = {
  head: ['head_eye', 'head_ear', 'head_brain', 'head_other'],
  torso: ['torso_organs', 'torso_skeleton', 'torso_skin'],
  arm_l: ['arm_l_hand', 'arm_l_forearm'],
  arm_r: ['arm_r_hand', 'arm_r_forearm'],
  leg_l: ['leg_l_stamp', 'leg_l_calf'],
  leg_r: ['leg_r_stamp', 'leg_r_calf']
};

export function buildBodyZoneCounts(implants: Cyberware[]) {
  const counts = {
    all: implants.length,
    head: 0,
    torso: 0,
    arm_l: 0,
    arm_r: 0,
    leg_l: 0,
    leg_r: 0
  };

  implants.forEach((implant) => {
    if (implant.slot.startsWith('head_')) counts.head += 1;
    else if (implant.slot.startsWith('torso_')) counts.torso += 1;
    else if (implant.slot.startsWith('arm_l_')) counts.arm_l += 1;
    else if (implant.slot.startsWith('arm_r_')) counts.arm_r += 1;
    else if (implant.slot.startsWith('leg_l_')) counts.leg_l += 1;
    else if (implant.slot.startsWith('leg_r_')) counts.leg_r += 1;
  });

  return counts;
}

export function getLocalizedImplantName(
  implant: Pick<Cyberware, 'name' | 'name_en'>,
  locale: 'ru' | 'en'
): string {
  return locale === 'en' && implant.name_en ? implant.name_en : implant.name;
}

export function getLocalizedImplantDescription(
  implant: Pick<Cyberware, 'description' | 'description_en'>,
  locale: 'ru' | 'en'
): string {
  return locale === 'en' && implant.description_en ? implant.description_en : implant.description;
}

const IMPLANT_NAME_BY_ID = new Map(
  (standardImplants as Array<Pick<Cyberware, 'id' | 'name' | 'name_en'>>).map((implant) => [implant.id, implant])
);

interface ImplantCardProps {
  implant: Cyberware;
  onClick: () => void;
  isInstalled: boolean;
  isSelected?: boolean;
}

export function ImplantCard({ implant, onClick, isInstalled, isSelected }: ImplantCardProps) {
  const { language } = useLanguage();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);

  return (
    <div
      data-testid={`implant-card-${implant.id}`}
      onClick={onClick}
      className={`group relative p-4 rounded-xl bg-cyber-dark/60 border cursor-pointer transition-all duration-300 hover-lift ${
        isInstalled
          ? 'opacity-50 border-cyber-gray/20'
          : isSelected
            ? 'border-cyber-accent/50 bg-cyber-accent/5'
            : 'border-cyber-gray/30 hover:border-cyber-accent/30'
      }`}
    >
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyber-accent/5 to-transparent" />
      </div>

      <div className="relative flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-medium text-sm transition-colors ${isSelected ? 'text-cyber-accent' : 'text-cyber-text'}`}>
              {getLocalizedImplantName(implant, language)}
            </span>
            {isInstalled && (
              <span className="ui-badge">
                {tr('Установлен', 'Installed')}
              </span>
            )}
            {implant.isCustom && (
              <span className="ui-badge ui-badge--cyan">
                CUSTOM
              </span>
            )}
          </div>
          <div className="text-cyber-muted text-xs mt-1 line-clamp-1">{getLocalizedImplantDescription(implant, language)}</div>
          <div className="flex items-center gap-3 mt-1.5 text-xs">
            <span className="text-cyber-accent">{implant.cost}eb</span>
            <span className="text-cyber-muted">|</span>
            <span className="text-cyber-cyan">HL: {implant.hl}</span>
            <span className="text-cyber-muted">|</span>
            <span className="text-cyber-muted">{formatSlot(implant.slot, language)}</span>
          </div>
        </div>
        <button
          data-testid={`implant-open-${implant.id}`}
          className={`icon-action ml-3 h-8 w-8 text-sm font-medium ${
            isInstalled
              ? 'cursor-not-allowed border-cyber-gray/18 bg-cyber-gray/16 text-cyber-muted'
              : 'icon-action--accent'
          }`}
          disabled={isInstalled}
          onClick={(event) => {
            event.stopPropagation();
            onClick();
          }}
        >
          {isInstalled ? '✓' : '+'}
        </button>
      </div>
    </div>
  );
}

interface ImplantDetailsProps {
  implant: Cyberware;
  compatibility: CompatibilityResult | null;
  onInstall: () => void;
  onRemove?: () => void;
  onClose: () => void;
  isInstalled: boolean;
}

export function ImplantDetails({
  implant,
  compatibility,
  onInstall,
  onRemove,
  onClose,
  isInstalled
}: ImplantDetailsProps) {
  const { language } = useLanguage();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);
  const canInstall = compatibility?.compatible && !isInstalled;

  return (
    <div className="card-cyber border-cyber-accent/50 animate-fade-in shadow-2xl max-h-[85vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-10 rounded-full ${implant.isCustom ? 'bg-cyber-cyan' : 'bg-cyber-accent'}`} />
          <div>
            <h3 className="text-lg font-bold text-cyber-text">{getLocalizedImplantName(implant, language)}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-cyber-muted text-xs capitalize">{implant.type}</span>
              <span className="text-cyber-muted text-xs">•</span>
              <span className="text-cyber-muted text-xs">{formatSlot(implant.slot, language)}</span>
              {implant.isCustom && (
                <>
                  <span className="text-cyber-muted text-xs">•</span>
                  <span className="text-cyber-cyan text-xs">CUSTOM</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label={tr('Закрыть карточку импланта', 'Close implant details')}
          title={tr('Закрыть', 'Close')}
          className="icon-action"
        >
          {Icons.close}
        </button>
      </div>

      <p className="text-cyber-muted text-sm mb-4">{getLocalizedImplantDescription(implant, language)}</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2.5 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
          <span className="text-cyber-muted text-xs block">{tr('Стоимость', 'Cost')}</span>
          <span className="text-cyber-accent font-bold">{implant.cost}eb</span>
        </div>
        <div className="p-2.5 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
          <span className="text-cyber-muted text-xs block">Humanity Loss</span>
          <span className="text-cyber-cyan font-bold">-{implant.hl} HL</span>
        </div>
      </div>

      {implant.effects && Object.keys(implant.effects).length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-cyber-green/5 border border-cyber-green/20">
          <span className="text-cyber-green text-xs font-medium">{tr('Эффекты', 'Effects')}</span>
          <p className="text-cyber-green text-sm mt-1">{formatCyberwareEffects(implant.effects)}</p>
        </div>
      )}

      {implant.incompatible && implant.incompatible.length > 0 && (
        <div className="mb-4 p-2.5 rounded-lg bg-cyber-orange/10 border border-cyber-orange/30">
          <span className="text-cyber-orange text-xs font-medium">{tr('Несовместим с', 'Incompatible with')}</span>
          <p className="text-cyber-orange text-sm mt-1">
            {implant.incompatible
              .map((id) => {
                const found = IMPLANT_NAME_BY_ID.get(id);
                return found ? getLocalizedImplantName(found, language) : id;
              })
              .join(', ')}
          </p>
        </div>
      )}

      {compatibility && !compatibility.compatible && (
        <div className="mb-4 p-3 rounded-lg bg-cyber-orange/10 border border-cyber-orange/30">
          <div className="flex items-center gap-2 mb-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-cyber-orange">
              <path d="M12 9v4M12 17h.01" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span className="text-cyber-orange text-sm font-medium">{tr('Конфликт', 'Conflict')}</span>
          </div>
          <ul className="text-cyber-muted text-xs list-disc list-inside space-y-1">
            {compatibility.conflicts.map((conflict, index) => (
              <li key={index}>{conflict}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        data-testid="implant-install"
        onClick={onInstall}
        disabled={!canInstall}
        className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
          isInstalled
            ? 'bg-cyber-gray/20 text-cyber-muted border border-cyber-gray/30 cursor-not-allowed'
            : canInstall
              ? 'bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/40 hover:bg-cyber-accent/30'
              : 'bg-cyber-orange/10 text-cyber-orange border border-cyber-orange/30'
        }`}
      >
        {isInstalled ? `✓ ${tr('Установлен', 'Installed')}` : canInstall ? tr('Установить имплант', 'Install implant') : tr('Невозможно установить', 'Cannot install')}
      </button>

      {isInstalled && onRemove && (
        <button
          data-testid="implant-remove"
          onClick={onRemove}
          className="w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-300 bg-cyber-orange/10 text-cyber-orange border border-cyber-orange/30 hover:bg-cyber-orange/20"
        >
          {tr('Удалить имплант', 'Remove implant')}
        </button>
      )}
    </div>
  );
}
