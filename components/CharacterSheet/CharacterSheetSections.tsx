import type { Dispatch, SetStateAction } from 'react';
import { formatRole, getDerangementLabel, getHumanityColorClass } from '../../utils/dice';
import type { Character, DerivedStats, InstalledCyberware, Role, StatKey } from '@/types';
import {
  AbilityIcon,
  ActionButton,
  DerivedStatCard,
  HeartIcon,
  InfoIcon,
  NumericField,
  type TranslateFn,
  ResourceEditor,
  ShieldIcon,
  SpeedIcon
} from './CharacterSheetCommon';

export const STATS_CONFIG = [
  { key: 'INT' as const, labelRu: 'Интеллект', labelEn: 'Intelligence', short: 'INT' },
  { key: 'REF' as const, labelRu: 'Рефлексы', labelEn: 'Reflexes', short: 'REF' },
  { key: 'DEX' as const, labelRu: 'Ловкость', labelEn: 'Dexterity', short: 'DEX' },
  { key: 'TECH' as const, labelRu: 'Техника', labelEn: 'Tech', short: 'TECH' },
  { key: 'WILL' as const, labelRu: 'Воля', labelEn: 'Willpower', short: 'WILL' },
  { key: 'COOL' as const, labelRu: 'Харизма', labelEn: 'Charisma', short: 'ХАР' },
  { key: 'LUCK' as const, labelRu: 'Удача', labelEn: 'Luck', short: 'LUCK' },
  { key: 'MOVE' as const, labelRu: 'Скорость', labelEn: 'Speed', short: 'SPD' },
  { key: 'BODY' as const, labelRu: 'Телосложение', labelEn: 'Body', short: 'BODY' },
  { key: 'EMP' as const, labelRu: 'Эмпатия', labelEn: 'Empathy', short: 'EMP' }
] as const;

const ROLES = [
  'Nomad', 'Rocker', 'Solo', 'Netrunner', 'Tech',
  'Medtech', 'Media', 'Exec', 'Lawman', 'Fixer'
] as const satisfies readonly Role[];

const ROLE_ABILITIES: Record<Role, { labelRu: string; labelEn: string; descRu: string; descEn: string }> = {
  Nomad: {
    labelRu: 'Мото',
    labelEn: 'Moto',
    descRu: 'Ранг Мото отражает доступ к транспорту, семейным ресурсам и поддержке клана.',
    descEn: 'Moto rank reflects access to vehicles, clan resources, and family support.'
  },
  Rocker: {
    labelRu: 'Харизматическое влияние',
    labelEn: 'Charismatic Impact',
    descRu: 'Ранг показывает, насколько сильно персонаж умеет цеплять толпу и направлять её эмоции.',
    descEn: 'Rank shows how strongly the character can sway a crowd and steer its emotions.'
  },
  Solo: {
    labelRu: 'Боевое чутьё',
    labelEn: 'Combat Awareness',
    descRu: 'Это отдельная ролевая способность Solo, а не обычный боевой навык. Она определяет запас тактических приёмов в бою.',
    descEn: 'This is Solo’s separate role ability, not a regular combat skill. It defines their tactical options in battle.'
  },
  Netrunner: {
    labelRu: 'Интерфейс',
    labelEn: 'Interface',
    descRu: 'Ранг интерфейса задаёт уровень нетраннинга и используется как базовый показатель персонажа в сети.',
    descEn: 'Interface rank sets the netrunning level and is used as the character base interface.'
  },
  Tech: {
    labelRu: 'Мастер',
    labelEn: 'Maker',
    descRu: 'Ранг ролевой способности отражает потенциал создания, ремонта и улучшения техники.',
    descEn: 'Maker rank reflects the ability to create, repair, and upgrade tech.'
  },
  Medtech: {
    labelRu: 'Медицина',
    labelEn: 'Medicine',
    descRu: 'Ранг ролевой способности Medtech определяет доступ к лечению, фарме и медицинским процедурам.',
    descEn: 'Medtech role rank defines access to treatment, pharmaceuticals, and medical procedures.'
  },
  Media: {
    labelRu: 'Достоверность',
    labelEn: 'Credibility',
    descRu: 'Ранг показывает, насколько персонажу верят и какой вес имеют его расследования.',
    descEn: 'Rank shows how much people trust the character and how much weight their stories carry.'
  },
  Exec: {
    labelRu: 'Командная работа',
    labelEn: 'Teamwork',
    descRu: 'Ранг Teamwork отражает доступ к корпоративным людям и рабочим ресурсам.',
    descEn: 'Teamwork rank reflects access to corporate staff and operational resources.'
  },
  Lawman: {
    labelRu: 'Подкрепление',
    labelEn: 'Backup',
    descRu: 'Ранг Backup определяет, какое подкрепление Lawman может вызвать в критический момент.',
    descEn: 'Backup rank determines what support a Lawman can call in a critical moment.'
  },
  Fixer: {
    labelRu: 'Operator',
    labelEn: 'Operator',
    descRu: 'Ранг Operator определяет связи, сделки и доступ к нужным людям и товарам.',
    descEn: 'Operator rank defines connections, deals, and access to useful people and goods.'
  }
};

type StatDrafts = Record<StatKey, string>;

export function createStatDrafts(stats: Record<StatKey, number>): StatDrafts {
  return {
    INT: String(stats.INT),
    REF: String(stats.REF),
    DEX: String(stats.DEX),
    TECH: String(stats.TECH),
    WILL: String(stats.WILL),
    COOL: String(stats.COOL),
    LUCK: String(stats.LUCK),
    MOVE: String(stats.MOVE),
    BODY: String(stats.BODY),
    EMP: String(stats.EMP)
  };
}

function parseRoleValue(value: string, fallback: Role): Role {
  return ROLES.find((role) => role === value) ?? fallback;
}

interface BasicInfoCardProps {
  character: Character;
  isLoading: boolean;
  isExportingPdf: boolean;
  tr: TranslateFn;
  onNameChange: (name: string) => void;
  onRoleChange: (role: Role) => void;
  onLevelChange: (level: number) => void;
  onRoleAbilityRankChange: (rank: number) => void;
  onMoneyChange: (money: number) => void;
  onExportPdf: () => void;
  onOpenResetDialog: () => void;
}

export function BasicInfoCard({
  character,
  isLoading,
  isExportingPdf,
  tr,
  onNameChange,
  onRoleChange,
  onLevelChange,
  onRoleAbilityRankChange,
  onMoneyChange,
  onExportPdf,
  onOpenResetDialog
}: BasicInfoCardProps) {
  return (
    <div className="card-cyber">
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyber-accent/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-cyber-accent">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-cyber-text">{tr('Основная информация', 'Basic information')}</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="btn-outline h-11 min-w-[240px] px-5 text-sm disabled:opacity-60 disabled:cursor-wait"
          >
            {isExportingPdf
              ? tr('Готовлю PDF...', 'Preparing PDF...')
              : tr('Скачать анкету', 'Download sheet')}
          </button>
          <button
            onClick={onOpenResetDialog}
            disabled={isLoading}
            className="btn-danger h-11 min-w-[240px] px-5 text-sm"
          >
            {tr('Новый персонаж', 'New character')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        <div className="group xl:col-span-2">
          <label htmlFor="character-name" className="block text-cyber-muted text-xs mb-2 group-focus-within:text-cyber-cyan transition-colors">
            {tr('Имя персонажа', 'Character name')}
          </label>
          <input
            id="character-name"
            type="text"
            value={character.name}
            onChange={(event) => onNameChange(event.target.value)}
            className="input w-full focus:border-cyber-cyan"
            placeholder={tr('Введите имя...', 'Enter name...')}
          />
        </div>

        <div className="group">
          <label htmlFor="character-role" className="block text-cyber-muted text-xs mb-2 group-focus-within:text-cyber-cyan transition-colors">
            {tr('Роль', 'Role')}
          </label>
          <select
            id="character-role"
            aria-label={tr('Роль', 'Role')}
            value={character.role}
            onChange={(event) => onRoleChange(parseRoleValue(event.target.value, character.role))}
            className="select w-full focus:border-cyber-cyan"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {tr(formatRole(role, 'ru'), formatRole(role, 'en'))}
              </option>
            ))}
          </select>
        </div>

        <NumericField
          id="character-level"
          label={tr('Уровень', 'Level')}
          value={character.level}
          min={1}
          onChange={onLevelChange}
        />

        <NumericField
          id="character-role-ability-rank"
          label={tr('Ранг ролевой способности', 'Role ability rank')}
          value={character.roleAbilityRank}
          min={1}
          onChange={onRoleAbilityRankChange}
        />

        <div className="group">
          <label htmlFor="character-money" className="block text-cyber-muted text-xs mb-2 group-focus-within:text-cyber-cyan transition-colors">
            {tr('Эдди (eb)', 'Eddies (eb)')}
          </label>
          <div className="relative">
            <input
              id="character-money"
              type="number"
              value={character.money}
              onChange={(event) => onMoneyChange(parseInt(event.target.value, 10) || 0)}
              className="input w-full font-mono pr-12 focus:border-cyber-cyan"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-accent font-mono text-sm">eb</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DerivedStatsGridProps {
  derivedStats: DerivedStats;
  language: 'ru' | 'en';
  tr: TranslateFn;
}

export function DerivedStatsGrid({ derivedStats, language, tr }: DerivedStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
      <DerivedStatCard value={derivedStats.hp} label="HP" sublabel={tr('Здоровье', 'Health')} color="accent" icon={<HeartIcon />} />
      <DerivedStatCard label={`${derivedStats.armorBody}/${derivedStats.armorHead}`} sublabel={tr('Броня корпус/голова', 'Armor body/head')} color="orange" icon={<ShieldIcon />} />
      <DerivedStatCard value={derivedStats.speed} label="SPD" sublabel={tr('Скорость', 'Speed')} color="cyan" icon={<SpeedIcon />} />
      <DerivedStatCard
        value={derivedStats.humanity}
        label="HUM"
        sublabel={tr('Человечность', 'Humanity')}
        color={getHumanityColorClass(derivedStats.humanity, derivedStats.maxHumanity) === 'text-cyber-green' ? 'green' : getHumanityColorClass(derivedStats.humanity, derivedStats.maxHumanity) === 'text-cyber-orange' ? 'orange' : 'accent'}
        icon={<HeartIcon />}
      />
      <DerivedStatCard
        label={getDerangementLabel(derivedStats.humanity, language, derivedStats.maxHumanity)}
        sublabel={tr('Состояние', 'State')}
        color="purple"
        icon={<InfoIcon />}
      />
    </div>
  );
}

interface RoleAbilityCardProps {
  character: Character;
  tr: TranslateFn;
}

export function RoleAbilityCard({ character, tr }: RoleAbilityCardProps) {
  const roleAbility = ROLE_ABILITIES[character.role];

  return (
    <div className="card-cyber border-cyber-orange/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-cyber-orange/20 flex items-center justify-center">
          <AbilityIcon />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-cyber-text">{tr('Ролевая способность', 'Role ability')}</h2>
          <p className="text-cyber-muted text-xs">
            {tr('Это отдельная механика роли. Она не считается через обычный навык и характеристику.', 'This is a separate role mechanic. It is not calculated from a regular skill and stat.')}
          </p>
        </div>
        <div className="px-2 py-1 rounded bg-cyber-orange/10 border border-cyber-orange/30">
          <span className="text-cyber-orange text-2xs font-medium">{tr(formatRole(character.role, 'ru'), formatRole(character.role, 'en'))}</span>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-cyber-dark/60 border border-cyber-orange/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="font-medium text-cyber-text text-lg">{tr(roleAbility.labelRu, roleAbility.labelEn)}</div>
            <div className="text-cyber-muted text-sm mt-2">{tr(roleAbility.descRu, roleAbility.descEn)}</div>
          </div>
          <div className="min-w-[120px] text-left sm:text-right">
            <div className="text-cyber-muted text-xs">{tr('Текущий ранг', 'Current rank')}</div>
            <div className="text-3xl font-bold font-mono text-cyber-orange">{character.roleAbilityRank}</div>
            <div className="text-cyber-muted text-xs mt-1">
              {character.role === 'Netrunner'
                ? tr('Используется как базовый интерфейс', 'Used as base Interface')
                : tr('Редактируется в основной информации', 'Editable in basic information')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatsEditorCardProps {
  character: Character;
  statDrafts: StatDrafts;
  setStatDrafts: Dispatch<SetStateAction<StatDrafts>>;
  tr: TranslateFn;
  updateStat: (stat: StatKey, value: number) => void;
}

export function StatsEditorCard({ character, statDrafts, setStatDrafts, tr, updateStat }: StatsEditorCardProps) {
  return (
    <div className="card-cyber">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-cyber-cyan/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-cyber-cyan">
            <path d="M12 20V10M18 20V4M6 20v-4" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-cyber-text">{tr('Характеристики', 'Attributes')}</h2>
          <p className="text-cyber-muted text-xs">{tr('Минимум 2. Значения выше 10 разрешены для прокачанных персонажей.', 'Minimum is 2. Values above 10 are allowed for progressed characters.')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2 md:gap-2.5">
        {STATS_CONFIG.map((stat) => {
          const value = character.stats[stat.key];
          const isHigh = value >= 8;
          const isLow = value <= 3;

          return (
            <div key={stat.key} className="group relative">
              <label
                className={`block text-xs mb-2 text-center transition-colors ${
                  isHigh ? 'text-cyber-green' : isLow ? 'text-cyber-orange' : 'text-cyber-muted'
                }`}
                title={tr(stat.labelRu, stat.labelEn)}
              >
                {stat.short}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={statDrafts[stat.key] ?? String(value)}
                  onChange={(event) => {
                    const draft = event.target.value;

                    if (draft === '' || /^-?\d+$/.test(draft)) {
                      setStatDrafts((previous) => ({
                        ...previous,
                        [stat.key]: draft
                      }));
                    }
                  }}
                  onBlur={(event) => {
                    const nextValue = parseInt(event.target.value, 10);

                    if (!Number.isNaN(nextValue)) {
                      const normalizedValue = Math.max(2, nextValue);
                      updateStat(stat.key, normalizedValue);
                      setStatDrafts((previous) => ({
                        ...previous,
                        [stat.key]: String(normalizedValue)
                      }));
                      return;
                    }

                    setStatDrafts((previous) => ({
                      ...previous,
                      [stat.key]: String(character.stats[stat.key])
                    }));
                  }}
                  aria-label={stat.key}
                  className={`input w-full text-center font-mono font-bold text-base py-2.5 px-2 transition-all ${
                    isHigh ? 'border-cyber-green/50 text-cyber-green' : isLow ? 'border-cyber-orange/50 text-cyber-orange' : ''
                  }`}
                />
                <div
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    isHigh ? 'bg-cyber-green' : isLow ? 'bg-cyber-orange' : 'bg-cyber-gray'
                  }`}
                />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-cyber-dark border border-cyber-gray/50 rounded text-2xs text-cyber-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {tr(stat.labelRu, stat.labelEn)} (2+)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CharacterResourcesCardProps {
  character: Character;
  derivedStats: DerivedStats;
  language: 'ru' | 'en';
  damageInput: string;
  healInput: string;
  setDamageInput: Dispatch<SetStateAction<string>>;
  setHealInput: Dispatch<SetStateAction<string>>;
  tr: TranslateFn;
  updateResource: (resource: 'health' | 'humanity' | 'armorHead' | 'armorBody', value: { current?: number; max?: number }) => void;
}

export function CharacterResourcesCard({
  character,
  derivedStats,
  language,
  damageInput,
  healInput,
  setDamageInput,
  setHealInput,
  tr,
  updateResource
}: CharacterResourcesCardProps) {
  return (
    <div className="card-cyber">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-cyber-orange/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-cyber-orange">
            <path d="M12 9v4M12 17h.01" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-cyber-text">{tr('Ресурсы персонажа', 'Character resources')}</h2>
          <p className="text-cyber-muted text-xs">{tr('HP, человечность и броня редактируются вручную и сохраняются отдельно от формул.', 'HP, humanity, and armor are edited manually and stored independently from formulas.')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <ResourceEditor
          title={tr('Здоровье', 'Health')}
          accentClass="text-cyber-green"
          current={character.health.current}
          max={character.health.max}
          currentLabel={tr('Текущее HP', 'Current HP')}
          maxLabel={tr('Максимум HP', 'Max HP')}
          barColorClass={derivedStats.hp > derivedStats.maxHP * 0.5 ? 'bg-cyber-green' : derivedStats.hp > derivedStats.maxHP * 0.25 ? 'bg-cyber-yellow' : 'bg-cyber-orange'}
          onCurrentChange={(value) => updateResource('health', { current: value })}
          onMaxChange={(value) => updateResource('health', { max: value })}
          footer={
            <HealthActions
              current={character.health.current}
              max={character.health.max}
              damageInput={damageInput}
              healInput={healInput}
              setDamageInput={setDamageInput}
              setHealInput={setHealInput}
              tr={tr}
              onChange={(current) => updateResource('health', { current })}
            />
          }
        />

        <ResourceEditor
          title={tr('Человечность', 'Humanity')}
          accentClass={getHumanityColorClass(derivedStats.humanity, derivedStats.maxHumanity)}
          current={character.humanity.current}
          max={character.humanity.max}
          currentLabel={tr('Текущая человечность', 'Current humanity')}
          maxLabel={tr('Максимум человечности', 'Max humanity')}
          barColorClass={getHumanityColorClass(derivedStats.humanity, derivedStats.maxHumanity).replace('text-', 'bg-')}
          onCurrentChange={(value) => updateResource('humanity', { current: value })}
          onMaxChange={(value) => updateResource('humanity', { max: value })}
          footer={
            <div className="text-cyber-muted text-sm">
              {tr('Текущее состояние: ', 'Current state: ')}
              <span className="text-cyber-text font-medium">{getDerangementLabel(derivedStats.humanity, language, derivedStats.maxHumanity)}</span>
            </div>
          }
        />

        <div className="rounded-xl border border-cyber-gray/30 bg-cyber-dark/60 p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-cyber-orange">{tr('Броня', 'Armor')}</h3>
            <div className="text-cyber-muted text-sm">
              {tr('В RED прочность головы и корпуса ведётся отдельно.', 'In RED, head and body armor are tracked separately.')}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <ResourceEditor
              title={tr('Голова', 'Head')}
              accentClass="text-cyber-orange"
              current={character.armorState.head.current}
              max={character.armorState.head.max}
              currentLabel={tr('Текущий SP', 'Current SP')}
              maxLabel={tr('Максимум SP', 'Max SP')}
              barColorClass="bg-cyber-orange"
              onCurrentChange={(value) => updateResource('armorHead', { current: value })}
              onMaxChange={(value) => updateResource('armorHead', { max: value })}
            />
            <ResourceEditor
              title={tr('Корпус', 'Body')}
              accentClass="text-cyber-orange"
              current={character.armorState.body.current}
              max={character.armorState.body.max}
              currentLabel={tr('Текущий SP', 'Current SP')}
              maxLabel={tr('Максимум SP', 'Max SP')}
              barColorClass="bg-cyber-orange"
              onCurrentChange={(value) => updateResource('armorBody', { current: value })}
              onMaxChange={(value) => updateResource('armorBody', { max: value })}
              footer={
                <div className="text-cyber-muted text-sm">
                  {tr('Эти треки можно вести отдельно от каталога экипировки и деградировать по попаданиям.', 'These tracks can be managed independently from the equipment catalog and degraded by hits.')}
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface InstalledCyberwareCardProps {
  character: Character;
  derivedStats: DerivedStats;
  tr: TranslateFn;
  onRemove: (index: number) => void;
}

export function InstalledCyberwareCard({ character, derivedStats, tr, onRemove }: InstalledCyberwareCardProps) {
  return (
    <div className="card-cyber">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyber-purple/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-cyber-purple">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-cyber-text">{tr('Установленный хром', 'Installed cyberware')}</h2>
            <p className="text-cyber-muted text-xs">
              {character.cyberware.length} {tr('имплантов', 'implants')} • -{derivedStats.totalHL} HL
            </p>
          </div>
        </div>
      </div>

      {character.cyberware.length === 0 ? (
        <EmptyInstalledCyberwareState tr={tr} />
      ) : (
        <div className="space-y-3">
          {character.cyberware.map((implant, index) => (
            <InstalledCyberwareItem
              key={`${implant.id}-${index}`}
              implant={implant}
              onRemove={() => onRemove(index)}
              tr={tr}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyInstalledCyberwareState({ tr }: { tr: TranslateFn }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon w-16 h-16 mx-auto mb-4 rounded-full bg-cyber-dark/70 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-cyber-muted">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <p className="empty-state-title mb-2">{tr('Хром не установлен', 'No cyberware installed')}</p>
      <p className="empty-state-description mb-0">{tr('Перейдите во вкладку "Хром", чтобы добавить импланты и сразу увидеть влияние на HL.', 'Open the Cyberware tab to add implants and immediately see the HL impact.')}</p>
    </div>
  );
}

function InstalledCyberwareItem({
  implant,
  onRemove,
  tr
}: {
  implant: InstalledCyberware;
  onRemove: () => void;
  tr: TranslateFn;
}) {
  return (
    <div className="group relative p-4 rounded-xl bg-cyber-dark/60 border border-cyber-gray/30 hover:border-cyber-accent/40 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-1 h-10 rounded-full ${implant.isCustom ? 'bg-cyber-cyan' : 'bg-cyber-accent'}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-cyber-text">{implant.name}</span>
              {implant.isCustom && (
                <span className="px-1.5 py-0.5 text-2xs rounded bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30">
                  CUSTOM
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs mt-1">
              <span className="text-cyber-accent">{implant.cost}eb</span>
              <span className="text-cyber-muted">|</span>
              <span className="text-cyber-cyan">HL: {implant.hl}</span>
              <span className="text-cyber-muted">|</span>
              <span className="text-cyber-muted">{implant.slot}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg bg-cyber-orange/20 border border-cyber-orange/30 text-cyber-orange text-sm hover:bg-cyber-orange/30 transition-all"
        >
          {tr('Удалить', 'Remove')}
        </button>
      </div>
    </div>
  );
}

interface HealthActionsProps {
  current: number;
  max: number;
  damageInput: string;
  healInput: string;
  setDamageInput: Dispatch<SetStateAction<string>>;
  setHealInput: Dispatch<SetStateAction<string>>;
  tr: TranslateFn;
  onChange: (current: number) => void;
}

function HealthActions({
  current,
  max,
  damageInput,
  healInput,
  setDamageInput,
  setHealInput,
  tr,
  onChange
}: HealthActionsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[5, 10, 20, 50].map((damage) => (
          <button
            key={`damage-${damage}`}
            onClick={() => onChange(Math.max(0, current - damage))}
            className="rounded-lg border border-cyber-orange/28 bg-cyber-orange/12 px-3 py-2 text-sm text-cyber-orange transition-colors hover:bg-cyber-orange/18"
          >
            -{damage}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[5, 10, 20, 50].map((heal) => (
          <button
            key={`heal-${heal}`}
            onClick={() => onChange(Math.min(max, current + heal))}
            className="rounded-lg border border-cyber-green/28 bg-cyber-green/12 px-3 py-2 text-sm text-cyber-green transition-colors hover:bg-cyber-green/18"
          >
            +{heal}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder={tr('Урон', 'Damage')}
          className="input w-full text-sm"
          value={damageInput}
          onChange={(event) => setDamageInput(event.target.value)}
        />
        <input
          type="number"
          placeholder={tr('Лечение', 'Healing')}
          className="input w-full text-sm"
          value={healInput}
          onChange={(event) => setHealInput(event.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ActionButton
          tone="damage"
          label={tr('Применить урон', 'Apply damage')}
          value={damageInput}
          tr={tr}
          onApply={(amount) => {
            onChange(Math.max(0, current - amount));
            setDamageInput('');
          }}
        />
        <ActionButton
          tone="heal"
          label={tr('Применить лечение', 'Apply healing')}
          value={healInput}
          tr={tr}
          onApply={(amount) => {
            onChange(Math.min(max, current + amount));
            setHealInput('');
          }}
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onChange(max)}
          className="px-4 py-2 rounded-lg bg-cyber-green/10 border border-cyber-green/30 text-cyber-green text-sm hover:bg-cyber-green/20 transition-colors"
        >
          {tr('Полное восстановление', 'Full restore')}
        </button>
        <button
          onClick={() => onChange(Math.min(1, max))}
          className="px-4 py-2 rounded-lg bg-cyber-orange/10 border border-cyber-orange/30 text-cyber-orange text-sm hover:bg-cyber-orange/20 transition-colors"
        >
          {tr('Критическое состояние', 'Critical state')}
        </button>
      </div>
    </div>
  );
}
