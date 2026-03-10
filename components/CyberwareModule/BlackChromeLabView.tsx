import { Icons } from '../../utils/icons';
import { formatSlot } from '../../utils/dice';
import { getLocalizedImplantDescription, getLocalizedImplantName } from './CyberwareViews';
import type { Cyberware, CyberwareModification, CyberwareSlot } from '@/types';

type TranslateFn = (ru: string, en: string) => string;

export function BuilderModeSection({
  constructorMode,
  tr,
  onModeChange
}: {
  constructorMode: 'base' | 'scratch';
  tr: TranslateFn;
  onModeChange: (mode: 'base' | 'scratch') => void;
}) {
  return (
    <section className="card-cyber p-4">
      <h3 className="ui-card-title mb-3">{tr('Режим конструктора', 'Builder mode')}</h3>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="cyber-lab-mode-base"
          onClick={() => onModeChange('base')}
          className={`px-3 py-2 rounded-lg border text-sm transition-all ${
            constructorMode === 'base'
              ? 'bg-cyber-accent/20 border-cyber-accent/40 text-cyber-accent'
              : 'bg-cyber-dark/60 border-cyber-gray/40 text-cyber-muted hover:text-cyber-text'
          }`}
        >
          {tr('На базе импланта', 'From base implant')}
        </button>
        <button
          type="button"
          data-testid="cyber-lab-mode-scratch"
          onClick={() => onModeChange('scratch')}
          className={`px-3 py-2 rounded-lg border text-sm transition-all ${
            constructorMode === 'scratch'
              ? 'bg-cyber-cyan/20 border-cyber-cyan/40 text-cyber-cyan'
              : 'bg-cyber-dark/60 border-cyber-gray/40 text-cyber-muted hover:text-cyber-text'
          }`}
        >
          {tr('С нуля', 'From scratch')}
        </button>
      </div>
    </section>
  );
}

interface BaseImplantLite {
  id: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  cost: number;
  hl: number | string;
  slot: CyberwareSlot;
}

export function BaseParametersSection({
  constructorMode,
  tr,
  standardImplants,
  selectedBaseId,
  customSlot,
  customCost,
  customHL,
  baseImplant,
  slotOptions,
  language,
  onSelectedBaseIdChange,
  onCustomSlotChange,
  onCustomCostChange,
  onCustomHLChange
}: {
  constructorMode: 'base' | 'scratch';
  tr: TranslateFn;
  standardImplants: BaseImplantLite[];
  selectedBaseId: string;
  customSlot: CyberwareSlot;
  customCost: number;
  customHL: number;
  baseImplant: BaseImplantLite | null;
  slotOptions: CyberwareSlot[];
  language: 'ru' | 'en';
  onSelectedBaseIdChange: (value: string) => void;
  onCustomSlotChange: (value: CyberwareSlot) => void;
  onCustomCostChange: (value: number) => void;
  onCustomHLChange: (value: number) => void;
}) {
  return (
    <section className="card-cyber p-5">
      <h3 className="ui-card-title text-cyber-accent mb-3">{tr('Базовые параметры', 'Base parameters')}</h3>

      {constructorMode === 'base' ? (
        <>
          <label className="block ui-meta mb-2">{tr('Исходный имплант', 'Template implant')}</label>
          <select
            data-testid="cyber-lab-template-select"
            value={selectedBaseId}
            onChange={(event) => onSelectedBaseIdChange(event.target.value)}
            className="select w-full"
          >
            <option value="">{tr('Выберите имплант...', 'Select implant...')}</option>
            {standardImplants.map((implant) => (
              <option key={implant.id} value={implant.id}>
                {getLocalizedImplantName(implant, language)} ({implant.cost}eb)
              </option>
            ))}
          </select>
        </>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block ui-meta mb-2">{tr('Слот импланта', 'Implant slot')}</label>
            <select
              data-testid="cyber-lab-slot"
              value={customSlot}
              onChange={(event) => onCustomSlotChange(event.target.value as CyberwareSlot)}
              className="select w-full"
            >
              {slotOptions.map((slot) => (
                <option key={slot} value={slot}>{formatSlot(slot, language)}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <LabeledNumberInput label={tr('Базовая цена (eb)', 'Base cost (eb)')} testId="cyber-lab-base-cost" value={customCost} onChange={onCustomCostChange} />
            <LabeledNumberInput label={tr('Базовый HL', 'Base HL')} testId="cyber-lab-base-hl" value={customHL} onChange={onCustomHLChange} />
          </div>
        </div>
      )}

      {constructorMode === 'base' && baseImplant && (
        <div className="mt-3 p-3 bg-cyber-dark/80 rounded-lg border border-cyber-accent/30">
          <div className="ui-card-title">{getLocalizedImplantName(baseImplant, language)}</div>
          <div className="ui-body-sm mt-1">{getLocalizedImplantDescription(baseImplant, language)}</div>
          <div className="flex gap-3 mt-2 ui-meta">
            <span className="text-cyber-accent">{baseImplant.cost}eb</span>
            <span className="text-cyber-cyan">HL: {baseImplant.hl}</span>
            <span className="text-cyber-muted">{formatSlot(baseImplant.slot, language)}</span>
          </div>
        </div>
      )}
    </section>
  );
}

function LabeledNumberInput({
  label,
  testId,
  value,
  onChange
}: {
  label: string;
  testId: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="block ui-meta mb-2">{label}</label>
      <input
        data-testid={testId}
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
        className="input w-full"
      />
    </div>
  );
}

export function ModificationsSection({
  tr,
  canEditDetails,
  modPresets,
  modifications,
  modEffectDraft,
  modCostDraft,
  modHLDraft,
  customEffects,
  effectKeyDraft,
  effectValueDraft,
  onAddPreset,
  onModEffectDraftChange,
  onModCostDraftChange,
  onModHLDraftChange,
  onAddCustomModification,
  onRemoveModification,
  onEffectKeyDraftChange,
  onEffectValueDraftChange,
  onAddCustomEffect,
  onRemoveCustomEffect
}: {
  tr: TranslateFn;
  canEditDetails: boolean;
  modPresets: Array<{ label: { ru: string; en: string }; cost: number }>;
  modifications: CyberwareModification[];
  modEffectDraft: string;
  modCostDraft: number;
  modHLDraft: number;
  customEffects: Array<{ id: string; key: string; value: string }>;
  effectKeyDraft: string;
  effectValueDraft: string;
  onAddPreset: (presetIndex: number) => void;
  onModEffectDraftChange: (value: string) => void;
  onModCostDraftChange: (value: number) => void;
  onModHLDraftChange: (value: number) => void;
  onAddCustomModification: () => void;
  onRemoveModification: (id: string) => void;
  onEffectKeyDraftChange: (value: string) => void;
  onEffectValueDraftChange: (value: string) => void;
  onAddCustomEffect: () => void;
  onRemoveCustomEffect: (id: string) => void;
}) {
  return (
    <section className={`card-cyber p-5 transition-all ${canEditDetails ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
      <h3 className="ui-card-title text-cyber-accent mb-3">{tr('Модификации и эффекты', 'Mods and effects')}</h3>

      <div className="mb-4">
        <div className="ui-kicker mb-2">{tr('Быстрые пресеты модификаций:', 'Quick mod presets:')}</div>
        <div className="flex flex-wrap gap-2">
          {modPresets.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onAddPreset(index)}
              className="ui-meta rounded-lg border border-cyber-gray/40 bg-cyber-dark/60 px-3 py-1.5 hover:bg-cyber-accent/20 hover:border-cyber-accent/50 transition-all"
            >
              {tr(preset.label.ru, preset.label.en)} (+{preset.cost}eb)
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-cyber-dark/60 rounded-lg mb-4">
        <div className="ui-kicker mb-2">{tr('Своя модификация:', 'Custom modification:')}</div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <input type="text" value={modEffectDraft} onChange={(event) => onModEffectDraftChange(event.target.value)} placeholder={tr('Эффект...', 'Effect...')} className="input text-sm" />
          <input type="number" min={0} value={modCostDraft} onChange={(event) => onModCostDraftChange(Math.max(0, Number(event.target.value) || 0))} placeholder={tr('Цена...', 'Cost...')} className="input text-sm" />
          <input type="number" min={0} value={modHLDraft} onChange={(event) => onModHLDraftChange(Math.max(0, Number(event.target.value) || 0))} placeholder="HL..." className="input text-sm" />
        </div>
        <button
          type="button"
          onClick={onAddCustomModification}
          disabled={!modEffectDraft.trim()}
          className="w-full py-2 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-sm hover:bg-cyber-cyan/20 transition-all disabled:opacity-50"
        >
          {tr('Добавить модификацию', 'Add modification')}
        </button>
      </div>

      {modifications.length > 0 && (
        <div className="space-y-2 mb-4">
          {modifications.map((modification) => (
            <div key={modification.id} className="flex items-center justify-between bg-cyber-dark p-2.5 rounded border border-cyber-gray/30">
              <div>
                <div className="ui-card-title">{modification.name}</div>
                <div className="ui-meta">+{modification.cost}eb / +{modification.hl}HL</div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveModification(modification.id)}
                className="icon-action icon-action--orange h-6 w-6"
              >
                {Icons.close}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 bg-cyber-dark/60 rounded-lg">
        <div className="ui-kicker mb-2">{tr('Эффекты импланта (реальные параметры):', 'Implant effects (real stats):')}</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input data-testid="cyber-lab-effect-key" type="text" value={effectKeyDraft} onChange={(event) => onEffectKeyDraftChange(event.target.value.toUpperCase())} placeholder="REF / BODY / interface" className="input text-sm" />
          <input data-testid="cyber-lab-effect-value" type="text" value={effectValueDraft} onChange={(event) => onEffectValueDraftChange(event.target.value)} placeholder="+1 / +2" className="input text-sm" />
        </div>
        <button
          type="button"
          data-testid="cyber-lab-effect-add"
          onClick={onAddCustomEffect}
          disabled={!effectKeyDraft.trim() || !effectValueDraft.trim()}
          className="w-full py-2 rounded-lg bg-cyber-green/10 border border-cyber-green/30 text-cyber-green text-sm hover:bg-cyber-green/20 transition-all disabled:opacity-50"
        >
          {tr('Добавить эффект', 'Add effect')}
        </button>
      </div>

      {customEffects.length > 0 && (
        <div className="space-y-2 mt-3">
          {customEffects.map((effect) => (
            <div key={effect.id} className="flex items-center justify-between bg-cyber-dark p-2.5 rounded border border-cyber-gray/30">
              <div className="ui-card-title">
                <span className="text-cyber-cyan">{effect.key}</span>: {effect.value}
              </div>
              <button
                type="button"
                onClick={() => onRemoveCustomEffect(effect.id)}
                className="icon-action icon-action--orange h-6 w-6"
              >
                {Icons.close}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function SummarySection({
  tr,
  constructorMode,
  customSlot,
  baseImplantSlot,
  language,
  baseCost,
  modifications,
  totalCost,
  totalHL,
  effectsText,
  canSave,
  onReset,
  onSave
}: {
  tr: TranslateFn;
  constructorMode: 'base' | 'scratch';
  customSlot: CyberwareSlot;
  baseImplantSlot: CyberwareSlot | null;
  language: 'ru' | 'en';
  baseCost: number;
  modifications: CyberwareModification[];
  totalCost: number;
  totalHL: number;
  effectsText: string;
  canSave: boolean;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <section className="card-cyber p-5 border-cyber-accent/30">
      <h3 className="ui-card-title text-cyber-accent mb-3">{tr('Итог', 'Summary')}</h3>

      <div className="space-y-2 ui-body-sm">
        <div className="flex justify-between">
          <span className="text-cyber-muted">{tr('Слот', 'Slot')}:</span>
          <span className="text-cyber-text">{formatSlot(constructorMode === 'scratch' ? customSlot : (baseImplantSlot ?? 'head_other'), language)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cyber-muted">{tr('База', 'Base')}:</span>
          <span className="text-cyber-text">{baseCost}eb</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cyber-muted">{tr('Модификации', 'Modifications')}:</span>
          <span className="text-cyber-text">+{modifications.reduce((sum, mod) => sum + mod.cost, 0)}eb</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span className="text-cyber-accent">{tr('Итого', 'Total')}:</span>
          <span className="text-cyber-accent">{totalCost}eb</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cyber-muted">{tr('Человечность', 'Humanity')}:</span>
          <span className="text-cyber-cyan">-{totalHL} HL</span>
        </div>
        {effectsText && (
          <div className="text-cyber-green text-xs mt-2 pt-2 border-t border-cyber-gray/30">
            <span className="font-medium">{tr('Эффекты', 'Effects')}:</span> {effectsText}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 py-2.5 rounded-lg bg-cyber-dark/60 border border-cyber-gray/40 text-cyber-muted text-sm hover:text-cyber-text transition-all"
        >
          {tr('Сброс', 'Reset')}
        </button>
        <button
          type="button"
          data-testid="cyber-lab-save"
          onClick={onSave}
          disabled={!canSave}
          className="flex-[2] py-2.5 rounded-lg bg-cyber-accent/20 border border-cyber-accent/40 text-cyber-accent hover:bg-cyber-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {tr('Сохранить имплант', 'Save implant')}
        </button>
      </div>
    </section>
  );
}

export function CustomImplantsSection({
  customCyberware,
  tr,
  language
}: {
  customCyberware: Cyberware[];
  tr: TranslateFn;
  language: 'ru' | 'en';
}) {
  if (customCyberware.length === 0) {
    return null;
  }

  return (
    <section className="card-cyber">
      <h3 className="ui-card-title text-cyber-accent mb-3">
        {tr('Мои импланты', 'My implants')} ({customCyberware.length})
      </h3>
      <div className="space-y-2">
        {customCyberware.map((implant) => (
          <div key={implant.id} className="flex items-center justify-between bg-cyber-dark p-3 rounded border border-cyber-gray/30">
            <div>
              <div className="ui-card-title">{getLocalizedImplantName(implant, language)}</div>
              <div className="ui-meta">
                {implant.cost}eb | HL: {implant.hl} | {formatSlot(implant.slot, language)}
              </div>
            </div>
            {implant.modifications && implant.modifications.length > 0 && (
              <span className="badge-cyan text-xs">
                +{implant.modifications.length} {tr('мод.', 'mods')}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
