import { useMemo, useState } from 'react';
import { useCustomContentState, useCyberwareActions } from '../../entities/character/model/hooks';
import { useLanguage } from '../../features/settings/model/hooks';
import { isCyberware, readArrayData } from '../../utils/dataGuards';
import type { Cyberware, CyberwareModification, CyberwareSlot } from '@/types';
import standardImplants from '../../data/implants/standard.json';
import {
  BaseParametersSection,
  BuilderModeSection,
  CustomImplantsSection,
  ModificationsSection,
  SummarySection
} from './BlackChromeLabView';

const MOD_PRESETS = [
  { label: { ru: '+1 к параметру', en: '+1 to parameter' }, effect: '+1', hl: 2, cost: 100 },
  { label: { ru: '+2 к параметру', en: '+2 to parameter' }, effect: '+2', hl: 4, cost: 200 },
  { label: { ru: 'Доп. модуль', en: 'Extra module' }, effect: 'module_upgrade', hl: 3, cost: 150 }
];

const SLOT_OPTIONS: CyberwareSlot[] = [
  'head_eye', 'head_ear', 'head_brain', 'head_other',
  'torso_organs', 'torso_skeleton', 'torso_skin',
  'arm_l_hand', 'arm_l_forearm', 'arm_r_hand', 'arm_r_forearm',
  'leg_l_stamp', 'leg_l_calf', 'leg_r_stamp', 'leg_r_calf'
];

const STANDARD_IMPLANTS = readArrayData(standardImplants, isCyberware);

interface CustomEffectDraft {
  id: string;
  key: string;
  value: string;
}

function parseAverageHL(value: number | string | undefined): number {
  if (typeof value === 'number') return Math.max(0, value);
  if (typeof value !== 'string') return 0;

  const normalized = value.trim();
  const diceMatch = normalized.match(/^(\d+)d(\d+)$/i);
  if (diceMatch) {
    const count = Number(diceMatch[1]);
    const sides = Number(diceMatch[2]);
    return Math.max(0, Math.ceil((count * (sides + 1)) / 2));
  }

  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
}

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Лаборатория «Блэк Хром» — расширенный конструктор кастомных имплантов.
export function BlackChromeLab() {
  const customContent = useCustomContentState();
  const { addCustomCyberware } = useCyberwareActions();
  const { language } = useLanguage();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);

  const [constructorMode, setConstructorMode] = useState<'base' | 'scratch'>('base');
  const [selectedBaseId, setSelectedBaseId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modifications, setModifications] = useState<CyberwareModification[]>([]);
  const [modEffectDraft, setModEffectDraft] = useState('');
  const [modCostDraft, setModCostDraft] = useState(0);
  const [modHLDraft, setModHLDraft] = useState(0);
  const [customSlot, setCustomSlot] = useState<CyberwareSlot>('head_other');
  const [customCost, setCustomCost] = useState(0);
  const [customHL, setCustomHL] = useState(0);
  const [customEffects, setCustomEffects] = useState<CustomEffectDraft[]>([]);
  const [effectKeyDraft, setEffectKeyDraft] = useState('');
  const [effectValueDraft, setEffectValueDraft] = useState('');

  const baseImplant = useMemo(
    () => STANDARD_IMPLANTS.find((implant) => implant.id === selectedBaseId) ?? null,
    [selectedBaseId]
  );

  const canEditDetails = constructorMode === 'scratch' || baseImplant !== null;
  const baseCost = constructorMode === 'scratch' ? customCost : (baseImplant?.cost ?? 0);
  const baseHL = constructorMode === 'scratch' ? customHL : parseAverageHL(baseImplant?.hl);

  const totalCost = useMemo(() => {
    const modsCost = modifications.reduce((sum, mod) => sum + mod.cost, 0);
    return Math.max(0, baseCost + modsCost);
  }, [baseCost, modifications]);

  const totalHL = useMemo(() => {
    const modsHL = modifications.reduce((sum, mod) => sum + mod.hl, 0);
    return Math.max(0, baseHL + modsHL);
  }, [baseHL, modifications]);

  const allEffects = useMemo(() => {
    const result: Record<string, string> = {};

    if (constructorMode === 'base' && baseImplant?.effects) {
      Object.entries(baseImplant.effects).forEach(([key, value]) => {
        if (typeof value === 'boolean') return;
        result[key] = String(value);
      });
    }

    customEffects.forEach((effect) => {
      result[effect.key] = effect.value;
    });

    modifications.forEach((modification, index) => {
      result[`mod_${index + 1}`] = modification.effect;
    });

    return result;
  }, [constructorMode, baseImplant, customEffects, modifications]);

  const effectsText = useMemo(
    () => Object.values(allEffects).join(', '),
    [allEffects]
  );

  const canSave = name.trim().length > 0 && (
    constructorMode === 'scratch'
      ? customSlot.length > 0
      : baseImplant !== null
  );

  const addPresetModification = (preset: typeof MOD_PRESETS[number]) => {
    const modification: CyberwareModification = {
      id: createId('mod'),
      name: tr(preset.label.ru, preset.label.en),
      cost: preset.cost,
      hl: preset.hl,
      effect: preset.effect
    };
    setModifications((prev) => [...prev, modification]);
  };

  const addCustomModification = () => {
    if (!modEffectDraft.trim()) return;
    if (modCostDraft < 0 || modHLDraft < 0) return;

    const modification: CyberwareModification = {
      id: createId('mod'),
      name: modEffectDraft.trim(),
      cost: modCostDraft,
      hl: modHLDraft,
      effect: modEffectDraft.trim()
    };

    setModifications((prev) => [...prev, modification]);
    setModEffectDraft('');
    setModCostDraft(0);
    setModHLDraft(0);
  };

  const removeModification = (id: string) => {
    setModifications((prev) => prev.filter((item) => item.id !== id));
  };

  const addCustomEffect = () => {
    const key = effectKeyDraft.trim();
    const value = effectValueDraft.trim();
    if (!key || !value) return;

    const effect: CustomEffectDraft = {
      id: createId('effect'),
      key,
      value
    };

    setCustomEffects((prev) => [...prev.filter((item) => item.key !== key), effect]);
    setEffectKeyDraft('');
    setEffectValueDraft('');
  };

  const removeCustomEffect = (id: string) => {
    setCustomEffects((prev) => prev.filter((item) => item.id !== id));
  };

  const resetBuilder = () => {
    setConstructorMode('base');
    setSelectedBaseId('');
    setName('');
    setDescription('');
    setModifications([]);
    setModEffectDraft('');
    setModCostDraft(0);
    setModHLDraft(0);
    setCustomSlot('head_other');
    setCustomCost(0);
    setCustomHL(0);
    setCustomEffects([]);
    setEffectKeyDraft('');
    setEffectValueDraft('');
  };

  const saveCustomImplant = () => {
    if (!canSave) return;

    const slot = constructorMode === 'scratch' ? customSlot : (baseImplant?.slot ?? 'head_other');
    const customImplant: Cyberware = {
      id: createId('custom'),
      name: name.trim(),
      description: description.trim() || (
        constructorMode === 'scratch'
          ? tr('Пользовательский имплант', 'Custom user implant')
          : `${baseImplant?.name ?? ''} ${tr('с модификациями', 'with modifications')}`
      ),
      type: 'custom',
      cost: totalCost,
      hl: totalHL,
      slot,
      effects: allEffects,
      isCustom: true,
      baseImplantId: constructorMode === 'base' ? (baseImplant?.id ?? undefined) : undefined,
      modifications: modifications
    };

    addCustomCyberware(customImplant);
    resetBuilder();
  };

  return (
    <div className="space-y-6 animate-in">
      <BuilderModeSection constructorMode={constructorMode} tr={tr} onModeChange={setConstructorMode} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <BaseParametersSection
            constructorMode={constructorMode}
            tr={tr}
            standardImplants={STANDARD_IMPLANTS}
            selectedBaseId={selectedBaseId}
            customSlot={customSlot}
            customCost={customCost}
            customHL={customHL}
            baseImplant={baseImplant}
            slotOptions={SLOT_OPTIONS}
            language={language}
            onSelectedBaseIdChange={setSelectedBaseId}
            onCustomSlotChange={setCustomSlot}
            onCustomCostChange={setCustomCost}
            onCustomHLChange={setCustomHL}
          />

          <section className={`card-cyber p-5 transition-all ${canEditDetails ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <h3 className="text-cyber-accent font-medium mb-3">{tr('Название и описание', 'Name and description')}</h3>
            <input
              data-testid="cyber-lab-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={tr('Название кастомного импланта...', 'Custom implant name...')}
              className="input w-full"
            />
            <textarea
              data-testid="cyber-lab-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={tr('Описание (опционально)...', 'Description (optional)...')}
              className="input w-full h-20 resize-none text-sm mt-3"
            />
          </section>
        </div>

        <div className="space-y-4">
          <ModificationsSection
            tr={tr}
            canEditDetails={canEditDetails}
            modPresets={MOD_PRESETS}
            modifications={modifications}
            modEffectDraft={modEffectDraft}
            modCostDraft={modCostDraft}
            modHLDraft={modHLDraft}
            customEffects={customEffects}
            effectKeyDraft={effectKeyDraft}
            effectValueDraft={effectValueDraft}
            onAddPreset={(presetIndex) => addPresetModification(MOD_PRESETS[presetIndex])}
            onModEffectDraftChange={setModEffectDraft}
            onModCostDraftChange={setModCostDraft}
            onModHLDraftChange={setModHLDraft}
            onAddCustomModification={addCustomModification}
            onRemoveModification={removeModification}
            onEffectKeyDraftChange={setEffectKeyDraft}
            onEffectValueDraftChange={setEffectValueDraft}
            onAddCustomEffect={addCustomEffect}
            onRemoveCustomEffect={removeCustomEffect}
          />

          <SummarySection
            tr={tr}
            constructorMode={constructorMode}
            customSlot={customSlot}
            baseImplantSlot={baseImplant?.slot ?? null}
            language={language}
            baseCost={baseCost}
            modifications={modifications}
            totalCost={totalCost}
            totalHL={totalHL}
            effectsText={effectsText}
            canSave={canSave}
            onReset={resetBuilder}
            onSave={saveCustomImplant}
          />
        </div>
      </div>

      <CustomImplantsSection customCyberware={customContent.cyberware} tr={tr} language={language} />
    </div>
  );
}

export default BlackChromeLab;
