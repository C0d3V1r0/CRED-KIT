import type { Armor, Cyberdeck, Cyberware, CyberwareSlot, CyberwareType, Gear, NetProgram, Weapon } from '@/types';

const CYBERWARE_SLOTS = [
  'head_eye', 'head_ear', 'head_brain', 'head_other',
  'torso_organs', 'torso_skeleton', 'torso_skin',
  'arm_l_hand', 'arm_l_forearm', 'arm_r_hand', 'arm_r_forearm',
  'leg_l_stamp', 'leg_l_calf', 'leg_r_stamp', 'leg_r_calf'
] as const satisfies readonly CyberwareSlot[];

const CYBERWARE_TYPES = ['standard', 'biotech', 'blackChrome', 'custom'] as const satisfies readonly CyberwareType[];
const WEAPON_TYPES = ['pistol', 'smg', 'rifle', 'shotgun', 'melee'] as const satisfies readonly Weapon['type'][];
const CONCEALABILITY = ['easy', 'medium', 'hard'] as const;
const ARMOR_TYPES = ['clothing', 'vest', 'full', 'helmet', 'subdermal'] as const satisfies readonly Armor['type'][];
const ARMOR_CONCEALABILITY = ['easy', 'medium', 'hard', 'always'] as const satisfies readonly Armor['concealability'][];
const ARMOR_LOCATIONS = ['head', 'torso', 'arms', 'legs'] as const satisfies readonly Armor['locations'][number][];
const GEAR_TYPES = ['medical', 'drug', 'explosive', 'gadget', 'drone', 'cyberware'] as const satisfies readonly Gear['type'][];
const AVAILABILITY = ['common', 'uncommon', 'rare'] as const;
const NET_PROGRAM_TYPES = ['deck', 'program', 'ice', 'black_ice', 'attack', 'defense', 'booster', 'utility', 'tracer'] as const satisfies readonly NetProgram['type'][];
const DANGER_LEVELS = ['low', 'medium', 'high', 'extreme'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isEffectRecord(value: unknown): value is Record<string, string | number | boolean> {
  return isRecord(value) && Object.values(value).every((item) => (
    typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
  ));
}

function isOneOf<T extends readonly string[]>(value: unknown, allowed: T): value is T[number] {
  return typeof value === 'string' && allowed.some((item) => item === value);
}

export function readArrayData<T>(value: unknown, guard: (item: unknown) => item is T): T[] {
  return Array.isArray(value) ? value.filter(guard) : [];
}

export function readNamedRecordValues<T>(
  value: unknown,
  key: string,
  guard: (item: unknown) => item is T
): T[] {
  if (!isRecord(value)) {
    return [];
  }

  const nested = value[key];
  if (!isRecord(nested)) {
    return [];
  }

  return Object.values(nested).filter(guard);
}

export function isCyberware(value: unknown): value is Cyberware {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    isOneOf(value.type, CYBERWARE_TYPES) &&
    typeof value.cost === 'number' &&
    (typeof value.hl === 'number' || typeof value.hl === 'string') &&
    isOneOf(value.slot, CYBERWARE_SLOTS) &&
    (value.effects === undefined || isEffectRecord(value.effects)) &&
    (value.incompatible === undefined || isStringArray(value.incompatible)) &&
    (value.isCustom === undefined || typeof value.isCustom === 'boolean')
  );
}

export function isWeapon(value: unknown): value is Weapon {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    isOneOf(value.type, WEAPON_TYPES) &&
    typeof value.damage === 'string' &&
    typeof value.rate_of_fire === 'number' &&
    isOneOf(value.concealability, CONCEALABILITY) &&
    typeof value.cost === 'number' &&
    typeof value.weight === 'number' &&
    isOneOf(value.availability, AVAILABILITY) &&
    (value.ammo === undefined || typeof value.ammo === 'string')
  );
}

export function isArmor(value: unknown): value is Armor {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    isOneOf(value.type, ARMOR_TYPES) &&
    typeof value.sp === 'number' &&
    Array.isArray(value.locations) &&
    value.locations.every((item) => isOneOf(item, ARMOR_LOCATIONS)) &&
    typeof value.cost === 'number' &&
    typeof value.weight === 'number' &&
    isOneOf(value.concealability, ARMOR_CONCEALABILITY) &&
    isOneOf(value.availability, AVAILABILITY) &&
    (value.requires_implant === undefined || typeof value.requires_implant === 'boolean')
  );
}

export function isGear(value: unknown): value is Gear {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    isOneOf(value.type, GEAR_TYPES) &&
    typeof value.cost === 'number' &&
    typeof value.weight === 'number' &&
    isOneOf(value.availability, AVAILABILITY) &&
    (value.effect === undefined || typeof value.effect === 'string') &&
    (value.side_effects === undefined || typeof value.side_effects === 'string') &&
    (value.damage === undefined || typeof value.damage === 'string') &&
    (value.single_use === undefined || typeof value.single_use === 'boolean') &&
    (value.charges === undefined || typeof value.charges === 'number')
  );
}

export function isNetProgram(value: unknown): value is NetProgram {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    isOneOf(value.type, NET_PROGRAM_TYPES) &&
    typeof value.cost === 'number' &&
    (value.level === undefined || typeof value.level === 'number') &&
    (value.strength === undefined || typeof value.strength === 'number') &&
    (value.speed === undefined || typeof value.speed === 'number') &&
    (value.effects === undefined || typeof value.effects === 'string' || isEffectRecord(value.effects)) &&
    (value.danger_level === undefined || isOneOf(value.danger_level, DANGER_LEVELS)) &&
    (value.requirement === undefined || typeof value.requirement === 'string')
  );
}

export function isCyberdeck(value: unknown): value is Cyberdeck {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    value.type === 'deck' &&
    typeof value.cost === 'number' &&
    typeof value.level === 'number' &&
    typeof value.ram === 'number' &&
    typeof value.mu === 'number' &&
    isEffectRecord(value.effects)
  );
}
