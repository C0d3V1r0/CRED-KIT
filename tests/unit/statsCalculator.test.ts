import { describe, it, expect } from 'vitest';
import {
  parseHL,
  parseEffect,
  calculateCyberwareEffects,
  applyCyberwareToStats,
  calculateHP,
  calculateSpeed,
  calculateInterface,
  calculateHumanity,
  calculateMaxHumanity,
  calculateTotalHL,
  calculateSkillBonuses,
  getDerangementLevel,
  getNextThreshold,
  calculateSkillModifier,
  validateStats,
  calculateDerivedStats
} from '@/logic/character/statsCalculator';
import type { BaseStats, InstalledCyberware } from '@/types';

const makeCyberware = (overrides: Partial<InstalledCyberware> = {}): InstalledCyberware => ({
  id: `cw_${Date.now()}`,
  name: 'Implant',
  description: '',
  type: 'custom',
  cost: 100,
  hl: 0,
  slot: 'head_other',
  installedAt: Date.now(),
  ...overrides
});

describe('statsCalculator', () => {
  describe('parseHL', () => {
    it('парсит число напрямую', () => expect(parseHL(5)).toBe(5));
    it('парсит "2d6" в среднее', () => expect(parseHL('2d6')).toBe(7));
    it('парсит "1d10"', () => expect(parseHL('1d10')).toBe(6));
    it('возвращает 0 для неизвестного формата', () => expect(parseHL('invalid')).toBe(0));
  });

  describe('parseEffect', () => {
    it('парсит числа', () => expect(parseEffect(5)).toBe(5));
    it('возвращает 0 для boolean', () => expect(parseEffect(true)).toBe(0));
    it('парсит "+2"', () => expect(parseEffect('+2')).toBe(2));
    it('парсит "-1"', () => expect(parseEffect('-1')).toBe(-1));
    it('парсит "2d6"', () => expect(parseEffect('2d6')).toBe(7));
  });

  describe('calculateCyberwareEffects', () => {
    it('нулевые бонусы для пустого массива', () => {
      const r = calculateCyberwareEffects([]);
      expect(r.stats.REF).toBe(0);
      expect(r.special.interface).toBe(0);
    });

    it('считает бонусы статов', () => {
      const cyberware: InstalledCyberware[] = [
        makeCyberware({ effects: { REF: '+1', DEX: '+2' }, hl: '2d6' })
      ];
      const r = calculateCyberwareEffects(cyberware);
      expect(r.stats.REF).toBe(1);
      expect(r.stats.DEX).toBe(2);
    });

    it('суммирует бонусы нескольких имплантов', () => {
      const cyberware: InstalledCyberware[] = [
        makeCyberware({ id: '1', effects: { INT: '+1' } }),
        makeCyberware({ id: '2', effects: { INT: '+2' } })
      ];
      expect(calculateCyberwareEffects(cyberware).stats.INT).toBe(3);
    });
  });

  describe('applyCyberwareToStats', () => {
    const baseStats: BaseStats = {
      INT: 5, REF: 6, DEX: 5, TECH: 4, WILL: 5, COOL: 5, LUCK: 5, MOVE: 5, BODY: 5, EMP: 5
    };

    it('применяет бонусы в пределах лимита', () => {
      const cyberware: InstalledCyberware[] = [makeCyberware({ effects: { REF: '+3' }, hl: '2d6' })];
      const r = applyCyberwareToStats(baseStats, cyberware);
      expect(r.REF).toBe(9);
    });

    it('не обрезает усиленные статы сверху', () => {
      const cyberware: InstalledCyberware[] = [makeCyberware({ effects: { REF: '+5' }, hl: '2d6' })];
      expect(applyCyberwareToStats(baseStats, cyberware).REF).toBe(11);
    });

    it('обрезает до 2', () => {
      const cyberware: InstalledCyberware[] = [makeCyberware({ effects: { REF: '-10' }, hl: '1d6' })];
      expect(applyCyberwareToStats(baseStats, cyberware).REF).toBe(2);
    });
  });

  describe('calculateHP', () => {
    it('HP = (WILL + BODY) * 5', () => {
      const s: BaseStats = { INT: 5, REF: 6, DEX: 5, TECH: 4, WILL: 5, COOL: 5, LUCK: 5, MOVE: 5, BODY: 8, EMP: 5 };
      expect(calculateHP(s)).toBe(65);
    });
  });

  describe('calculateSpeed', () => {
    it('Speed = MOVE * 5', () => {
      const s: BaseStats = { INT: 5, REF: 6, DEX: 5, TECH: 4, WILL: 5, COOL: 5, LUCK: 5, MOVE: 6, BODY: 5, EMP: 5 };
      expect(calculateSpeed(s)).toBe(30);
    });
  });

  describe('calculateInterface', () => {
    it('базовый интерфейс', () => expect(calculateInterface(1, [])).toBe(1));
    it('добавляет бонусы киберware', () => {
      const cyberware: InstalledCyberware[] = [makeCyberware({ effects: { interface: '+2' } })];
      expect(calculateInterface(1, cyberware)).toBe(3);
    });
    it('минимум 1', () => {
      const cyberware: InstalledCyberware[] = [makeCyberware({ effects: { interface: '-5' }, hl: '2d6' })];
      expect(calculateInterface(1, cyberware)).toBe(1);
    });
  });

  describe('calculateHumanity', () => {
    it('стартовая человечность зависит от EMP', () => {
      const h = calculateHumanity(5, []);
      expect(h).toBe(50);
    });

    it('человечность уменьшается на сумму HL', () => {
      const h = calculateHumanity(5, [makeCyberware({ hl: 15 })]);
      expect(h).toBe(35);
    });

    it('текущая человечность с дайсами', () => {
      const cyberware: InstalledCyberware[] = [makeCyberware({ hl: '2d6' }), makeCyberware({ id: '2', hl: '1d6' })];
      const h = calculateHumanity(10, cyberware);
      expect(h).toBeLessThanOrEqual(100);
    });
    it('минимум 0', () => {
      expect(calculateHumanity(10, [makeCyberware({ hl: 200 })])).toBe(0);
    });
  });

  describe('calculateMaxHumanity', () => {
    it('max humanity = EMP * 10', () => {
      expect(calculateMaxHumanity(5)).toBe(50);
      expect(calculateMaxHumanity(8)).toBe(80);
    });
  });

  describe('calculateTotalHL', () => {
    it('сумма всех HL', () => {
      const cyberware: InstalledCyberware[] = [makeCyberware({ hl: '2d6' }), makeCyberware({ id: '2', hl: '1d6' })];
      expect(calculateTotalHL(cyberware)).toBeGreaterThan(0);
    });
    it('0 для пустого', () => expect(calculateTotalHL([])).toBe(0));
  });

  describe('calculateSkillBonuses', () => {
    it('нормализует и суммирует бонусы навыков от имплантов', () => {
      const bonuses = calculateSkillBonuses([
        makeCyberware({ effects: { evasion: '+2', perception: '+1' } }),
        makeCyberware({ id: '2', effects: { dodge: '+1', Athletics: '+3' } })
      ]);

      expect(bonuses.Evasion).toBe(3);
      expect(bonuses.Perception).toBe(1);
      expect(bonuses.Athletics).toBe(3);
    });
  });

  describe('getDerangementLevel', () => {
    it('норма на верхнем пороге', () => expect(getDerangementLevel(50, 50).level).toBe('normal'));
    it('лёгкая паранойя после 60% max', () => expect(getDerangementLevel(30, 50).level).toBe('mild_paranoia'));
    it('паранойя после 40% max', () => expect(getDerangementLevel(20, 50).level).toBe('paranoia'));
    it('сильная паранойя после 20% max', () => expect(getDerangementLevel(10, 50).level).toBe('severe_paranoia'));
    it('киберпсихоз у нуля', () => expect(getDerangementLevel(0, 50).level).toBe('cyberpsychosis'));
  });

  describe('getNextThreshold', () => {
    it('возвращает текущий порог', () => {
      const r = getNextThreshold(35, 50);
      expect(r.current.value).toBe(30);
      expect(r.next?.value).toBe(20);
    });
    it('минимум - next null', () => {
      const r = getNextThreshold(5, 50);
      expect(r.current.value).toBe(0);
      expect(r.next).toBeNull();
    });
  });

  describe('calculateSkillModifier', () => {
    it('stat + level', () => expect(calculateSkillModifier(5, 4)).toBe(9));
    it('base case', () => expect(calculateSkillModifier(2, 0)).toBe(2));
  });

  describe('validateStats', () => {
    it('валидные статы', () => {
      const s: BaseStats = { INT: 5, REF: 6, DEX: 5, TECH: 4, WILL: 5, COOL: 5, LUCK: 5, MOVE: 5, BODY: 5, EMP: 5 };
      expect(validateStats(s).valid).toBe(true);
    });
    it('ошибки при выходе за границы', () => {
      const s: BaseStats = { INT: 5, REF: 1, DEX: 5, TECH: 4, WILL: 5, COOL: 5, LUCK: 5, MOVE: 5, BODY: 5, EMP: 5 };
      expect(validateStats(s).valid).toBe(false);
    });
  });

  describe('calculateDerivedStats', () => {
    const stats: BaseStats = { INT: 5, REF: 6, DEX: 5, TECH: 4, WILL: 5, COOL: 5, LUCK: 5, MOVE: 5, BODY: 8, EMP: 10 };

    it('все производные', () => {
      const r = calculateDerivedStats(stats, []);
      expect(r.stats).toEqual(stats);
      expect(r.hp).toBe(65);
      expect(r.maxHP).toBe(65);
      expect(r.maxHumanity).toBe(100);
      expect(r.maxArmorHead).toBe(0);
      expect(r.maxArmorBody).toBe(0);
      expect(r.derangement.level).toBe('normal');
    });

    it('применяет киберware', () => {
      const cyberware: InstalledCyberware[] = [makeCyberware({ effects: { REF: '+2' }, hl: '2d6' })];
      expect(calculateDerivedStats(stats, cyberware).stats.REF).toBe(8);
    });

    it('состояние для стандартного старта без хрома — нормальное', () => {
      const starterStats: BaseStats = { INT: 5, REF: 6, DEX: 5, TECH: 4, WILL: 5, COOL: 5, LUCK: 5, MOVE: 5, BODY: 5, EMP: 5 };
      const r = calculateDerivedStats(starterStats, []);
      expect(r.humanity).toBe(50);
      expect(r.maxHumanity).toBe(50);
      expect(r.derangement.level).toBe('normal');
    });

    it('использует ручные ресурсы вместо формул как источник истины', () => {
      const r = calculateDerivedStats(stats, [], 0, 1, {
        health: { current: 22, max: 80 },
        humanity: { current: 64, max: 90 },
        armor: {
          head: { current: 4, max: 7 },
          body: { current: 8, max: 11 }
        }
      });

      expect(r.hp).toBe(22);
      expect(r.maxHP).toBe(80);
      expect(r.humanity).toBe(64);
      expect(r.maxHumanity).toBe(90);
      expect(r.armorHead).toBe(4);
      expect(r.maxArmorHead).toBe(7);
      expect(r.armorBody).toBe(8);
      expect(r.maxArmorBody).toBe(11);
    });
  });
});
