import type { Character, NetProgram, Role, StatKey } from '@/types';

// Санитайзер для любых JSON‑импортов персонажа и кастомного контента.
// Задача модуля: принять "любой мусор", выжать из него максимум полезного
// и гарантировать, что на выходе структура всегда соответствует типам доменной модели.

const STAT_KEYS: StatKey[] = ['INT', 'REF', 'DEX', 'TECH', 'WILL', 'COOL', 'LUCK', 'MOVE', 'BODY', 'EMP'];
const ROLE_VALUES: Role[] = ['Nomad', 'Solo', 'Netrunner', 'Tech', 'Medtech', 'Exec', 'Lawman', 'Fixer', 'Media', 'Rocker'];
const CYBERWARE_TYPES: Character['cyberware'][number]['type'][] = ['standard', 'biotech', 'blackChrome', 'custom'];
const CYBERWARE_SLOTS: Character['cyberware'][number]['slot'][] = [
  'head_eye', 'head_ear', 'head_brain', 'head_other',
  'torso_organs', 'torso_skeleton', 'torso_skin',
  'arm_l_hand', 'arm_l_forearm', 'arm_r_hand', 'arm_r_forearm',
  'leg_l_stamp', 'leg_l_calf', 'leg_r_stamp', 'leg_r_calf'
];
const WEAPON_TYPES: NonNullable<Character['weapons']>[number]['type'][] = ['pistol', 'smg', 'rifle', 'shotgun', 'melee'];
const WEAPON_CONCEALABILITY: NonNullable<Character['weapons']>[number]['concealability'][] = ['easy', 'medium', 'hard'];
const AVAILABILITY_VALUES: NonNullable<Character['weapons']>[number]['availability'][] = ['common', 'uncommon', 'rare'];
const ARMOR_TYPES: NonNullable<Character['armor']>[number]['type'][] = ['clothing', 'vest', 'full', 'helmet', 'subdermal'];
const ARMOR_CONCEALABILITY: NonNullable<Character['armor']>[number]['concealability'][] = ['easy', 'medium', 'hard', 'always'];
const ARMOR_LOCATIONS: NonNullable<Character['armor']>[number]['locations'][number][] = ['head', 'torso', 'arms', 'legs'];
const GEAR_TYPES: NonNullable<Character['gear']>[number]['type'][] = ['medical', 'drug', 'explosive', 'gadget', 'drone', 'cyberware'];
const MAX_NAME_LENGTH = 80;
const MAX_TEXT_LENGTH = 1000;
// Ограничения ниже нужны, чтобы импорт из "раздутых" файлов не
// превращал персонажа в DoS‑атаку на IndexedDB и память.
const MAX_ARRAY_ITEMS = 300;
const MAX_SKILLS = 250;
const PROGRAM_TYPES: NetProgram['type'][] = [
  'deck', 'program', 'ice', 'black_ice', 'attack', 'defense', 'booster', 'utility', 'tracer'
];
const PROGRAM_DANGER_LEVELS: NonNullable<NetProgram['danger_level']>[] = ['low', 'medium', 'high', 'extreme'];

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeString(value: unknown, fallback: string, maxLength = MAX_TEXT_LENGTH): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLength);
}

function sanitizeNumber(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function sanitizeNumberWithoutUpperBound(value: unknown, fallback: number, min: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, parsed);
}

function pickAllowedValue<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  if (typeof value !== 'string') return fallback;
  return allowed.find((item) => item === value) ?? fallback;
}

function sanitizeRole(value: unknown, fallback: Role): Role {
  return pickAllowedValue(value, ROLE_VALUES, fallback);
}

function sanitizeStats(value: unknown, fallback: Character['stats']): Character['stats'] {
  if (!isObjectRecord(value)) return fallback;

  const result = { ...fallback };
  for (const statKey of STAT_KEYS) {
    const legacyValue = statKey === 'COOL' ? value.CHAR : undefined;
    result[statKey] = sanitizeNumberWithoutUpperBound(value[statKey] ?? legacyValue, fallback[statKey], 2);
  }
  return result;
}

function sanitizeResourceTrack(value: unknown, fallback: Character['health']): Character['health'] {
  if (!isObjectRecord(value)) {
    return fallback;
  }

  const nextMax = sanitizeNumberWithoutUpperBound(value.max, fallback.max, 0);
  const nextCurrent = sanitizeNumberWithoutUpperBound(value.current, fallback.current, 0);

  return {
    current: Math.min(nextCurrent, nextMax),
    max: nextMax
  };
}

function sanitizeArmorTrack(value: unknown, fallback: Character['armorState']): Character['armorState'] {
  if (!isObjectRecord(value)) {
    return fallback;
  }

  if ('head' in value || 'body' in value) {
    return {
      head: sanitizeResourceTrack(value.head, fallback.head),
      body: sanitizeResourceTrack(value.body, fallback.body)
    };
  }

  // Legacy single-track armor imports are copied to both zones
  const legacyTrack = sanitizeResourceTrack(value, fallback.body);
  return {
    head: legacyTrack,
    body: legacyTrack
  };
}

function sanitizeCyberwareItem(value: unknown): Character['cyberware'][number] | null {
  if (!isObjectRecord(value)) return null;
  if (typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.slot !== 'string') return null;

  const cost = sanitizeNumber(value.cost, 0, 0, 10_000_000);
  const hl = typeof value.hl === 'string'
    ? sanitizeString(value.hl, '0', 16)
    : sanitizeNumber(value.hl, 0, 0, 10_000);

  return {
    ...value,
    id: sanitizeString(value.id, `cw_${Date.now()}`, 120),
    name: sanitizeString(value.name, 'Имплант', MAX_NAME_LENGTH),
    description: sanitizeString(value.description, '', MAX_TEXT_LENGTH),
    cost,
    hl,
    slot: pickAllowedValue(value.slot, CYBERWARE_SLOTS, 'head_other'),
    type: pickAllowedValue(value.type, CYBERWARE_TYPES, 'custom'),
    installedAt: sanitizeNumber(value.installedAt, Date.now(), 0, 99_999_999_999)
  };
}

function sanitizeWeaponItem(value: unknown): NonNullable<Character['weapons']>[number] | null {
  if (!isObjectRecord(value)) return null;
  if (typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.type !== 'string') return null;

  return {
    ...value,
    id: sanitizeString(value.id, `weapon_${Date.now()}`, 120),
    name: sanitizeString(value.name, 'Оружие', MAX_NAME_LENGTH),
    description: sanitizeString(value.description, '', MAX_TEXT_LENGTH),
    type: pickAllowedValue(value.type, WEAPON_TYPES, 'pistol'),
    damage: sanitizeString(value.damage, '1d6', 24),
    rate_of_fire: sanitizeNumber(value.rate_of_fire, 1, 1, 10),
    concealability: pickAllowedValue(value.concealability, WEAPON_CONCEALABILITY, 'medium'),
    cost: sanitizeNumber(value.cost, 0, 0, 10_000_000),
    weight: sanitizeNumber(value.weight, 0, 0, 1000),
    availability: pickAllowedValue(value.availability, AVAILABILITY_VALUES, 'common')
  };
}

function sanitizeArmorItem(value: unknown): NonNullable<Character['armor']>[number] | null {
  if (!isObjectRecord(value)) return null;
  if (typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.type !== 'string') return null;

  const rawLocations = Array.isArray(value.locations) ? value.locations : [];
  const locations = rawLocations
    .map((location) => pickAllowedValue(location, ARMOR_LOCATIONS, ''))
    .filter((location): location is NonNullable<Character['armor']>[number]['locations'][number] => location !== '')
    .slice(0, 4);

  return {
    ...value,
    id: sanitizeString(value.id, `armor_${Date.now()}`, 120),
    name: sanitizeString(value.name, 'Броня', MAX_NAME_LENGTH),
    description: sanitizeString(value.description, '', MAX_TEXT_LENGTH),
    type: pickAllowedValue(value.type, ARMOR_TYPES, 'vest'),
    sp: sanitizeNumber(value.sp, 0, 0, 100),
    locations,
    cost: sanitizeNumber(value.cost, 0, 0, 10_000_000),
    weight: sanitizeNumber(value.weight, 0, 0, 1000),
    concealability: pickAllowedValue(value.concealability, ARMOR_CONCEALABILITY, 'medium'),
    availability: pickAllowedValue(value.availability, AVAILABILITY_VALUES, 'common')
  };
}

function sanitizeGearItem(value: unknown): NonNullable<Character['gear']>[number] | null {
  if (!isObjectRecord(value)) return null;
  if (typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.type !== 'string') return null;

  return {
    ...value,
    id: sanitizeString(value.id, `gear_${Date.now()}`, 120),
    name: sanitizeString(value.name, 'Предмет', MAX_NAME_LENGTH),
    description: sanitizeString(value.description, '', MAX_TEXT_LENGTH),
    type: pickAllowedValue(value.type, GEAR_TYPES, 'gadget'),
    effect: sanitizeString(value.effect, '', MAX_TEXT_LENGTH),
    damage: sanitizeString(value.damage, '', 24),
    cost: sanitizeNumber(value.cost, 0, 0, 10_000_000),
    weight: sanitizeNumber(value.weight, 0, 0, 1000),
    availability: pickAllowedValue(value.availability, AVAILABILITY_VALUES, 'common')
  };
}

function sanitizeSkillsMap(value: unknown): Record<string, number> | undefined {
  if (!isObjectRecord(value)) return undefined;

  const entries = Object.entries(value).slice(0, MAX_SKILLS);
  const result: Record<string, number> = {};

  for (const [skillKey, skillValue] of entries) {
    const normalizedKey = sanitizeString(skillKey, '', 80);
    if (!normalizedKey) continue;
    result[normalizedKey] = sanitizeNumberWithoutUpperBound(skillValue, 0, 0);
  }
  return result;
}

function sanitizeCustomCombatSkillItem(value: unknown): Character['customCombatSkills'][number] | null {
  if (!isObjectRecord(value)) return null;

  return {
    id: sanitizeString(value.id, `custom_combat_${Date.now()}`, 120),
    name: sanitizeString(value.name, '', MAX_NAME_LENGTH),
    description: sanitizeString(value.description, '', MAX_TEXT_LENGTH),
    level: sanitizeNumberWithoutUpperBound(value.level, 0, 0)
  };
}

function sanitizeArray<T>(value: unknown, mapper: (item: unknown) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, MAX_ARRAY_ITEMS)
    .map(item => mapper(item))
    .filter((item): item is T => item !== null);
}

function sanitizeProgramItem(value: unknown): NetProgram | null {
  if (!isObjectRecord(value)) return null;
  if (typeof value.id !== 'string' || typeof value.name !== 'string') return null;

  const type = pickAllowedValue(value.type, PROGRAM_TYPES, 'program');
  const dangerLevel = pickAllowedValue(value.danger_level, PROGRAM_DANGER_LEVELS, 'medium');

  let programEffects: NetProgram['effects'] | undefined;
  if (typeof value.effects === 'string') {
    programEffects = sanitizeString(value.effects, '', MAX_TEXT_LENGTH);
  } else if (isObjectRecord(value.effects)) {
    const normalizedEffects: Record<string, number | string> = {};
    for (const [effectKey, effectValue] of Object.entries(value.effects)) {
      if (typeof effectValue === 'number' && Number.isFinite(effectValue)) {
        normalizedEffects[sanitizeString(effectKey, '', 80)] = effectValue;
      } else if (typeof effectValue === 'string') {
        normalizedEffects[sanitizeString(effectKey, '', 80)] = sanitizeString(effectValue, '', 120);
      }
    }
    programEffects = normalizedEffects;
  }

  return {
    ...value,
    id: sanitizeString(value.id, `program_${Date.now()}`, 120),
    name: sanitizeString(value.name, 'Программа', MAX_NAME_LENGTH),
    description: sanitizeString(value.description, '', MAX_TEXT_LENGTH),
    type,
    cost: sanitizeNumber(value.cost, 0, 0, 10_000_000),
    level: sanitizeNumber(value.level, 1, 1, 20),
    strength: sanitizeNumber(value.strength, 0, 0, 100),
    speed: sanitizeNumber(value.speed, 0, 0, 100),
    effects: programEffects,
    danger_level: dangerLevel,
    requirement: sanitizeString(value.requirement, '', 120)
  };
}

export function sanitizeCharacterImport(raw: unknown, fallback: Character): Character {
  if (!isObjectRecord(raw)) {
    throw new Error('Некорректный формат персонажа');
  }

  const sanitizedStats = sanitizeStats(raw.stats, fallback.stats);
  const formulaMaxHealth = (sanitizedStats.BODY + sanitizedStats.WILL) * 5;
  const formulaMaxHumanity = sanitizedStats.EMP * 10;
  const healthFallback = {
    current: Math.min(fallback.health.current, formulaMaxHealth),
    max: formulaMaxHealth
  };
  const humanityFallback = {
    current: Math.min(fallback.humanity.current, formulaMaxHumanity),
    max: formulaMaxHumanity
  };
  const sanitizedHealth = isObjectRecord(raw.health)
    ? sanitizeResourceTrack(raw.health, healthFallback)
    : {
        current: sanitizeNumberWithoutUpperBound(raw.currentHP, healthFallback.current, 0),
        max: healthFallback.max
      };

  return {
    id: sanitizeString(raw.id, fallback.id, 120),
    name: sanitizeString(raw.name, fallback.name, MAX_NAME_LENGTH),
    role: sanitizeRole(raw.role, fallback.role),
    level: sanitizeNumberWithoutUpperBound(raw.level, fallback.level, 1),
    roleAbilityRank: sanitizeNumberWithoutUpperBound(raw.roleAbilityRank, fallback.roleAbilityRank, 1),
    stats: sanitizedStats,
    currentHP: sanitizeNumberWithoutUpperBound(raw.currentHP, fallback.currentHP ?? fallback.health.current, 0),
    health: {
      current: Math.min(sanitizedHealth.current, sanitizedHealth.max),
      max: sanitizedHealth.max
    },
    humanity: sanitizeResourceTrack(raw.humanity, humanityFallback),
    armorState: sanitizeArmorTrack(raw.armorState, fallback.armorState),
    cyberware: sanitizeArray(raw.cyberware, sanitizeCyberwareItem),
    money: sanitizeNumber(raw.money, fallback.money, 0, 10_000_000),
    skills: sanitizeSkillsMap(raw.skills),
    customCombatSkills: sanitizeArray(raw.customCombatSkills, sanitizeCustomCombatSkillItem),
    weapons: sanitizeArray(raw.weapons, sanitizeWeaponItem),
    armor: sanitizeArray(raw.armor, sanitizeArmorItem),
    gear: sanitizeArray(raw.gear, sanitizeGearItem)
  };
}

export function sanitizeCustomCyberwareImport(raw: unknown): Character['cyberware'] {
  return sanitizeArray(raw, sanitizeCyberwareItem);
}

export function sanitizeCustomWeaponImport(raw: unknown): NonNullable<Character['weapons']> {
  return sanitizeArray(raw, sanitizeWeaponItem);
}

export function sanitizeCustomArmorImport(raw: unknown): NonNullable<Character['armor']> {
  return sanitizeArray(raw, sanitizeArmorItem);
}

export function sanitizeCustomProgramImport(raw: unknown): NetProgram[] {
  return sanitizeArray(raw, sanitizeProgramItem);
}

export function parseImportJson(json: string, maxBytes: number): unknown {
  if (typeof json !== 'string' || !json.trim()) {
    throw new Error('Пустой JSON');
  }

  const jsonBytes = new TextEncoder().encode(json).length;
  if (jsonBytes > maxBytes) {
    throw new Error('Слишком большой файл импорта');
  }

  try {
    return JSON.parse(json);
  } catch {
    throw new Error('Некорректный JSON');
  }
}
