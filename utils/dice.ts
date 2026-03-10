// - утилиты для броска кубов CP RED

// - бросок одной кости
export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

// - бросок нескольких
export function rollDice(count: number, sides: number): number {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += rollDie(sides);
  }
  return total;
}

// - форматируем HL для отображения
export function formatHL(hl: number | string): string {
  if (typeof hl === 'number') return String(hl);
  if (typeof hl === 'string' && hl.includes('d')) {
    const [count, sides] = hl.split('d').map(Number);
    return `${hl} (ср. ${Math.ceil((count + sides) / 2)})`;
  }
  return String(hl);
}

// - форматируем деньги
export function formatMoney(amount: number): string {
  if (amount < 0) amount = 0;
  return new Intl.NumberFormat('ru-RU').format(amount) + ' eb';
}

// - эффекты киберware в читаемый вид
export function formatCyberwareEffects(
  effects: Record<string, number | string | boolean> | undefined
): string {
  if (!effects) return '';

  const effectLabels: Record<string, string> = {
    perception: 'восприятие',
    strength: 'сила',
    reflex: 'рефлексы',
    evasion: 'уклонение',
    dodge: 'манёвр',
    Athletics: 'атлетика',
    interface: 'интерфейс',
    initiative: 'инициатива',
    thermal_vision: 'тепловидение',
    resistance_poison: 'сопротивление ядам',
    hearing: 'слух'
  };

  return Object.entries(effects)
    .map(([key, value]) => `${value} ${effectLabels[key] || key}`)
    .join(', ');
}

// - уникальный ID
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
}

// - глубокое клонирование
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// - названия слотов (с указанием стороны для рук и ног)
const SLOT_NAMES: Record<string, { ru: string; en: string }> = {
  // Голова
  head_eye: { ru: 'Глаз', en: 'Eye' },
  head_ear: { ru: 'Ухо', en: 'Ear' },
  head_brain: { ru: 'Мозг', en: 'Brain' },
  head_other: { ru: 'Другое', en: 'Other' },
  // Торс
  torso_organs: { ru: 'Органы', en: 'Organs' },
  torso_skeleton: { ru: 'Скелет', en: 'Skeleton' },
  torso_skin: { ru: 'Кожа', en: 'Skin' },
  // Руки
  arm_l_hand: { ru: 'Кисть Л', en: 'Left hand' },
  arm_r_hand: { ru: 'Кисть П', en: 'Right hand' },
  arm_l_forearm: { ru: 'Предплечье Л', en: 'Left forearm' },
  arm_r_forearm: { ru: 'Предплечье П', en: 'Right forearm' },
  // Ноги
  leg_l_stamp: { ru: 'Стопа Л', en: 'Left foot' },
  leg_r_stamp: { ru: 'Стопа П', en: 'Right foot' },
  leg_l_calf: { ru: 'Голень Л', en: 'Left calf' },
  leg_r_calf: { ru: 'Голень П', en: 'Right calf' }
};

export function formatSlot(slot: string, locale: 'ru' | 'en' = 'ru'): string {
  return SLOT_NAMES[slot]?.[locale] || slot;
}

// - названия ролей
const ROLE_NAMES: Record<string, string> = {
  Nomad: 'Номад',
  Rocker: 'Рокер',
  Solo: 'Соло',
  Netrunner: 'Нетраннер',
  Tech: 'Техник',
  Medtech: 'Медтех',
  Media: 'Медиа',
  Exec: 'Экзекьютив',
  Lawman: 'Законник',
  Fixer: 'Фиксер'
};

export function formatRole(role: string): string {
  return ROLE_NAMES[role] || role;
}

const getDerangementThresholds = (maxHumanity: number) => [
  { min: Math.round(maxHumanity * 0.8), label: { ru: 'Нормальное', en: 'Normal' } },
  { min: Math.round(maxHumanity * 0.6), label: { ru: 'Лёгкая паранойя', en: 'Mild paranoia' } },
  { min: Math.round(maxHumanity * 0.4), label: { ru: 'Паранойя', en: 'Paranoia' } },
  { min: Math.round(maxHumanity * 0.2), label: { ru: 'Сильная паранойя', en: 'Severe paranoia' } },
  { min: 0, label: { ru: 'Киберпсихоз', en: 'Cyberpsychosis' } }
];

export function getDerangementLabel(
  humanity: number,
  locale: 'ru' | 'en' = 'ru',
  maxHumanity = 100
): string {
  const clamped = Math.max(0, Math.min(maxHumanity, humanity));
  const thresholds = getDerangementThresholds(maxHumanity);
  for (const threshold of thresholds) {
    if (clamped >= threshold.min) {
      return threshold.label[locale];
    }
  }
  return thresholds[thresholds.length - 1].label[locale];
}

// - цвет для индикатора человечности
export function getHumanityColorClass(humanity: number, maxHumanity = 100): string {
  if (humanity >= maxHumanity * 0.8) return 'text-cyber-green';
  if (humanity >= maxHumanity * 0.6) return 'text-cyber-yellow';
  if (humanity >= maxHumanity * 0.4) return 'text-cyber-orange';
  return 'text-cyber-accent';
}
