import { describe, it, expect } from 'vitest';
import {
  parseDamage,
  calculateGearStats,
  getWeaponsByType,
  getArmorByLocation,
  filterByAvailability,
  sortGear,
  getMeleeWeapons,
  getRangedWeapons,
  useMedicalItem,
  getWeaponTypes,
  getArmorTypes,
  getGearTypes
} from '@/logic/gear/gearCalculator';
import type { Weapon, Armor, Gear } from '@/types';

const makeWeapon = (overrides: Partial<Weapon> = {}): Weapon => ({
  id: `w_${Date.now()}`,
  name: 'Weapon',
  description: '',
  type: 'pistol',
  damage: '2d6',
  rate_of_fire: 1,
  concealability: 'medium',
  cost: 100,
  weight: 1,
  availability: 'common',
  ...overrides
});

const makeArmor = (overrides: Partial<Armor> = {}): Armor => ({
  id: `a_${Date.now()}`,
  name: 'Armor',
  description: '',
  type: 'vest',
  sp: 10,
  locations: ['torso'],
  cost: 200,
  weight: 2,
  concealability: 'medium',
  availability: 'common',
  ...overrides
});

const makeGear = (overrides: Partial<Gear> = {}): Gear => ({
  id: `g_${Date.now()}`,
  name: 'Gear',
  description: '',
  type: 'gadget',
  cost: 50,
  weight: 0.5,
  availability: 'common',
  ...overrides
});

describe('gearCalculator', () => {
  describe('parseDamage', () => {
    it('парсит "2d6"', () => expect(parseDamage('2d6')).toBe(7));
    it('парсит "1d10"', () => expect(parseDamage('1d10')).toBe(6));
    it('парсит числа', () => expect(parseDamage('5')).toBe(5));
    it('невалид -> 0', () => expect(parseDamage('invalid')).toBe(0));
  });

  describe('calculateGearStats', () => {
    it('суммарный вес', () => {
      const w: Weapon[] = [makeWeapon({ id: 'w1', name: 'P', weight: 1.5 })];
      const a: Armor[] = [makeArmor({ id: 'a1', name: 'V', weight: 3 })];
      expect(calculateGearStats(w, a, []).totalWeight).toBe(4.5);
    });
    it('суммарная стоимость', () => {
      const w: Weapon[] = [makeWeapon({ id: 'w1', name: 'P', cost: 100 })];
      const a: Armor[] = [makeArmor({ id: 'a1', name: 'V', cost: 200 })];
      expect(calculateGearStats(w, a, []).totalCost).toBe(300);
    });
    it('SP брони считает отдельно для головы и корпуса', () => {
      const a: Armor[] = [
        makeArmor({ id: 'a1', name: 'Helmet', type: 'helmet', sp: 7, locations: ['head'], cost: 50, weight: 1, concealability: 'easy' }),
        makeArmor({ id: 'a2', name: 'Body', type: 'vest', sp: 20, locations: ['torso', 'arms'], cost: 300, weight: 5, concealability: 'hard' })
      ];
      expect(calculateGearStats([], a, []).armorHeadSP).toBe(7);
      expect(calculateGearStats([], a, []).armorBodySP).toBe(20);
    });
    it('пустые массивы', () => {
      const s = calculateGearStats([], [], []);
      expect(s.totalWeight).toBe(0);
      expect(s.totalCost).toBe(0);
      expect(s.armorHeadSP).toBe(0);
      expect(s.armorBodySP).toBe(0);
      expect(s.weaponCount).toBe(0);
    });
  });

  describe('getWeaponsByType', () => {
    it('фильтр по типу', () => {
      const w: Weapon[] = [
        makeWeapon({ id: 'w1', name: 'P', type: 'pistol' }),
        makeWeapon({ id: 'w2', name: 'R', type: 'rifle', damage: '4d6', cost: 500, weight: 4 }),
        makeWeapon({ id: 'w3', name: 'S', type: 'smg', cost: 200, weight: 2 })
      ];
      expect(getWeaponsByType(w, 'pistol')).toHaveLength(1);
      expect(getWeaponsByType(w, 'pistol')[0].name).toBe('P');
    });
  });

  describe('getArmorByLocation', () => {
    it('фильтр по локации', () => {
      const a: Armor[] = [
        makeArmor({ id: 'a1', name: 'H', type: 'helmet', sp: 8, cost: 100, weight: 1, locations: ['head'] }),
        makeArmor({ id: 'a2', name: 'V', type: 'vest', sp: 15, cost: 200, weight: 3, locations: ['torso'], concealability: 'hard' }),
        makeArmor({ id: 'a3', name: 'F', type: 'full', sp: 20, cost: 500, weight: 8, locations: ['torso', 'arms', 'legs'], concealability: 'hard' })
      ];
      expect(getArmorByLocation(a, 'head')).toHaveLength(1);
      expect(getArmorByLocation(a, 'torso')).toHaveLength(2);
    });
  });

  describe('filterByAvailability', () => {
    it('все для пустого фильтра', () => {
      const items = [
        { id: '1', name: 'A', availability: 'common' as const },
        { id: '2', name: 'B', availability: 'rare' as const }
      ];
      expect(filterByAvailability(items, [])).toHaveLength(2);
    });
    it('фильтрует по редкости', () => {
      const items = [
        { id: '1', name: 'C', availability: 'common' as const },
        { id: '2', name: 'R', availability: 'rare' as const },
        { id: '3', name: 'E', availability: 'epic' as const }
      ];
      const r = filterByAvailability(items, ['common', 'rare']);
      expect(r).toHaveLength(2);
      expect(r.every(i => i.availability !== 'epic')).toBe(true);
    });
  });

  describe('sortGear', () => {
    it('по имени', () => {
      const items = [
        { id: '1', name: 'Z', cost: 100 },
        { id: '2', name: 'A', cost: 50 },
        { id: '3', name: 'B', cost: 75 }
      ];
      const s = sortGear(items, 'name');
      expect(s[0].name).toBe('A');
      expect(s[1].name).toBe('B');
      expect(s[2].name).toBe('Z');
    });
    it('по стоимости', () => {
      const items = [
        { id: '1', name: 'E', cost: 500 },
        { id: '2', name: 'C', cost: 50 },
        { id: '3', name: 'M', cost: 200 }
      ];
      const s = sortGear(items, 'cost');
      expect(s[0].cost).toBe(50);
      expect(s[1].cost).toBe(200);
      expect(s[2].cost).toBe(500);
    });
    it('по урону', () => {
      const items = [
        { id: '1', name: 'W', damage: '2d6', cost: 100 },
        { id: '2', name: 'S', damage: '4d6', cost: 300 }
      ];
      const s = sortGear(items, 'damage');
      expect(s[0].name).toBe('S');
    });
    it('по SP', () => {
      const items = [
        { id: '1', name: 'L', sp: 10, cost: 100 },
        { id: '2', name: 'H', sp: 25, cost: 400 }
      ];
      const s = sortGear(items, 'sp');
      expect(s[0].name).toBe('H');
    });
  });

  describe('getMeleeWeapons', () => {
    it('фильтрует melee', () => {
      const w: Weapon[] = [
        makeWeapon({ id: 'w1', name: 'K', type: 'melee', damage: '3d6', cost: 300, weight: 2 }),
        makeWeapon({ id: 'w2', name: 'P', type: 'pistol', damage: '2d6', cost: 100, weight: 1 }),
        makeWeapon({ id: 'w3', name: 'M', type: 'melee', damage: '4d6', cost: 500, weight: 1 })
      ];
      expect(getMeleeWeapons(w)).toHaveLength(2);
    });
  });

  describe('getRangedWeapons', () => {
    it('фильтрует ranged', () => {
      const w: Weapon[] = [
        makeWeapon({ id: 'w1', name: 'K', type: 'melee', damage: '3d6', cost: 300, weight: 2 }),
        makeWeapon({ id: 'w2', name: 'P', type: 'pistol', damage: '2d6', cost: 100, weight: 1 }),
        makeWeapon({ id: 'w3', name: 'R', type: 'rifle', damage: '4d6', cost: 500, weight: 4 })
      ];
      expect(getRangedWeapons(w)).toHaveLength(2);
    });
  });

  describe('useMedicalItem', () => {
    it('null для non-medical', () => {
      const item: Gear = makeGear({ id: '1', name: 'G', type: 'explosive' });
      expect(useMedicalItem(item)).toBeNull();
    });
    it('парсит HP из эффекта', () => {
      const item: Gear = makeGear({ id: '1', name: 'M', type: 'medical', effect: '+10 HP' });
      const r = useMedicalItem(item);
      expect(r).not.toBeNull();
      expect(r?.hpRestore).toBe(10);
    });
    it('null без HP в эффекте', () => {
      const item: Gear = makeGear({ id: '1', name: 'B', type: 'medical', effect: 'Heals wounds' });
      expect(useMedicalItem(item)).toBeNull();
    });
  });

  describe('getWeaponTypes', () => {
    it('все типы оружия', () => {
      const t = getWeaponTypes();
      expect(t).toHaveLength(5);
      expect(t.map(x => x.value)).toContain('pistol');
      expect(t.map(x => x.value)).toContain('smg');
      expect(t.map(x => x.value)).toContain('rifle');
      expect(t.map(x => x.value)).toContain('shotgun');
      expect(t.map(x => x.value)).toContain('melee');
    });
  });

  describe('getArmorTypes', () => {
    it('все типы брони', () => {
      const t = getArmorTypes();
      expect(t).toHaveLength(5);
      expect(t.map(x => x.value)).toContain('clothing');
      expect(t.map(x => x.value)).toContain('vest');
      expect(t.map(x => x.value)).toContain('full');
      expect(t.map(x => x.value)).toContain('helmet');
      expect(t.map(x => x.value)).toContain('subdermal');
    });
  });

  describe('getGearTypes', () => {
    it('все типы снаряжения', () => {
      const t = getGearTypes();
      expect(t).toHaveLength(5);
      expect(t.map(x => x.value)).toContain('medical');
      expect(t.map(x => x.value)).toContain('drug');
      expect(t.map(x => x.value)).toContain('explosive');
      expect(t.map(x => x.value)).toContain('gadget');
      expect(t.map(x => x.value)).toContain('drone');
    });
  });
});
