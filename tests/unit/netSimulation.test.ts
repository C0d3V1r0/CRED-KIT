import { describe, it, expect } from 'vitest';
import {
  NODE_TYPES,
  generateNetArchitecture,
  calculateNetBonus,
  calculateInterfaceHP,
  createSimulationState,
  simulationStep,
  getSimulationHint,
  getTutorialHints,
  recommendProgram,
  getRulesExplanation
} from '@/logic/netrunning/netSimulation';
import type { Character, NetProgram } from '@/types';

const makeCharacter = (overrides: Partial<Character> = {}): Character => ({
  id: '1',
  name: 'T',
  role: 'Nomad',
  roleAbilityRank: 4,
  stats: { INT: 5, REF: 5, DEX: 5, TECH: 5, WILL: 5, COOL: 5, LUCK: 5, MOVE: 5, BODY: 5, EMP: 5 },
  cyberware: [],
  health: { current: 50, max: 50 },
  humanity: { current: 50, max: 50 },
  armorState: {
    head: { current: 0, max: 0 },
    body: { current: 0, max: 0 }
  },
  customCombatSkills: [],
  money: 0,
  ...overrides
});

const makeProgram = (overrides: Partial<NetProgram> = {}): NetProgram => ({
  id: 'p1',
  name: 'Program',
  description: '',
  type: 'attack',
  cost: 100,
  strength: 4,
  effects: 'attack',
  ...overrides
});

describe('netSimulation', () => {
  describe('NODE_TYPES', () => {
    it('все типы узлов есть', () => {
      expect(NODE_TYPES.file).toBeDefined();
      expect(NODE_TYPES.database).toBeDefined();
      expect(NODE_TYPES.password).toBeDefined();
      expect(NODE_TYPES.trap).toBeDefined();
      expect(NODE_TYPES.server).toBeDefined();
      expect(NODE_TYPES.ai).toBeDefined();
    });
    it('правильные значения', () => {
      expect(NODE_TYPES.file.value).toBe(100);
      expect(NODE_TYPES.database.value).toBe(500);
      expect(NODE_TYPES.server.value).toBe(1000);
      expect(NODE_TYPES.ai.value).toBe(2000);
    });
  });

  describe('generateNetArchitecture', () => {
    it('правильное количество узлов', () => {
      expect(generateNetArchitecture(1).nodes.length).toBe(5);
    });
    it('больше узлов с ростом сложности', () => {
      const a1 = generateNetArchitecture(1);
      const a3 = generateNetArchitecture(3);
      expect(a3.nodes.length).toBeGreaterThan(a1.nodes.length);
    });
    it('защищены первые N узлов', () => {
      const arch = generateNetArchitecture(3);
      const protectedCount = arch.nodes.filter(n => n.protected).length;
      expect(protectedCount).toBe(3);
    });
    it('AI тип для босса на высокой сложности', () => {
      const arch = generateNetArchitecture(3);
      const lastNode = arch.nodes[arch.nodes.length - 1];
      expect(lastNode.type).toBe('ai');
    });
  });

  describe('calculateNetBonus', () => {
    it('дефолт для null персонажа', () => {
      expect(calculateNetBonus(null)).toBe(6);
    });
    it('бонус из INT', () => {
      const lowINT = makeCharacter({ id: '1', stats: { INT: 3, REF: 5, DEX: 5, TECH: 5, WILL: 5, COOL: 5, LUCK: 5, MOVE: 5, BODY: 5, EMP: 5 } });
      const highINT = makeCharacter({ id: '2', role: 'Netrunner', roleAbilityRank: 6, stats: { INT: 10, REF: 5, DEX: 5, TECH: 5, WILL: 5, COOL: 5, LUCK: 5, MOVE: 5, BODY: 5, EMP: 5 } });
      expect(calculateNetBonus(highINT)).toBeGreaterThan(calculateNetBonus(lowINT));
    });
    it('использует реальный interface ранг и бонусы имплантов', () => {
      const char = makeCharacter({
        role: 'Netrunner',
        roleAbilityRank: 5,
        cyberware: [{ id: 'cw1', name: 'Interface Plug', description: '', type: 'custom', cost: 100, hl: 0, slot: 'head_brain', installedAt: Date.now(), effects: { interface: '+2' } }]
      });

      expect(calculateNetBonus(char)).toBe(12);
    });
  });

  describe('calculateInterfaceHP', () => {
    it('дефолт для null', () => {
      expect(calculateInterfaceHP(null)).toBe(12);
    });
    it('HP из BODY и WILL', () => {
      const char = makeCharacter({
        role: 'Solo',
        stats: { INT: 5, REF: 5, DEX: 5, TECH: 5, WILL: 8, COOL: 5, LUCK: 5, MOVE: 5, BODY: 8, EMP: 5 }
      });
      expect(calculateInterfaceHP(char)).toBe(13);
    });
  });

  describe('createSimulationState', () => {
    it('активная симуляция', () => {
      const s = createSimulationState(1);
      expect(s.active).toBe(true);
      expect(s.phase).toBe('breach');
    });
    it('сложность установлена', () => {
      expect(createSimulationState(3).difficulty).toBe(3);
    });
    it('HP из персонажа', () => {
      const char = makeCharacter({
        role: 'Netrunner',
        stats: { INT: 5, REF: 5, DEX: 5, TECH: 5, WILL: 6, COOL: 5, LUCK: 5, MOVE: 5, BODY: 6, EMP: 5 }
      });
      const s = createSimulationState(1, char);
      expect(s.interfaceHP).toBe(11);
    });
    it('нет данных в начале', () => {
      const s = createSimulationState(1);
      expect(s.dataCollected).toBe(0);
      expect(s.nodesBreached).toBe(0);
    });
  });

  describe('simulationStep', () => {
    it('BREACH_NODE', () => {
      const s = createSimulationState(1);
      const ns = simulationStep(s, { type: 'BREACH_NODE', roll: { rolls: [6], total: 6 }, success: true, difficulty: 1 });
      expect(ns.currentNode).toBe(1);
      expect(ns.nodesBreached).toBe(1);
    });
    it('USE_PROGRAM', () => {
      const s = createSimulationState(1);
      const prog = makeProgram({ id: 'p1', name: 'Sword', strength: 6 });
      const ns = simulationStep(s, { type: 'USE_PROGRAM', program: prog, roll: { rolls: [8], total: 8 }, success: true });
      expect(ns.programUsed).toBe(prog);
      expect(ns.iceDefeated).toBe(1);
    });
    it('ICE_ATTACK', () => {
      const s = createSimulationState(1);
      const ns = simulationStep(s, { type: 'ICE_ATTACK', roll: { rolls: [7], total: 7 }, iceStrength: 6, damage: 2 });
      expect(ns.interfaceHP).toBeLessThan(s.interfaceHP);
    });
    it('EXIT', () => {
      const s = createSimulationState(1);
      const ns = simulationStep(s, { type: 'EXIT' });
      expect(ns.active).toBe(false);
      expect(ns.phase).toBe('ended');
    });
    it('ENCOUNTER_ICE', () => {
      const s = createSimulationState(1);
      const ns = simulationStep(s, {
        type: 'ENCOUNTER_ICE',
        ice: { id: 'ice1', name: 'Kraken', strength: 12, speed: 4, type: 'attack' }
      });
      expect(ns.phase).toBe('encounter');
      expect(ns.iceEncountered?.name).toBe('Kraken');
      expect(ns.iceHP).toBe(12);
    });
    it('DETECTED ограничивает уровень обнаружения', () => {
      const s = { ...createSimulationState(1), detectionLevel: 3 };
      const ns = simulationStep(s, { type: 'DETECTED', roll: { rolls: [2], total: 2 }, threshold: 8 });
      expect(ns.detectionLevel).toBe(3);
      expect(ns.lastAction).toContain('Обнаружен');
    });
    it('ICE_DESTROYED очищает встречу', () => {
      const s = {
        ...createSimulationState(1),
        phase: 'encounter',
        iceEncountered: { id: 'ice1', name: 'Sword', strength: 4, speed: 2, type: 'attack' },
        iceHP: 4
      };
      const ns = simulationStep(s, { type: 'ICE_DESTROYED', iceName: 'Sword' });
      expect(ns.phase).toBe('navigate');
      expect(ns.iceEncountered).toBeNull();
      expect(ns.iceHP).toBe(0);
    });
    it('неизвестное действие не меняет state', () => {
      const s = createSimulationState(1);
      const ns = simulationStep(s, { type: 'UNKNOWN' });
      expect(ns).toEqual(s);
    });
  });

  describe('getSimulationHint', () => {
    it('дефолт для null', () => {
      expect(getSimulationHint(null)).toContain('сложность');
    });
    it('низкий HP', () => {
      const s = createSimulationState(1);
      s.interfaceHP = 2;
      expect(getSimulationHint(s)).toContain('Критический');
    });
    it('высокое обнаружение', () => {
      const s = createSimulationState(1);
      s.detectionLevel = 3;
      expect(getSimulationHint(s)).toContain('риск');
    });
    it('встреча с ICE', () => {
      const s = createSimulationState(1);
      s.iceEncountered = { id: 'ice1', name: 'Kraken', strength: 12, speed: 4, type: 'attack' };
      expect(getSimulationHint(s)).toContain('Kraken');
    });
  });

  describe('recommendProgram', () => {
    it('null для null ICE', () => expect(recommendProgram(null, [])).toBeNull());
    it('null для пустых программ', () => {
      const ice = { id: 'ice1', name: 'Sword', strength: 4, speed: 2, type: 'attack' };
      expect(recommendProgram(ice, [])).toBeNull();
    });
    it('лучшая атакующая программа', () => {
      const ice = { id: 'ice1', name: 'Kraken', strength: 12, speed: 4, type: 'attack' };
      const progs: NetProgram[] = [
        makeProgram({ id: 'p1', name: 'Sword', type: 'attack', strength: 4 }),
        makeProgram({ id: 'p2', name: 'Sniper', type: 'attack', strength: 10, cost: 500 }),
        makeProgram({ id: 'p3', name: 'Shield', type: 'defense', strength: 5, cost: 200, effects: 'defense' })
      ];
      expect(recommendProgram(ice, progs)?.name).toBe('Sniper');
    });
    it('берёт one-hit программу, если такая есть', () => {
      const ice = { id: 'ice1', name: 'Wall', strength: 5, speed: 1, type: 'defense' };
      const progs: NetProgram[] = [
        makeProgram({ id: 'p1', name: 'Chip', type: 'attack', strength: 3 }),
        makeProgram({ id: 'p2', name: 'Hammer', type: 'attack', strength: 5 })
      ];
      expect(recommendProgram(ice, progs)?.name).toBe('Hammer');
    });
    it('null если атакующих программ нет', () => {
      const ice = { id: 'ice1', name: 'Wall', strength: 5, speed: 1, type: 'defense' };
      const progs: NetProgram[] = [makeProgram({ id: 'p1', name: 'Shield', type: 'defense', effects: 'defense' })];
      expect(recommendProgram(ice, progs)).toBeNull();
    });
  });

  describe('getTutorialHints', () => {
    it('даёт стартовую подсказку для пустого state', () => {
      const hints = getTutorialHints(null);
      expect(hints.general).toContain('выберите сложность');
    });
    it('подсказывает формулу прорыва на фазе breach', () => {
      const hints = getTutorialHints(createSimulationState(2));
      expect(hints.breach).toContain('Формула взлома');
      expect(hints.exit).toContain('Пока данных нет');
    });
    it('советует лучшую атаку против ICE', () => {
      const state = createSimulationState(2);
      state.iceEncountered = { id: 'ice1', name: 'Kraken', strength: 8, speed: 4, type: 'attack' };
      const hints = getTutorialHints(state, [
        makeProgram({ id: 'p1', name: 'Sword', type: 'attack', strength: 4 }),
        makeProgram({ id: 'p2', name: 'Cannon', type: 'attack', strength: 9 })
      ]);
      expect(hints.ice).toContain('Kraken');
      expect(hints.programs).toContain('Cannon');
    });
    it('показывает отсутствие атакующих программ', () => {
      const state = createSimulationState(2);
      state.iceEncountered = { id: 'ice1', name: 'Wall', strength: 6, speed: 2, type: 'defense' };
      state.dataCollected = 300;
      const hints = getTutorialHints(state, [makeProgram({ id: 'p1', name: 'Shield', type: 'defense', effects: 'defense' })]);
      expect(hints.programs).toContain('нет атакующих программ');
      expect(hints.exit).toContain('300eb');
    });
    it('подсвечивает высокий риск обнаружения', () => {
      const state = createSimulationState(2);
      state.detectionLevel = 2;
      const hints = getTutorialHints(state);
      expect(hints.general).toContain('ВНИМАНИЕ');
    });
  });

  describe('getRulesExplanation', () => {
    it('возвращает объект правил', () => {
      const rules = getRulesExplanation();
      expect(rules.title).toContain('учебник');
      expect(rules.basics).toBeDefined();
      expect(rules.mechanics).toBeDefined();
      expect(rules.tips).toBeDefined();
    });
    it('содержит ключевые концепции', () => {
      const rules = getRulesExplanation();
      expect(rules.basics).toContain('Колода программ');
      expect(rules.mechanics).toContain('Прорыв');
      expect(rules.tips).toContain('Советы');
    });
  });
});
