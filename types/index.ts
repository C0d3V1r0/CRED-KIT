// Основные типы для CP RED

// Базовая характеристика
export type StatKey = 'INT' | 'REF' | 'DEX' | 'TECH' | 'WILL' | 'COOL' | 'LUCK' | 'MOVE' | 'BODY' | 'EMP';

export type BaseStats = {
  [K in StatKey]: number;
};

export interface ResourceTrack {
  current: number;
  max: number;
}

export interface ArmorTrack {
  head: ResourceTrack;
  body: ResourceTrack;
}

export interface CustomCombatSkill {
  id: string;
  name: string;
  description: string;
  level: number;
}

// Тип эффекта импланта: "+1", "+2d6", true
export type EffectValue = string | number | boolean;

// Эффекты импланта
export type CyberwareEffects = {
  [key: string]: EffectValue;
};

// Слот импланта
export type CyberwareSlot =
  | 'head_eye' | 'head_ear' | 'head_brain' | 'head_other'
  | 'torso_organs' | 'torso_skeleton' | 'torso_skin'
  | 'arm_l_hand' | 'arm_l_forearm' | 'arm_r_hand' | 'arm_r_forearm'
  | 'leg_l_stamp' | 'leg_l_calf' | 'leg_r_stamp' | 'leg_r_calf';

// Тип импланта
export type CyberwareType = 'standard' | 'biotech' | 'blackChrome' | 'custom';

// Имплант из базы данных
export interface Cyberware {
  id: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  type: CyberwareType;
  cost: number;
  hl: number | string; // число или "2d6"
  slot: CyberwareSlot;
  effects?: CyberwareEffects;
  incompatible?: string[];
  // Для кастомных имплантов
  isCustom?: boolean;
  baseImplantId?: string; // id базового импланта
  modifications?: CyberwareModification[];
}

// Модификация для «Блэк Хром»
export interface CyberwareModification {
  id: string;
  name: string;
  cost: number;
  hl: number;
  effect: string;
}

// Кастомный контент пользователя
export interface CustomContent {
  cyberware: Cyberware[];
  weapons: Weapon[];
  armor: Armor[];
  programs: NetProgram[];
}

// Установленный имплант (с id из базы)
export interface InstalledCyberware extends Cyberware {
  installedAt: number; // timestamp
}

// Роль персонажа
export type Role = 'Nomad' | 'Solo' | 'Netrunner' | 'Tech' | 'Medtech' | 'Exec' | 'Lawman' | 'Fixer' | 'Media' | 'Rocker';

// Персонаж
export interface Character {
  id: string;
  name: string;
  role: Role;
  level: number;
  roleAbilityRank: number;
  stats: BaseStats;
  currentHP?: number; // legacy-поле для старых импортов
  health: ResourceTrack;
  humanity: ResourceTrack;
  armorState: ArmorTrack;
  cyberware: InstalledCyberware[];
  money: number;
  skills?: Record<string, number>;
  customCombatSkills: CustomCombatSkill[];
  weapons?: Weapon[];
  armor?: Armor[];
  gear?: Gear[];
}

// Производные характеристики
export interface DerivedStats {
  stats: BaseStats;
  baseStats: BaseStats;
  hp: number;
  maxHP: number;
  armorHead: number;
  maxArmorHead: number;
  armorBody: number;
  maxArmorBody: number;
  speed: number;
  interface: number;
  humanity: number;
  maxHumanity: number;
  totalHL: number;
  derangement: DerangementLevel;
  nextThreshold: ThresholdInfo;
  money: number;
  cyberwareEffects: CyberwareBonuses;
}

export interface CyberwareBonuses {
  stats: { [K in StatKey]: number };
  special: {
    interface: number;
    evasion: number;
    initiative: number;
  };
}

// Уровень расстройства личности
export type DerangementLevel =
  | { level: 'normal'; severity: 0 }
  | { level: 'mild_paranoia'; severity: 1 }
  | { level: 'paranoia'; severity: 2 }
  | { level: 'severe_paranoia'; severity: 3 }
  | { level: 'cyberpsychosis'; severity: 4 };

export interface ThresholdInfo {
  current: { value: number; label: string };
  next: { value: number; label: string } | null;
  toNext: number | null;
}

// Навыки
export interface SkillDefinition {
  stat: StatKey;
  label: string;
  category: string;
  multiplier?: 1 | 2;
}

export interface SkillCategory {
  label: string;
  labelEn?: string;
  color: string;
}

export interface SkillsData {
  skills: Record<string, SkillDefinition>;
  categories: Record<string, SkillCategory>;
}

// Программы для нетраннинга
export interface NetProgram {
  id: string;
  name: string;
  description: string;
  type: 'deck' | 'program' | 'ice' | 'black_ice' | 'attack' | 'defense' | 'booster' | 'utility' | 'tracer';
  cost: number;
  level?: number;
  strength?: number;
  speed?: number;
  effects?: {
    [key: string]: number | string;
  } | string;
  danger_level?: 'low' | 'medium' | 'high' | 'extreme';
  requirement?: string;
}

// Нейролинки (decks)
export interface Cyberdeck {
  id: string;
  name: string;
  description: string;
  type: 'deck';
  cost: number;
  level: number;
  ram: number;
  mu: number; // Module slots
  effects: {
    [key: string]: number | string;
  };
}

// Конфликты имплантов
export interface CyberwareConflict {
  implant: Cyberware;
  conflicts: Cyberware[];
}

export interface SlotLimitResult {
  valid: boolean;
  warnings: string[];
  zoneCounts: {
    head: number;
    torso: number;
    arms: number;
    legs: number;
  };
}

export interface CompatibilityResult {
  compatible: boolean;
  conflicts: string[];
}

// Установленная программа
export interface InstalledProgram extends NetProgram {
  installedAt: number;
}

// Нетраннинг персонажа
export interface NetrunnerLoadout {
  deck: NetProgram | null;
  programs: InstalledProgram[];
  totalRAM: number;
  usedRAM: number;
}

// Netrunner производные
export interface NetrunnerStats {
  interfaceLevel: number;
  atb: number; // Attack/Trace Bonus
  stealth: number;
  combat: number;
}

// Действие в сети
export interface NetAction {
  id: string;
  name: string;
  description: string;
  type: 'attack' | 'defense' | 'utility' | 'trace';
  cost: number; // в RAM
  damage?: number;
}

// ============ ТИПЫ СНАРЯЖЕНИЯ ============

// Оружие
export interface Weapon {
  id: string;
  name: string;
  description: string;
  type: 'pistol' | 'smg' | 'rifle' | 'shotgun' | 'melee';
  damage: string;
  rate_of_fire: number;
  concealability: 'easy' | 'medium' | 'hard';
  cost: number;
  weight: number;
  ammo?: string;
  availability: 'common' | 'uncommon' | 'rare';
}

// Броня
export interface Armor {
  id: string;
  name: string;
  description: string;
  type: 'clothing' | 'vest' | 'full' | 'helmet' | 'subdermal';
  sp: number;
  locations: ('head' | 'torso' | 'arms' | 'legs')[];
  cost: number;
  weight: number;
  concealability: 'easy' | 'medium' | 'hard' | 'always';
  availability: 'common' | 'uncommon' | 'rare';
  requires_implant?: boolean;
}

// Снаряжение (items)
export interface Gear {
  id: string;
  name: string;
  description: string;
  type: 'medical' | 'drug' | 'explosive' | 'gadget' | 'drone' | 'cyberware';
  effect?: string;
  side_effects?: string;
  damage?: string;
  cost: number;
  weight: number;
  single_use?: boolean;
  charges?: number;
  availability: 'common' | 'uncommon' | 'rare';
}

// Персонаж - снаряжение
export interface CharacterGear {
  weapons: Weapon[];
  armor: Armor[];
  gear: Gear[];
}

// Вес и стоимость
export interface GearStats {
  totalWeight: number;
  totalCost: number;
  armorHeadSP: number;
  armorBodySP: number;
  weaponCount: number;
}
