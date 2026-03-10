import type { Character, NetProgram } from '@/types';
import { calculateInterface } from '@/logic/character/statsCalculator';

export const NODE_TYPES = {
  file: { label: 'Файл', value: 100, danger: 'low' },
  database: { label: 'БД', value: 500, danger: 'medium' },
  password: { label: 'Пароль', value: 200, danger: 'medium' },
  trap: { label: 'Ловушка', value: 0, danger: 'high' },
  server: { label: 'Сервер', value: 1000, danger: 'high' },
  ai: { label: 'ИИ', value: 2000, danger: 'extreme' }
} as const;

export type NodeType = keyof typeof NODE_TYPES;

export interface NetNode {
  id: string;
  name: string;
  type: NodeType;
  ice: ICE | null;
  data: NetData | null;
  protected: boolean;
  breached: boolean;
}

export interface NetData {
  value: number;
  type: string;
  name: string;
  encrypted: boolean;
}

export interface ICE {
  id: string;
  name: string;
  description?: string;
  strength: number;
  speed: number;
  type: string;
  cost?: number;
  effects?: string;
  danger_level?: string;
  is_black_ice?: boolean;
  is_daemon?: boolean;
  special?: string;
  abilities?: string[];
}

export interface NetArchitecture {
  id: string;
  name: string;
  difficulty: number;
  nodes: NetNode[];
  connections: number[][];
  totalNodes: number;
  totalValue: number;
  layers: number;
}

// - генерируем архитектуру сети
export function generateNetArchitecture(difficulty = 1, nodeCount: number | null = null): NetArchitecture {
  const nodes: NetNode[] = [];
  const count = nodeCount || (3 + difficulty * 2);

  const nodeTypePool = Object.entries(NODE_TYPES).filter(([key]) => {
    if (difficulty === 1) return ['file', 'password'].includes(key);
    if (difficulty === 2) return !['ai'].includes(key);
    return true;
  });

  for (let i = 0; i < count; i++) {
    if (i === count - 1) {
      // последний узел - самый жирный
      nodes.push({
        id: `node_${i}`,
        name: `Уровень ${i + 1}`,
        type: (difficulty >= 3 ? 'ai' : 'database') as NodeType,
        ice: i < difficulty ? generateICE(difficulty) : null,
        data: generateData(difficulty >= 3 ? 'ai' : 'database', difficulty),
        protected: i < difficulty,
        breached: false
      });
    } else {
      const typeEntry = nodeTypePool[Math.floor(Math.random() * nodeTypePool.length)];
      const type = typeEntry[0] as NodeType;

      nodes.push({
        id: `node_${i}`,
        name: `Уровень ${i + 1}`,
        type,
        ice: i < difficulty ? generateICE(Math.min(difficulty, 3)) : null,
        data: generateData(type, difficulty),
        protected: i < difficulty,
        breached: false
      });
    }
  }

  // связи между узлами
  const connections: number[][] = [];
  for (let i = 0; i < count - 1; i++) {
    connections.push([i, i + 1]);
    if (Math.random() > 0.5 && i < count - 2) {
      connections.push([i, i + 2]);
    }
  }

  return {
    id: `net_${Date.now()}`,
    name: `Сеть: ${getNetName(difficulty)}`,
    difficulty,
    nodes,
    connections,
    totalNodes: count,
    totalValue: nodes.reduce((sum, n) => sum + (n.data?.value || 0), 0),
    layers: count
  };
}

function getNetName(difficulty: number): string {
  const names: Record<number, string> = { 1: 'Локальная сеть', 2: 'Корпоративная сеть', 3: 'Защищённая сеть', 4: 'Военный сервер', 5: 'Суперкомпьютер' };
  return names[difficulty] || `Сеть уровень ${difficulty}`;
}

function generateICE(strength: number): ICE {
  const iceTypes = [
    { name: 'Wisp', strength: 2, speed: 1, type: ' tracer' },
    { name: 'Sword', strength: 4, speed: 2, type: 'attack' },
    { name: 'Painter', strength: 4, speed: 2, type: ' tracer' },
    { name: 'Blade', strength: 6, speed: 3, type: 'attack' },
    { name: 'Wall', strength: 5, speed: 1, type: 'defense' },
    { name: 'Kraken', strength: 12, speed: 4, type: 'attack' },
    { name: 'Zheng', strength: 15, speed: 5, type: 'attack' }
  ];

  const template = iceTypes.find(t => t.strength <= strength * 3) || iceTypes[iceTypes.length - 1];
  return { ...template, id: `ice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
}

function generateData(type: string, difficulty: number): NetData | null {
  const typeInfo = NODE_TYPES[type as NodeType];
  if (!typeInfo) return null;

  const multiplier = 1 + (difficulty - 1) * 0.5;
  return { value: Math.round(typeInfo.value * multiplier), type, name: typeInfo.label, encrypted: type !== 'file' };
}

// - бонус к взлому от персонажа
export function calculateNetBonus(character: Character | null): number {
  const int = Number(character?.stats?.INT) || 5;
  const baseInterface = character?.role === 'Netrunner'
    ? Number(character.roleAbilityRank) || 1
    : 1;
  const interfaceLevel = calculateInterface(baseInterface, character?.cyberware || []);
  return int + interfaceLevel;
}

// - HP интерфейса
export function calculateInterfaceHP(character: Character | null): number {
  const body = Number(character?.stats?.BODY) || 8;
  const will = Number(character?.stats?.WILL) || 6;
  return Math.floor((body + will) / 2) + 5;
}

export interface SimulationState {
  active: boolean;
  phase: string;
  difficulty: number;
  currentNode: number;
  nodesBreached: number;
  iceDefeated: number;
  iceEncountered: ICE | null;
  iceHP: number;
  isDaemon: boolean;
  dataCollected: number;
  interfaceHP: number;
  maxInterfaceHP: number;
  detectionLevel: number;
  netBonus: number;
  lastAction: string;
  lastRoll: { rolls: number[]; total: number } | null;
  success: boolean;
  programUsed?: NetProgram | null;
  iceDefeatedCount?: number;
}

export interface SimulationAction {
  type: string;
  program?: NetProgram;
  roll?: { rolls: number[]; total: number } | null;
  success?: boolean;
  ice?: ICE | null;
  value?: number;
  damage?: number;
  threshold?: number;
  iceName?: string;
  iceStrength?: number;
  difficulty?: number;
}

// - редюсер для симуляции
export function simulationStep(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'USE_PROGRAM':
      return {
        ...state,
        programUsed: action.program,
        lastRoll: action.roll || null,
        lastAction: `Атака ${action.program?.name}: ${action.roll?.total} + ${action.program?.strength}`,
        iceDefeated: state.iceDefeated + (action.success ? 1 : 0),
        iceHP: action.success ? 0 : state.iceHP
      };
    case 'ENCOUNTER_ICE':
      return {
        ...state,
        phase: 'encounter',
        iceEncountered: action.ice || null,
        iceHP: action.ice?.strength || 0,
        lastAction: `Встречен ${action.ice?.name} (HP: ${action.ice?.strength})`
      };
    case 'BREACH_NODE':
      return {
        ...state,
        currentNode: state.currentNode + 1,
        nodesBreached: state.nodesBreached + 1,
        lastRoll: action.roll || null,
        lastAction: `Прорыв: ${action.roll?.total} + ${state.netBonus} >= ${(action.difficulty || state.difficulty) + 4}`,
        phase: 'navigate'
      };
    case 'DETECTED':
      return {
        ...state,
        detectionLevel: Math.min(3, state.detectionLevel + 1),
        lastRoll: action.roll || null,
        lastAction: `Обнаружен! (${action.roll?.total} < ${action.threshold})`
      };
    case 'ICE_ATTACK':
      return {
        ...state,
        interfaceHP: Math.max(0, state.interfaceHP - (action.damage || 0)),
        lastRoll: action.roll || null,
        lastAction: `Атака ICE: ${action.roll?.total} + ${action.iceStrength} = ${(action.roll?.total || 0) + (action.iceStrength || 0)}`
      };
    case 'EXIT':
      return {
        ...state,
        active: false,
        phase: 'ended',
        lastAction: 'Выход из сети',
        success: state.dataCollected > 0 && state.interfaceHP > 0
      };
    case 'ICE_DESTROYED':
      return {
        ...state,
        phase: 'navigate',
        iceEncountered: null,
        iceHP: 0,
        lastAction: `${action.iceName} уничтожен!`
      };
    default:
      return state;
  }
}

// - начальное состояние симуляции
export function createSimulationState(difficulty = 1, character: Character | null = null): SimulationState {
  const netBonus = calculateNetBonus(character);
  const maxHP = calculateInterfaceHP(character);

  return {
    active: true,
    phase: 'breach',
    difficulty,
    currentNode: 0,
    nodesBreached: 0,
    iceDefeated: 0,
    iceEncountered: null,
    iceHP: 0,
    isDaemon: false,
    dataCollected: 0,
    interfaceHP: maxHP,
    maxInterfaceHP: maxHP,
    detectionLevel: 0,
    netBonus,
    lastAction: 'Начните взлом',
    lastRoll: null,
    success: false
  };
}

// - подсказка для текущего состояния
export function getSimulationHint(state: SimulationState | null): string {
  if (!state) return 'Выберите сложность и начните взлом.';

  if (state.interfaceHP <= 3) return 'Критический урон! Рекомендуется выход из сети.';
  if (state.detectionLevel >= 3) return 'Высокий риск обнаружения! Используйте маскировку.';
  if (state.iceEncountered) return `ICE ${state.iceEncountered.name} атакует! Используйте защиту или атакуйте в ответ.`;
  if (state.phase === 'navigate') return 'Узел чистый. Продолжайте продвижение.';
  return 'Готовы к взлому. Удачи!';
}

export interface TutorialHints {
  general: string;
  breach: string;
  ice: string;
  programs: string;
  exit: string;
}

// - туториал-подсказки
export function getTutorialHints(state: SimulationState | null, playerPrograms: NetProgram[] = []): TutorialHints {
  const hints: TutorialHints = { general: '', breach: '', ice: '', programs: '', exit: '' };

  if (!state) {
    hints.general = 'Для начала выберите сложность сети и нажмите "Начать взлом".';
    return hints;
  }

  if (state.interfaceHP <= 3) {
    hints.general = 'ВНИМАНИЕ! Ваш интерфейс серьёзно повреждён. При 0 HP вы потеряете связь с сетью и все данные.';
  } else if (state.detectionLevel >= 2) {
    hints.general = 'ВНИМАНИЕ! Система близка к обнаружению вашего присутствия. При 3 уровне — GAME OVER.';
  } else {
    hints.general = 'Система в норме. Продолжайте осторожное продвижение по сети.';
  }

  if (state.phase === 'breach') {
    const threshold = 4 + state.difficulty;
    const needed = Math.max(0, threshold - state.netBonus);
    hints.breach = `Формула взлома: d10 + ${state.netBonus} (бонус) >= ${threshold} (сложность).\nВам нужно выбросить ${needed}+ на d10 или использовать программу PathFinder.`;
  }

  if (state.iceEncountered) {
    const ice = state.iceEncountered;
    hints.ice = `ВНИМАНИЕ! ICE "${ice.name}" типа "${ice.type}":\n- Сила: ${ice.strength} (сколько урона наносит при контратаке)\n- Скорость: ${ice.speed}\n- При провале атаки вы получите урон: ${Math.floor((ice.strength + 5) / 3)} HP`;

    const attackPrograms = playerPrograms.filter(p => p.type === 'attack');
    if (attackPrograms.length > 0) {
      const bestAttack = attackPrograms.reduce((best, p) => (p.strength || 0) > (best.strength || 0) ? p : best, attackPrograms[0]);
      hints.programs = `Рекомендуемая атака: "${bestAttack.name}" (Сила: ${bestAttack.strength}).\nРассчитайте: d10 + ${bestAttack.strength} vs ${ice.strength}.`;
    } else {
      hints.programs = 'У вас нет атакующих программ! Используйте "прорыв" для попытки обойти ICE.';
    }
  }

  if (state.dataCollected > 0) {
    hints.exit = `У вас уже ${state.dataCollected}eb данных. Хотите выйти с ними или идти глубже?`;
  } else {
    hints.exit = 'Пока данных нет. Продолжайте взлом до ценных файлов.';
  }

  return hints;
}

// - рекомендуемая программа против ICE
export function recommendProgram(ice: ICE | null, programs: NetProgram[] | null): NetProgram | null {
  if (!ice || !programs || programs.length === 0) return null;

  const attackPrograms = programs.filter(p => p.type === 'attack');
  if (attackPrograms.length === 0) return null;

  const oneHitKill = attackPrograms.find(p => (p.strength || 0) >= ice.strength);
  return oneHitKill || attackPrograms.reduce((best, p) => (p.strength || 0) > (best.strength || 0) ? p : best, attackPrograms[0]);
}

// - объяснение правил
export function getRulesExplanation() {
  return {
    title: 'Краткий учебник по взлому',
    basics: `Основы взлома:

1. Колода программ — ваш арсенал в сети. Собирайте атакующие, защитные и утилитарные программы.

2. Интерфейс — ваш канал связи с сетью. Чем выше уровень, тем больше бонус к проверкам.

3. Сложность сети (1-5) определяет:
   - Количество узлов
   - Силу ICE
   - Стоимость данных`,

    mechanics: `Механика взлома:

Прорыв узла:
- Бросок: d10 + ИНТ + интерфейс
- Порог: 4 + сложность сети
- Провал = обнаружение

Встреча с ICE:
- ICE — охранные программы сети
- Типы: следящий, атакующий, защитный, утилита
- При атаке: d10 + сила программы vs сила ICE

Контратака ICE:
- При неудачной атаке ICE контратакует
- Урон: (d10 + сила ICE) / 3, минимум 1
- При 0 HP интерфейса — потеря связи`,

    tips: `Советы для новичков:

- Всегда носите программу-дешифратор (+2 к взлому)
- Не атакуйте сильный ICE без подготовки
- Следите за HP интерфейса
- Выходите, пока ещё есть данные
- Начинайте с низкой сложности для практики`
  };
}
