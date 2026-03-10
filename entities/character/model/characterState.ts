import type { Character, CustomContent } from '@/types';

export function createDefaultCharacter(): Character {
  const baseEMP = 5;
  const baseHumanity = baseEMP * 10;

  return {
    id: `char_${Date.now()}`,
    name: 'Безымянный',
    role: 'Nomad',
    level: 1,
    roleAbilityRank: 4,
    stats: { INT: 5, REF: 6, DEX: 5, TECH: 4, WILL: 5, COOL: 5, LUCK: 5, MOVE: 5, BODY: 5, EMP: baseEMP },
    health: { current: 50, max: 50 },
    humanity: { current: baseHumanity, max: baseHumanity },
    armorState: {
      head: { current: 0, max: 0 },
      body: { current: 0, max: 0 }
    },
    cyberware: [],
    weapons: [],
    armor: [],
    gear: [],
    skills: {},
    customCombatSkills: [],
    money: 500
  };
}

export function createEmptyCustomContent(): CustomContent {
  return { cyberware: [], weapons: [], armor: [], programs: [] };
}
