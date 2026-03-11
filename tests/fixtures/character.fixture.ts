import type { Character } from '@/types';

// Базовая фикстура персонажа для тестов
export const baseCharacterFixture: Character = {
  id: 'fixture-character-1',
  name: 'Test Runner',
  role: 'Nomad',
  level: 1,
  roleAbilityRank: 4,
  stats: {
    INT: 5,
    REF: 6,
    DEX: 5,
    TECH: 4,
    WILL: 5,
    COOL: 5,
    LUCK: 5,
    MOVE: 5,
    BODY: 5,
    EMP: 5
  },
  health: {
    current: 50,
    max: 50
  },
  humanity: {
    current: 50,
    max: 50
  },
  armorState: {
    head: {
      current: 0,
      max: 0
    },
    body: {
      current: 0,
      max: 0
    }
  },
  cyberware: [],
  skills: {},
  customCombatSkills: [],
  weapons: [],
  armor: [],
  gear: [],
  money: 500
};
