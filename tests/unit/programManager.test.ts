import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addProgramToDeck,
  removeProgramFromDeck,
  getDeckStats,
  filterPrograms,
  filterICE,
  rollPrograms,
  resolveProgramIce
} from '@/logic/netrunning/programManager';
import type { NetProgram } from '@/types';

function makeProgram(overrides: Partial<NetProgram> = {}): NetProgram {
  return {
    id: 'program_base',
    name: 'Program Base',
    description: 'Base description',
    type: 'attack',
    cost: 100,
    strength: 2,
    ...overrides
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('programManager', () => {
  it('addProgramToDeck: добавляет программу и не дублирует/не превышает лимит', () => {
    const p1 = makeProgram({ id: 'p1' });
    const p2 = makeProgram({ id: 'p2' });
    const deck = addProgramToDeck([], p1, 2);

    expect(deck).toHaveLength(1);
    expect(addProgramToDeck(deck, p1, 2)).toHaveLength(1);
    expect(addProgramToDeck(addProgramToDeck(deck, p2, 2), makeProgram({ id: 'p3' }), 2)).toHaveLength(2);
  });

  it('removeProgramFromDeck: удаляет программу по id', () => {
    const deck = [makeProgram({ id: 'p1' }), makeProgram({ id: 'p2' })];
    const nextDeck = removeProgramFromDeck(deck, 'p1');
    expect(nextDeck).toHaveLength(1);
    expect(nextDeck[0].id).toBe('p2');
  });

  it('getDeckStats: считает агрегаты и группировку по типам', () => {
    const deck = [
      makeProgram({ id: 'a1', type: 'attack', strength: 3, cost: 120 }),
      makeProgram({ id: 'd1', type: 'defense', strength: 2, cost: 80 }),
      makeProgram({ id: 'a2', type: 'attack', strength: 5, cost: 200 })
    ];
    const stats = getDeckStats(deck);
    expect(stats.count).toBe(3);
    expect(stats.byType.attack).toBe(2);
    expect(stats.byType.defense).toBe(1);
    expect(stats.totalStrength).toBe(10);
    expect(stats.totalCost).toBe(400);
  });

  it('filterPrograms: фильтрует по типу и поиску', () => {
    const programs = [
      makeProgram({ id: 'p1', name: 'Sword', description: 'Attack blade', type: 'attack' }),
      makeProgram({ id: 'p2', name: 'Shield', description: 'Defense wall', type: 'defense' })
    ];

    expect(filterPrograms(programs, 'attack', '')).toHaveLength(1);
    expect(filterPrograms(programs, 'all', 'shield')).toHaveLength(1);
    expect(filterPrograms(programs, 'defense', 'blade')).toHaveLength(0);
  });

  it('filterICE: фильтрует по типу, danger и поиску', () => {
    const ice = [
      makeProgram({ id: 'i1', name: 'Kraken', type: 'ice', danger_level: 'high' }),
      makeProgram({ id: 'i2', name: 'Wall', type: 'ice', danger_level: 'low' })
    ];

    expect(filterICE(ice, 'ice', 'all', '')).toHaveLength(2);
    expect(filterICE(ice, 'ice', 'high', '')).toHaveLength(1);
    expect(filterICE(ice, 'all', 'low', 'wall')).toHaveLength(1);
    expect(filterICE(ice, 'all', 'extreme', '')).toHaveLength(0);
  });

  it('rollPrograms: возвращает массив d10 в диапазоне 1..10', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.999);

    const rolls = rollPrograms(3);
    expect(rolls).toEqual([1, 6, 10]);
  });

  it('resolveProgramIce: считает исход, тоталы и уроны', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.9) // program roll -> 10
      .mockReturnValueOnce(0.1); // ice roll -> 2

    const result = resolveProgramIce(
      makeProgram({ id: 'p1', name: 'Sword', strength: 1 }),
      makeProgram({ id: 'i1', name: 'Wall', type: 'ice', strength: 1 })
    );

    expect(result.programTotal).toBe(10);
    expect(result.iceTotal).toBe(2);
    expect(result.programWins).toBe(true);
    expect(result.programDamage).toBe(8);
    expect(result.iceDamage).toBe(0);
  });
});
