import type { Weapon, Armor, Gear, GearStats } from '@/types';

function getDamageValue(item: unknown): number {
  if (typeof item !== 'object' || item === null || !('damage' in item)) {
    return 0;
  }

  const damage = item.damage;
  return typeof damage === 'string' ? parseDamage(damage) : 0;
}

function getArmorSpValue(item: unknown): number {
  if (typeof item !== 'object' || item === null || !('sp' in item)) {
    return 0;
  }

  const sp = item.sp;
  return typeof sp === 'number' ? sp : 0;
}

// - парсим урон: "2d6" -> 7 (среднее), "10" -> 10
export function parseDamage(damage: string): number {
  if (!damage) return 0;

  const diceMatch = damage.trim().match(/^(\d+)d(\d+)$/i);
  if (diceMatch) {
    const count = Number(diceMatch[1]);
    const sides = Number(diceMatch[2]);
    if (!Number.isFinite(count) || !Number.isFinite(sides) || count <= 0 || sides <= 0) {
      return 0;
    }
    // - среднее значение NdM = N * (M + 1) / 2
    return Math.ceil((count * (sides + 1)) / 2);
  }

  const parsed = Number(damage);
  return Number.isFinite(parsed) ? parsed : 0;
}

// - считаем статистику снаряжения
export function calculateGearStats(
  weapons: Weapon[],
  armor: Armor[],
  items: Gear[]
): GearStats {
  const allItems = [...weapons, ...armor, ...items];
  const totalWeight = allItems.reduce((sum, item) => sum + (item.weight || 0), 0);
  const totalCost = allItems.reduce((sum, item) => sum + item.cost, 0);
  let armorHeadSP = 0;
  let armorBodySP = 0;

  // Один проход по броне дешевле, чем 2 filter + 2 map при каждом рендере.
  for (const item of armor) {
    if (item.locations.includes('head')) {
      armorHeadSP = Math.max(armorHeadSP, item.sp);
    }

    if (item.locations.some((location) => location !== 'head')) {
      armorBodySP = Math.max(armorBodySP, item.sp);
    }
  }

  return {
    totalWeight: Math.round(totalWeight * 10) / 10,
    totalCost,
    armorHeadSP,
    armorBodySP,
    weaponCount: weapons.length
  };
}

// - оружие по типу
export function getWeaponsByType(
  weapons: Weapon[],
  type: Weapon['type']
): Weapon[] {
  return weapons.filter(w => w.type === type);
}

// - броня по части тела
export function getArmorByLocation(
  armor: Armor[],
  location: 'head' | 'torso' | 'arms' | 'legs'
): Armor[] {
  return armor.filter(a => a.locations.includes(location));
}

// - фильтр по редкости
export function filterByAvailability<T extends { availability: string }>(
  items: T[],
  availability: T['availability'][]
): T[] {
  if (availability.length === 0) return items;
  return items.filter(item => availability.includes(item.availability));
}

// - сортировка
export function sortGear<T extends { cost: number; name: string }>(
  items: T[],
  sortBy: 'name' | 'cost' | 'damage' | 'sp'
): T[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'cost':
        return a.cost - b.cost;
      case 'damage':
        return getDamageValue(b) - getDamageValue(a);
      case 'sp':
        return getArmorSpValue(b) - getArmorSpValue(a);
      default:
        return 0;
    }
  });
}

// - только холодное оружие
export function getMeleeWeapons(weapons: Weapon[]): Weapon[] {
  return weapons.filter(w => w.type === 'melee');
}

// - только огнестрел
export function getRangedWeapons(weapons: Weapon[]): Weapon[] {
  return weapons.filter(w => w.type !== 'melee');
}

// - использование медицинки
export function useMedicalItem(
  item: Gear
): { hpRestore: number; message: string } | null {
  if (item.type !== 'medical') return null;

  const hpMatch = item.effect?.match(/\+(\d+) HP/);
  if (!hpMatch) return null;

  const hpAmount = Number(hpMatch[1]);

  return {
    hpRestore: hpAmount,
    message: `Использована ${item.name}. Восстановлено ${hpAmount} HP.`
  };
}

// - типы оружия
export function getWeaponTypes(): { value: Weapon['type']; label: string }[] {
  return [
    { value: 'pistol', label: 'Пистолеты' },
    { value: 'smg', label: 'Пистолеты-пулемёты' },
    { value: 'rifle', label: 'Винтовки' },
    { value: 'shotgun', label: 'Дробовики' },
    { value: 'melee', label: 'Холодное оружие' }
  ];
}

// - типы брони
export function getArmorTypes(): { value: Armor['type']; label: string }[] {
  return [
    { value: 'clothing', label: 'Одежда' },
    { value: 'vest', label: 'Жилеты' },
    { value: 'full', label: 'Полные костюмы' },
    { value: 'helmet', label: 'Шлемы' },
    { value: 'subdermal', label: 'Импланты' }
  ];
}

// - типы снаряжения
export function getGearTypes(): { value: Gear['type']; label: string }[] {
  return [
    { value: 'medical', label: 'Медицина' },
    { value: 'drug', label: 'Препараты' },
    { value: 'explosive', label: 'Взрывчатка' },
    { value: 'gadget', label: 'Гаджеты' },
    { value: 'drone', label: 'Дроны' }
  ];
}
