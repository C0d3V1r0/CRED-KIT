import type { ArmorTrack, BaseStats, InstalledCyberware, DerivedStats, CyberwareBonuses, DerangementLevel, ResourceTrack } from '@/types';

// Центральный калькулятор производных статов CP RED.
// Важно: вся "математика" по HP, человечности, эффектам имплантов и т.п.
// живёт здесь, чтобы React‑компоненты оставались максимально тупыми и предсказуемыми.

// - константы CP RED
const MIN_STAT_VALUE = 2;
const HP_MULTIPLIER = 5;
const MIN_INTERFACE = 1;

// - парсим HL - может быть числом или "2d6"
//   Здесь берём не реальный бросок, а математическое ожидание,
//   чтобы UI и derived‑метрики были стабильными между сессиями.
export function parseHL(hl: number | string): number {
  if (typeof hl === 'number') return hl;
  if (typeof hl === 'string') {
    const diceMatch = hl.trim().match(/^(\d+)d(\d+)$/i);
    if (!diceMatch) return 0;
    const count = Number(diceMatch[1]);
    const sides = Number(diceMatch[2]);
    if (!Number.isFinite(count) || !Number.isFinite(sides) || count <= 0 || sides <= 0) {
      return 0;
    }
    // - среднее значение NdM = N * (M + 1) / 2
    return Math.ceil((count * (sides + 1)) / 2);
  }
  return 0;
}

// - парсим эффект +5, -3, 2d6 -> в число
//   Используется и для статов, и для спецэффектов имплантов.
export function parseEffect(effect: string | number | boolean): number {
  if (typeof effect === 'number') return effect;
  if (typeof effect === 'boolean') return 0;

  const match = effect.match(/^([+-]?\d+)$/);
  if (match) return parseInt(match[1], 10);

  const diceMatch = effect.match(/^([+-]?\d+)d(\d+)$/);
  if (diceMatch) {
    const count = parseInt(diceMatch[1]);
    const sides = parseInt(diceMatch[2]);
    // - среднее значение NdM = N * (M + 1) / 2
    return Math.ceil((count * (sides + 1)) / 2);
  }

  return 0;
}

// - маппинг ключей эффектов -> статы
const EFFECT_TO_STAT: Record<string, keyof BaseStats> = {
  REF: 'REF',
  DEX: 'DEX',
  INT: 'INT',
  TECH: 'TECH',
  WILL: 'WILL',
  COOL: 'COOL',
  BODY: 'BODY',
  MOVE: 'MOVE',
  EMP: 'EMP',
  reflex: 'REF',
  dexterity: 'DEX',
  intelligence: 'INT',
  technical: 'TECH',
  willpower: 'WILL',
  charisma: 'COOL',
  cool: 'COOL',
  strength: 'BODY',
  movement: 'MOVE',
  empathy: 'EMP',
  // - эффекты из имплантов
  Athletics: 'DEX',
  Brawling: 'REF',
  perception: 'INT'
};

// - эффекты навыков от имплантов (будут добавлены к уровню навыка)
const SKILL_BONUSES: Record<string, string> = {
  Athletics: 'Athletics',
  Brawling: 'Brawling',
  BrawlingDamage: 'Brawling',
  Dodge: 'Evasion',
  dodge: 'Evasion',
  Evasion: 'Evasion',
  evasion: 'Evasion',
  Perception: 'Perception',
  perception: 'Perception',
  human_perception: 'Human Perception'
};

// - специальные эффекты имплантов (не статы)
const SPECIAL_EFFECTS: Record<string, string> = {
  thermal_vision: 'thermal_vision',
  hearing: 'hearing',
  resistance_poison: 'resistance_poison'
};

// - суммарные бонусы от всех установленных киберware
//   Функция считается "источником правды" по влиянию хрома на статы:
//   любые новые типы эффектов лучше учить именно здесь.
export function calculateCyberwareEffects(
  cyberware: InstalledCyberware[]
): CyberwareBonuses {
  const bonuses: CyberwareBonuses = {
    stats: { INT: 0, REF: 0, DEX: 0, TECH: 0, WILL: 0, COOL: 0, LUCK: 0, MOVE: 0, BODY: 0, EMP: 0 },
    special: { interface: 0, evasion: 0, initiative: 0 }
  };

  for (const implant of cyberware) {
    if (!implant.effects) continue;

    for (const [key, value] of Object.entries(implant.effects)) {
      if (typeof value === 'boolean') continue;

      // Пропускаем эффекты навыков - они обрабатываются отдельно
      if (SKILL_BONUSES[key]) continue;

      if (key in bonuses.stats) {
        bonuses.stats[key as keyof typeof bonuses.stats] += parseEffect(value);
      } else {
        const statKey = EFFECT_TO_STAT[key];
        if (statKey && statKey in bonuses.stats) {
          bonuses.stats[statKey as keyof typeof bonuses.stats] += parseEffect(value);
        } else if (key in bonuses.special) {
          bonuses.special[key as keyof typeof bonuses.special] += parseEffect(value);
        }
      }
    }
  }

  return bonuses;
}

// - бонусы к навыкам от имплантов
export function calculateSkillBonuses(cyberware: InstalledCyberware[]): Record<string, number> {
  const bonuses: Record<string, number> = {};

  for (const implant of cyberware) {
    if (!implant.effects) continue;

    for (const [key, value] of Object.entries(implant.effects)) {
      if (typeof value === 'boolean') continue;

      if (SKILL_BONUSES[key]) {
        bonuses[SKILL_BONUSES[key]] = (bonuses[SKILL_BONUSES[key]] || 0) + parseEffect(value);
      }
    }
  }

  return bonuses;
}

// - специальные эффекты имплантов
export function calculateSpecialEffects(cyberware: InstalledCyberware[]): Record<string, boolean> {
  const effects: Record<string, boolean> = {};

  for (const implant of cyberware) {
    if (!implant.effects) continue;

    for (const [key, value] of Object.entries(implant.effects)) {
      if (typeof value === 'boolean' && SPECIAL_EFFECTS[key]) {
        effects[key] = true;
      }
    }
  }

  return effects;
}

// - применяем бонусы киберware к статам (2-10)
export function applyCyberwareToStats(
  baseStats: BaseStats,
  cyberware: InstalledCyberware[]
): BaseStats {
  const bonuses = calculateCyberwareEffects(cyberware);
  const result: BaseStats = { ...baseStats };

  for (const stat of Object.keys(result) as Array<keyof BaseStats>) {
    if (bonuses.stats[stat] !== undefined) {
      const newValue = result[stat] + bonuses.stats[stat];
      result[stat] = Math.max(MIN_STAT_VALUE, newValue);
    }
  }

  return result;
}

// - HP по ТЗ: (BODY + WILL) * 5
//   Если захочется прикрутить хаусрулы по живучести — менять формулу лучше
//   здесь, чтобы не ломать тесты и не размазывать правки по UI.
export function calculateHP(stats: BaseStats): number {
  return (stats.BODY + stats.WILL) * HP_MULTIPLIER;
}

// - скорость: каждое значение MOVE даёт 5 единиц скорости
export function calculateSpeed(stats: BaseStats): number {
  return stats.MOVE * 5;
}

// - интерфейс с бонусами
export function calculateInterface(
  baseInterface: number,
  cyberware: InstalledCyberware[]
): number {
  const bonus = calculateCyberwareEffects(cyberware).special.interface;
  return Math.max(MIN_INTERFACE, baseInterface + bonus);
}

export function calculateMaxHumanity(baseEMP: number): number {
  return Math.max(0, baseEMP * 10);
}

// - оставшаяся человечность
// Базовая человечность зависит от EMP, поэтому fallback-формула тоже должна
// опираться на EMP, а не на фиксированные 100.
export function calculateHumanity(
  baseEMP: number,
  cyberware: InstalledCyberware[]
): number {
  const totalHL = calculateTotalHL(cyberware);
  return Math.max(0, calculateMaxHumanity(baseEMP) - totalHL);
}

// - суммарная потеря человечности
//   Отдельная функция, чтобы можно было быстро менять механику HL
//   (например, для альтернативных сеттингов) без правок по всему коду.
export function calculateTotalHL(cyberware: InstalledCyberware[]): number {
  return cyberware.reduce((sum, implant) => sum + parseHL(implant.hl), 0);
}

function getHumanityThresholdValues(maxHumanity: number) {
  return {
    normal: Math.round(maxHumanity * 0.8),
    mild: Math.round(maxHumanity * 0.6),
    paranoia: Math.round(maxHumanity * 0.4),
    severe: Math.round(maxHumanity * 0.2)
  };
}

// - уровень расстройства на основе человечности
//   Здесь держим "ступени" состояния, чтобы UI опирался на готовые ярлыки,
//   а не пытался сам интерпретировать сырое число человечности.
export function getDerangementLevel(
  currentHumanity: number,
  maxHumanity = 100
): DerangementLevel {
  const thresholds = getHumanityThresholdValues(maxHumanity);

  if (currentHumanity >= thresholds.normal) return { level: 'normal', severity: 0 };
  if (currentHumanity >= thresholds.mild) return { level: 'mild_paranoia', severity: 1 };
  if (currentHumanity >= thresholds.paranoia) return { level: 'paranoia', severity: 2 };
  if (currentHumanity >= thresholds.severe) return { level: 'severe_paranoia', severity: 3 };
  return { level: 'cyberpsychosis', severity: 4 };
}

// - следующий порог расстройства
//   UI использует это, чтобы показывать игроку "на сколько ты в безопасности"
//   до следующего ухудшения состояния, без повторения логики порогов.
export function getNextThreshold(currentHumanity: number, maxHumanity = 100) {
  const scaled = getHumanityThresholdValues(maxHumanity);
  const thresholds = [
    { value: scaled.normal, label: 'Норма' },
    { value: scaled.mild, label: 'Лёгкая паранойя' },
    { value: scaled.paranoia, label: 'Паранойя' },
    { value: scaled.severe, label: 'Сильная паранойя' },
    { value: 0, label: 'Киберпсихоз' }
  ];

  for (let i = 0; i < thresholds.length - 1; i++) {
    if (currentHumanity > thresholds[i].value) {
      return {
        current: thresholds[i],
        next: thresholds[i + 1],
        toNext: currentHumanity - thresholds[i + 1].value
      };
    }
  }

  return {
    current: thresholds[thresholds.length - 1],
    next: null,
    toNext: null
  };
}

// - модификатор навыка: стат + уровень
export function calculateSkillModifier(
  statValue: number,
  skillLevel: number
): number {
  return statValue + skillLevel;
}

// - валидация статов
//   Используем в тестах и при импорте, чтобы не допустить статы вне диапазона CP RED.
export function validateStats(
  stats: BaseStats
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [stat, value] of Object.entries(stats)) {
    if (value < MIN_STAT_VALUE) {
      errors.push(`${stat} must be >= ${MIN_STAT_VALUE}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function normalizeResourceTrack(track: ResourceTrack | undefined, fallbackMax: number): ResourceTrack {
  if (!track) {
    return {
      current: fallbackMax,
      max: fallbackMax
    };
  }

  const safeMax = Math.max(0, track.max);
  const safeCurrent = Math.max(0, Math.min(track.current, safeMax));

  return {
    current: safeCurrent,
    max: safeMax
  };
}

function normalizeArmorTrack(track: ArmorTrack | undefined): ArmorTrack {
  return {
    head: normalizeResourceTrack(track?.head, 0),
    body: normalizeResourceTrack(track?.body, 0)
  };
}

// - всё и сразу
//   Главная точка входа для UI: собирает в один объект все derived‑значения,
//   чтобы компоненты не знали ничего о формулах и ограничениях системы.
export function calculateDerivedStats(
  stats: BaseStats,
  cyberware: InstalledCyberware[],
  money = 0,
  baseInterface = 1,
  resources?: {
    health?: ResourceTrack;
    humanity?: ResourceTrack;
    armor?: ArmorTrack;
  }
): DerivedStats {
  const totalHL = calculateTotalHL(cyberware);
  const formulaMaxHumanity = calculateMaxHumanity(stats.EMP);
  const formulaHumanity = calculateHumanity(stats.EMP, cyberware);
  const formulaHP = calculateHP(stats);
  const healthTrack = normalizeResourceTrack(resources?.health, formulaHP);
  const humanityTrack = normalizeResourceTrack(resources?.humanity, formulaMaxHumanity);
  const armorTrack = normalizeArmorTrack(resources?.armor);

  return {
    stats: applyCyberwareToStats(stats, cyberware),
    baseStats: stats,
    hp: healthTrack.current,
    maxHP: healthTrack.max,
    armorHead: armorTrack.head.current,
    maxArmorHead: armorTrack.head.max,
    armorBody: armorTrack.body.current,
    maxArmorBody: armorTrack.body.max,
    speed: calculateSpeed(stats),
    interface: calculateInterface(baseInterface, cyberware),
    humanity: resources?.humanity ? humanityTrack.current : formulaHumanity,
    maxHumanity: humanityTrack.max,
    totalHL,
    derangement: getDerangementLevel(resources?.humanity ? humanityTrack.current : formulaHumanity, humanityTrack.max),
    nextThreshold: getNextThreshold(resources?.humanity ? humanityTrack.current : formulaHumanity, humanityTrack.max),
    money,
    cyberwareEffects: calculateCyberwareEffects(cyberware)
  };
}
