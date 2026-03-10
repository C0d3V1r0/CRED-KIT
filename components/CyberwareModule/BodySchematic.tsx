import { useMemo, useState } from 'react';
import { parseHL } from '../../logic/character/statsCalculator';
import { useLanguage } from '../../features/settings/model/hooks';
import type { InstalledCyberware, CyberwareSlot } from '@/types';

const BODY_PATH = {
  head: 'M100,12 C110,12 118,20 118,30 C118,38 114,44 110,48 L110,58 L106,64 L94,64 L90,58 L90,48 C86,44 82,38 82,30 C82,20 90,12 100,12 Z',
  neck: 'M96,64 L96,70 L104,70 L104,64 Z',
  torso: 'M96,70 L84,76 L78,95 L74,130 L72,160 L80,165 L92,168 L108,168 L120,165 L128,160 L126,130 L122,95 L116,76 L104,70 Z',
  leftShoulder: 'M84,76 L72,80 L68,78 L66,90 L72,95 L78,95 Z',
  rightShoulder: 'M116,76 L128,80 L132,78 L134,90 L128,95 L122,95 Z',
  leftArm: 'M68,78 L58,85 L48,100 L42,120 L38,135 L42,140 L52,130 L62,115 L70,100 L74,90 Z',
  rightArm: 'M132,78 L142,85 L152,100 L158,120 L162,135 L158,140 L148,130 L138,115 L130,100 L126,90 Z',
  leftHand: 'M38,135 L34,142 L36,148 L40,150 L44,148 L46,142 Z',
  rightHand: 'M162,135 L166,142 L164,148 L160,150 L156,148 L154,142 Z',
  leftHip: 'M80,165 L72,170 L68,200 L72,205 L82,205 L86,200 L84,170 Z',
  rightHip: 'M120,165 L128,170 L132,200 L128,205 L118,205 L114,200 L116,170 Z',
  leftLeg: 'M68,200 L62,225 L58,260 L60,295 L68,300 L78,300 L82,295 L84,260 L80,225 L82,205 L78,200 Z',
  rightLeg: 'M132,200 L138,225 L142,260 L140,295 L132,300 L122,300 L118,295 L116,260 L120,205 L118,200 Z'
};

const SLOT_META: Record<CyberwareSlot, { x: number; y: number; zone: ZoneId; zoneLabel: { ru: string; en: string }; label: { ru: string; en: string } }> = {
  head_eye: { x: 92, y: 26, zone: 'head', zoneLabel: { ru: 'Голова', en: 'Head' }, label: { ru: 'Глаз', en: 'Eye' } },
  head_ear: { x: 108, y: 26, zone: 'head', zoneLabel: { ru: 'Голова', en: 'Head' }, label: { ru: 'Ухо', en: 'Ear' } },
  head_brain: { x: 100, y: 40, zone: 'head', zoneLabel: { ru: 'Голова', en: 'Head' }, label: { ru: 'Мозг', en: 'Brain' } },
  head_other: { x: 100, y: 54, zone: 'head', zoneLabel: { ru: 'Голова', en: 'Head' }, label: { ru: 'Прочее', en: 'Other' } },
  torso_organs: { x: 88, y: 105, zone: 'torso', zoneLabel: { ru: 'Торс', en: 'Torso' }, label: { ru: 'Органы', en: 'Organs' } },
  torso_skeleton: { x: 100, y: 130, zone: 'torso', zoneLabel: { ru: 'Торс', en: 'Torso' }, label: { ru: 'Скелет', en: 'Skeleton' } },
  torso_skin: { x: 112, y: 105, zone: 'torso', zoneLabel: { ru: 'Торс', en: 'Torso' }, label: { ru: 'Кожа', en: 'Skin' } },
  arm_l_forearm: { x: 55, y: 100, zone: 'arm_l', zoneLabel: { ru: 'Левая рука', en: 'Left arm' }, label: { ru: 'Предплечье', en: 'Forearm' } },
  arm_l_hand: { x: 40, y: 135, zone: 'arm_l', zoneLabel: { ru: 'Левая рука', en: 'Left arm' }, label: { ru: 'Кисть', en: 'Hand' } },
  arm_r_forearm: { x: 145, y: 100, zone: 'arm_r', zoneLabel: { ru: 'Правая рука', en: 'Right arm' }, label: { ru: 'Предплечье', en: 'Forearm' } },
  arm_r_hand: { x: 160, y: 135, zone: 'arm_r', zoneLabel: { ru: 'Правая рука', en: 'Right arm' }, label: { ru: 'Кисть', en: 'Hand' } },
  leg_l_stamp: { x: 70, y: 210, zone: 'leg_l', zoneLabel: { ru: 'Левая нога', en: 'Left leg' }, label: { ru: 'Стопа', en: 'Foot' } },
  leg_l_calf: { x: 70, y: 265, zone: 'leg_l', zoneLabel: { ru: 'Левая нога', en: 'Left leg' }, label: { ru: 'Голень', en: 'Calf' } },
  leg_r_stamp: { x: 130, y: 210, zone: 'leg_r', zoneLabel: { ru: 'Правая нога', en: 'Right leg' }, label: { ru: 'Стопа', en: 'Foot' } },
  leg_r_calf: { x: 130, y: 265, zone: 'leg_r', zoneLabel: { ru: 'Правая нога', en: 'Right leg' }, label: { ru: 'Голень', en: 'Calf' } }
};

const ZONES = [
  { id: 'head' as const, label: { ru: 'Голова', en: 'Head' }, slots: ['head_eye', 'head_ear', 'head_brain', 'head_other'] as CyberwareSlot[] },
  { id: 'torso' as const, label: { ru: 'Торс', en: 'Torso' }, slots: ['torso_organs', 'torso_skeleton', 'torso_skin'] as CyberwareSlot[] },
  { id: 'arm_l' as const, label: { ru: 'Левая рука', en: 'Left arm' }, slots: ['arm_l_forearm', 'arm_l_hand'] as CyberwareSlot[] },
  { id: 'arm_r' as const, label: { ru: 'Правая рука', en: 'Right arm' }, slots: ['arm_r_forearm', 'arm_r_hand'] as CyberwareSlot[] },
  { id: 'leg_l' as const, label: { ru: 'Левая нога', en: 'Left leg' }, slots: ['leg_l_stamp', 'leg_l_calf'] as CyberwareSlot[] },
  { id: 'leg_r' as const, label: { ru: 'Правая нога', en: 'Right leg' }, slots: ['leg_r_stamp', 'leg_r_calf'] as CyberwareSlot[] }
];

type ZoneId = 'head' | 'torso' | 'arm_l' | 'arm_r' | 'leg_l' | 'leg_r';

interface BodySchematicProps {
  cyberware: InstalledCyberware[];
  onZoneClick?: (zone: string) => void;
  onSlotClick?: (slot: CyberwareSlot) => void;
  onSlotRemove?: (slot: CyberwareSlot) => void;
  selectedSlot?: CyberwareSlot | null;
}

function getZoneCount(cyberware: InstalledCyberware[], slots: CyberwareSlot[]) {
  return cyberware.filter(item => slots.includes(item.slot)).length;
}

export function BodySchematic({
  cyberware,
  onZoneClick,
  onSlotClick,
  onSlotRemove,
  selectedSlot
}: BodySchematicProps) {
  const { language } = useLanguage();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);
  const [hoveredSlot, setHoveredSlot] = useState<CyberwareSlot | null>(null);

  const installedBySlot = useMemo(() => {
    const map = new Map<CyberwareSlot, InstalledCyberware[]>();

    for (const slot of Object.keys(SLOT_META) as CyberwareSlot[]) {
      map.set(slot, []);
    }

    for (const item of cyberware) {
      const list = map.get(item.slot) || [];
      list.push(item);
      map.set(item.slot, list);
    }

    return map;
  }, [cyberware]);

  const totalHL = useMemo(() => cyberware.reduce((sum, item) => sum + parseHL(item.hl), 0), [cyberware]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-cyber-gray/30 bg-cyber-dark/40 p-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-cyber-muted">
          <span className="rounded-full border border-cyber-green/40 bg-cyber-green/10 px-2 py-1 text-cyber-green">● {tr('занят', 'occupied')}</span>
          <span className="rounded-full border border-cyber-cyan/40 bg-cyber-cyan/10 px-2 py-1 text-cyber-cyan">● {tr('пуст', 'empty')}</span>
          <span className="rounded-full border border-cyber-orange/40 bg-cyber-orange/10 px-2 py-1 text-cyber-orange">● {tr('конфликт', 'conflict')}</span>
          <span className="ml-auto text-cyber-accent">{tr('Всего', 'Total')}: {cyberware.length} {tr('импл.', 'impl.') } / -{totalHL} HL</span>
        </div>
        <p className="mt-2 text-xs text-cyber-muted">
          {tr('Нажмите на слот для выбора. Если слот занят, кнопка «Удалить» доступна в списке ниже.', 'Click a slot to select it. If occupied, use the "Remove" button in the list below.')}
        </p>
      </div>

      <div className="rounded-xl border border-cyber-gray/30 bg-gradient-to-b from-cyber-dark/55 to-cyber-dark/25 p-3 sm:p-4">
        <svg viewBox="0 0 200 310" className="mx-auto h-auto w-full max-w-[340px]">
          <g>
            <path d={BODY_PATH.head} fill="rgba(0,240,255,0.06)" stroke="#355160" strokeWidth="1.2" />
            <path d={BODY_PATH.neck} fill="rgba(0,240,255,0.06)" stroke="#355160" strokeWidth="1.2" />
            <path d={BODY_PATH.torso} fill="rgba(0,240,255,0.06)" stroke="#355160" strokeWidth="1.2" />
            <path d={BODY_PATH.leftShoulder} fill="rgba(0,240,255,0.06)" stroke="#355160" strokeWidth="1.2" />
            <path d={BODY_PATH.rightShoulder} fill="rgba(0,240,255,0.06)" stroke="#355160" strokeWidth="1.2" />
            <path d={BODY_PATH.leftArm} fill="rgba(0,240,255,0.06)" stroke="#355160" strokeWidth="1.2" />
            <path d={BODY_PATH.rightArm} fill="rgba(0,240,255,0.06)" stroke="#355160" strokeWidth="1.2" />
            <path d={BODY_PATH.leftHand} fill="rgba(0,240,255,0.06)" stroke="#355160" strokeWidth="1.2" />
            <path d={BODY_PATH.rightHand} fill="rgba(0,240,255,0.06)" stroke="#355160" strokeWidth="1.2" />
            <path d={BODY_PATH.leftHip} fill="rgba(0,240,255,0.06)" stroke="#355160" strokeWidth="1.2" />
            <path d={BODY_PATH.rightHip} fill="rgba(0,240,255,0.06)" stroke="#355160" strokeWidth="1.2" />
            <path d={BODY_PATH.leftLeg} fill="rgba(0,240,255,0.06)" stroke="#355160" strokeWidth="1.2" />
            <path d={BODY_PATH.rightLeg} fill="rgba(0,240,255,0.06)" stroke="#355160" strokeWidth="1.2" />
          </g>

          {ZONES.map(zone => (
            <g key={zone.id}>
              {zone.slots.map(slot => {
                const meta = SLOT_META[slot];
                const items = installedBySlot.get(slot) || [];
                const hasImplant = items.length > 0;
                const hasConflict = items.length > 1;
                const isSelected = selectedSlot === slot;
                const isHovered = hoveredSlot === slot;

                const fill = hasConflict
                  ? 'rgba(255, 146, 55, 0.25)'
                  : hasImplant
                    ? 'rgba(0, 255, 136, 0.25)'
                    : 'rgba(0, 240, 255, 0.16)';

                const stroke = hasConflict
                  ? '#ff9237'
                  : hasImplant
                    ? '#00ff88'
                    : '#00f0ff';

                return (
                  <g key={slot}>
                    <circle
                      cx={meta.x}
                      cy={meta.y}
                      r={isSelected || isHovered ? 9 : 8}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isSelected ? 2.2 : 1.6}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredSlot(slot)}
                      onMouseLeave={() => setHoveredSlot(null)}
                      onClick={() => onSlotClick?.(slot)}
                    />
                    <text
                      x={meta.x}
                      y={meta.y + 3}
                      textAnchor="middle"
                      className="pointer-events-none fill-cyber-text text-[6px] font-bold"
                    >
                      {hasImplant ? '✓' : '+'}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 md:hidden">
        {ZONES.map(zone => {
          const count = getZoneCount(cyberware, zone.slots);

          return (
            <button
              key={zone.id}
              onClick={() => onZoneClick?.(zone.id)}
              className="rounded-xl border border-cyber-gray/30 bg-cyber-dark/45 px-3 py-3 text-left transition-colors hover:border-cyber-accent/30"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-cyber-text">{tr(zone.label.ru, zone.label.en)}</span>
                <span className="rounded-full border border-cyber-accent/25 bg-cyber-accent/10 px-2 py-0.5 text-2xs text-cyber-accent">
                  {count}/{zone.slots.length}
                </span>
              </div>
              <p className="mt-1 text-2xs text-cyber-muted">
                {count > 0 ? tr('Есть активные слоты', 'Active slots detected') : tr('Зона пока пустая', 'Zone is still empty')}
              </p>
            </button>
          );
        })}
      </div>

      <div className="hidden grid-cols-1 gap-3 md:grid md:grid-cols-2">
        {ZONES.map(zone => {
          const count = getZoneCount(cyberware, zone.slots);

          return (
            <div key={zone.id} className="rounded-xl border border-cyber-gray/30 bg-cyber-dark/40 p-3">
              <button
                onClick={() => onZoneClick?.(zone.id)}
                className="mb-2 flex w-full items-center justify-between rounded-lg border border-cyber-gray/40 bg-cyber-dark/50 px-3 py-2 text-left hover:border-cyber-accent/40"
              >
                <span className="font-medium text-cyber-text">{tr(zone.label.ru, zone.label.en)}</span>
                <span className="text-xs text-cyber-accent">{count}/{zone.slots.length}</span>
              </button>

              <div className="space-y-2">
                {zone.slots.map(slot => {
                  const items = installedBySlot.get(slot) || [];
                  const primary = items[0];
                  const hasImplant = items.length > 0;
                  const hasConflict = items.length > 1;
                  const isSelected = selectedSlot === slot;

                  return (
                    <div
                      key={slot}
                      className={`rounded-lg border p-2 ${
                        isSelected
                          ? 'border-cyber-accent/60 bg-cyber-accent/10'
                          : 'border-cyber-gray/30 bg-cyber-dark/55'
                      }`}
                    >
                      <button
                        onClick={() => onSlotClick?.(slot)}
                        className="flex w-full items-start justify-between gap-2 text-left"
                      >
                        <div>
                          <div className="text-sm text-cyber-text">{tr(SLOT_META[slot].label.ru, SLOT_META[slot].label.en)}</div>
                          <div className="text-xs text-cyber-muted">
                            {hasImplant ? primary?.name : tr('Пустой слот', 'Empty slot')}
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-2xs ${
                            hasConflict
                              ? 'border border-cyber-orange/40 bg-cyber-orange/10 text-cyber-orange'
                              : hasImplant
                                ? 'border border-cyber-green/40 bg-cyber-green/10 text-cyber-green'
                                : 'border border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan'
                          }`}
                        >
                          {hasConflict ? tr('Конфликт', 'Conflict') : hasImplant ? tr('Занят', 'Occupied') : tr('Пусто', 'Empty')}
                        </span>
                      </button>

                      {hasImplant && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-2xs text-cyber-muted">HL: -{parseHL(primary?.hl || 0)}</span>
                          <button
                            onClick={() => onSlotRemove?.(slot)}
                            className="rounded border border-cyber-orange/40 bg-cyber-orange/10 px-2 py-1 text-2xs text-cyber-orange hover:bg-cyber-orange/20"
                          >
                            {tr('Удалить', 'Remove')}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BodySchematic;
