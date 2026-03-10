import type { NetProgram } from '@/types';

export const PROGRAM_TYPES = {
  attack: { label: 'Атака', color: 'text-cyber-accent' },
  defense: { label: 'Защита', color: 'text-cyber-cyan' },
  booster: { label: 'Ускоритель', color: 'text-cyber-green' },
  utility: { label: 'Утилита', color: 'text-cyber-yellow' }
} as const;

export const ICE_DANGER = {
  low: { label: 'Низкий', color: 'text-cyber-green' },
  medium: { label: 'Средний', color: 'text-cyber-yellow' },
  high: { label: 'Высокий', color: 'text-cyber-orange' },
  extreme: { label: 'Экстремальный', color: 'text-cyber-accent' }
} as const;

export const ICE_TYPES = {
  blocker: 'Blocker',
  assassin: 'Assassin',
  wafer: 'Wafer',
  hellhound: 'Hellhound',
  skeins: 'Skeins',
  spider: 'Spider',
  saboteur: 'Saboteur',
  brain: 'Brain',
  kraken: 'Kraken',
  dragon: 'Dragon'
} as const;

// добавить программу в колоду (проверка на дубликат и лимит)
export function addProgramToDeck(deck: NetProgram[], program: NetProgram, maxSize = 10): NetProgram[] {
  if (deck.length >= maxSize) return deck;
  if (deck.some(p => p.id === program.id)) return deck;
  return [...deck, program];
}

// удалить программу из колоды
export function removeProgramFromDeck(deck: NetProgram[], programId: string): NetProgram[] {
  return deck.filter(p => p.id !== programId);
}

// статистика колоды: количество, типы, суммарная сила и стоимость
export function getDeckStats(deck: NetProgram[]) {
  const byType = deck.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    count: deck.length,
    byType,
    totalStrength: deck.reduce((sum, p) => sum + (p.strength || 0), 0),
    totalCost: deck.reduce((sum, p) => sum + p.cost, 0)
  };
}

// фильтрация программ по типу и поиску
export function filterPrograms(programs: NetProgram[], type: string, search: string) {
  return programs.filter(p => {
    const matchesType = type === 'all' || p.type === type;
    const matchesSearch = search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });
}

// фильтрация ICE по типу, опасности и поиску
export function filterICE(ice: NetProgram[], type: string, danger: string, search: string) {
  return ice.filter(p => {
    const matchesType = type === 'all' || p.type === type;
    const matchesDanger = danger === 'all' || p.danger_level === danger;
    const matchesSearch = search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesDanger && matchesSearch;
  });
}

// бросок кубика d10, можно несколько
export function rollPrograms(count = 1): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 10) + 1);
}

// столкновение программы с ICE: атака или контратака
export function resolveProgramIce(program: NetProgram, ice: NetProgram) {
  const programRolls = rollPrograms(program.strength || 1);
  const iceRolls = rollPrograms(ice.strength || 1);

  const programTotal = programRolls.reduce((a, b) => a + b, 0);
  const iceTotal = iceRolls.reduce((a, b) => a + b, 0);

  const programDamage = Math.max(0, programTotal - iceTotal);
  const iceDamage = Math.max(0, iceTotal - programTotal);

  return {
    programWins: programTotal > iceTotal,
    programRolls,
    iceRolls,
    programTotal,
    iceTotal,
    programDamage,
    iceDamage
  };
}
