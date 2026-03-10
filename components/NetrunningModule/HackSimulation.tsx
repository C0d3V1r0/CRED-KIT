import { useState } from 'react';
import { useCharacterState } from '../../entities/character/model/hooks';
import { useToast } from '../../components/common/Toast';
import {
  createSimulationState,
  simulationStep,
  calculateNetBonus,
  getSimulationHint,
  type SimulationState
} from '../../logic/netrunning/netSimulation';
import type { NetProgram } from '@/types';
import programsData from '../../data/netrunning/programs.json';
import iceData from '../../data/netrunning/ice.json';
import { isNetProgram, readArrayData } from '../../utils/dataGuards';
import {
  EncounterPanel,
  NavigationPanel,
  QuickRollButton,
  RollResultPanel,
  SimulationEndedPanel,
  SimulationSetupPanel,
  SimulationStatusPanel
} from './HackSimulationView';

interface ICEEntry {
  id: string;
  name: string;
  description: string;
  type: string;
  strength: number;
  speed: number;
  cost: number;
  effects: string;
  danger_level: string;
  is_black_ice?: boolean;
  is_daemon?: boolean;
  special?: string;
  abilities?: string[];
}

function isICEEntry(value: unknown): value is ICEEntry {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.type === 'string' &&
    typeof candidate.strength === 'number' &&
    typeof candidate.speed === 'number' &&
    typeof candidate.cost === 'number' &&
    typeof candidate.effects === 'string' &&
    typeof candidate.danger_level === 'string' &&
    (candidate.is_black_ice === undefined || typeof candidate.is_black_ice === 'boolean') &&
    (candidate.is_daemon === undefined || typeof candidate.is_daemon === 'boolean') &&
    (candidate.special === undefined || typeof candidate.special === 'string') &&
    (candidate.abilities === undefined || (Array.isArray(candidate.abilities) && candidate.abilities.every((item) => typeof item === 'string')))
  );
}

const PLAYER_PROGRAMS = readArrayData(programsData, isNetProgram);
const ALL_ICE = readArrayData(iceData, isICEEntry);

// симулятор взлома сетей
export function HackSimulation() {
  const character = useCharacterState();
  const { showToast } = useToast();

  const [difficulty, setDifficulty] = useState(1);
  const [simulation, setSimulation] = useState<SimulationState | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [rollResult, setRollResult] = useState<{ rolls: number[]; total: number } | null>(null);

  const netBonus = character ? calculateNetBonus(character) : 5;
  const playerPrograms = PLAYER_PROGRAMS;
  const allICE = ALL_ICE;

  // бросок кубика
  const rollDice = (count = 1) => {
    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * 10) + 1);
    const total = rolls.reduce((a, b) => a + b, 0);
    return { rolls, total };
  };

  // случайный ICE или Demon
  const getRandomICE = (isBoss = false): ICEEntry => {
    const daemons = allICE.filter((ice) => ice.is_daemon);
    if (isBoss && daemons.length > 0) {
      return daemons[Math.floor(Math.random() * daemons.length)];
    }
    const regularICE = allICE.filter((ice) => !ice.is_daemon && !ice.is_black_ice);
    return regularICE[Math.floor(Math.random() * regularICE.length)];
  };

  // начать симуляцию
  const startSimulation = () => {
    const state = createSimulationState(difficulty, character);
    setSimulation(state);
    setRollResult(null);
    showToast('Взлом начат. Удачи!', 'info');
  };

  // сброс
  const resetSimulation = () => {
    setSimulation(null);
    setRollResult(null);
  };

  // прорыв узла
  const breachNode = () => {
    if (!simulation) return;

    const roll = rollDice();
    const threshold = 4 + difficulty;
    const success = roll.total + netBonus >= threshold;
    const totalNodes = 3 + difficulty * 2;

    if (!success) {
      const detectedState = simulationStep(simulation, {
        type: 'DETECTED',
        roll,
        threshold
      });
      const damagedState = simulationStep(detectedState, {
        type: 'ICE_ATTACK',
        roll,
        damage: 1,
        iceStrength: difficulty + 2
      });
      const shouldFail = damagedState.interfaceHP <= 0 || damagedState.detectionLevel >= 3;

      if (shouldFail) {
        setSimulation({
          ...damagedState,
          active: false,
          phase: 'ended',
          success: false,
          lastAction: damagedState.interfaceHP <= 0
            ? 'Связь потеряна: интерфейс разрушен'
            : 'Связь потеряна: вас полностью обнаружили'
        });
        showToast('Взлом провален: соединение потеряно', 'error');
      } else {
        setSimulation(damagedState);
        showToast(`Обнаружен! Порог: ${threshold}, ваш результат: ${roll.total + netBonus}`, 'warning');
      }

      setRollResult(roll);
      return;
    }

    const breachedState = simulationStep(simulation, {
      type: 'BREACH_NODE',
      roll,
      difficulty,
      success: true
    });
    const isLastNode = breachedState.nodesBreached >= totalNodes;

    if (isLastNode) {
      const finalState = {
        ...breachedState,
        active: false,
        phase: 'ended',
        success: true,
        lastAction: 'Сеть полностью зачищена!'
      };
      showToast('СЕТЬ ВЗЛОМАНА! Все узлы пройдены!', 'success');
      setSimulation(finalState);
    } else if (Math.random() < 0.3 * difficulty) {
      // - встреча с ICE или Demon (только если не последний узел и симуляция активна)
      const isBoss = difficulty >= 3 && Math.random() < 0.5;
      const iceEncounter = getRandomICE(isBoss);
      const iceHP = iceEncounter.strength * (iceEncounter.is_daemon ? 1.5 : 1);

      setSimulation({
        ...breachedState,
        phase: 'encounter',
        iceEncountered: {
          ...iceEncounter,
          strength: Math.floor(iceHP)
        },
        iceHP: Math.floor(iceHP),
        isDaemon: iceEncounter.is_daemon || false
      });

      if (iceEncounter.is_daemon) {
        showToast('ВНИМАНИЕ! ДЕМОН: ' + iceEncounter.name + '!', 'error');
      } else if (iceEncounter.is_black_ice) {
        showToast('Чёрный лёд: ' + iceEncounter.name + '!', 'error');
      } else {
        showToast('Обнаружена защита: ' + iceEncounter.name + '!', 'warning');
      }
    } else {
      showToast('Узел ' + breachedState.nodesBreached + ' пройден!', 'success');
      // - обязательно обновляем state после успешного прорыва
      setSimulation(breachedState);
    }

    setRollResult(roll);
  };

  // атаковать защиту
  const attackICE = (program?: NetProgram) => {
    if (!simulation || !simulation.iceEncountered) return;

    const roll = rollDice();
    const programStrength = program?.strength || 0;
    const iceStrength = simulation.iceEncountered.strength;
    const success = roll.total + programStrength >= iceStrength;

    if (success) {
      const newIceHP = simulation.iceHP - (programStrength + roll.total);
      if (newIceHP <= 0) {
        showToast(simulation.iceEncountered.is_daemon
          ? 'Демон повержен!'
          : 'Защита взломана!', 'success');

        setSimulation({
          ...simulation,
          phase: 'navigate',
          iceEncountered: null,
          iceHP: 0,
          isDaemon: false,
          lastAction: `Уничтожен ${simulation.iceEncountered.name}`
        });
      } else {
        showToast('Попадание! HP защиты: ' + newIceHP, 'success');
        setSimulation({
          ...simulation,
          iceHP: newIceHP,
          lastAction: `Атаковал ${simulation.iceEncountered.name}`
        });
      }
    } else {
      // контратака
      const damage = simulation.iceEncountered.is_daemon
        ? Math.floor((iceStrength + 5) / 2)
        : Math.floor((iceStrength + 5) / 3);

      let specialEffect = '';
      if (simulation.isDaemon && simulation.iceEncountered.abilities) {
        if (simulation.iceEncountered.abilities.includes('punish_mistake')) {
          specialEffect = ' Демон использует Track!';
        }
      }

      showToast('Промах! ICE контратакует на ' + damage + ' HP' + specialEffect, 'error');
      setSimulation({
        ...simulation,
        interfaceHP: Math.max(0, simulation.interfaceHP - damage),
        lastAction: `Контратака: -${damage} HP`
      });
    }

    setRollResult(roll);
  };

  // использовать защиту
  const applyDefense = (program?: NetProgram) => {
    if (!simulation || !simulation.iceEncountered) return;

    const roll = rollDice();
    const defense = program?.strength || 0;
    const iceAttack = simulation.iceEncountered.strength + (simulation.iceEncountered.speed || 0);

    if (simulation.isDaemon && simulation.iceEncountered.abilities?.includes('piercing')) {
      const damage = Math.floor((iceAttack - roll.total - defense) / 2);
      if (damage > 0) {
        showToast('Демон пробил защиту! -' + damage + ' HP', 'error');
        setSimulation({
          ...simulation,
          interfaceHP: Math.max(0, simulation.interfaceHP - damage)
        });
      } else {
        showToast('Защита сработала!', 'success');
      }
      setRollResult(roll);
      return;
    }

    const success = roll.total + defense >= iceAttack;

    if (success) {
      showToast('Защита отбита!', 'success');
      setSimulation({
        ...simulation,
        lastAction: 'Защита активирована'
      });
    } else {
      const damage = Math.floor((iceAttack - roll.total - defense) / 2);
      if (damage > 0) {
        showToast('Частично пробито: -' + damage + ' HP', 'warning');
        setSimulation({
          ...simulation,
          interfaceHP: Math.max(0, simulation.interfaceHP - damage),
          lastAction: `Пробито: -${damage} HP`
        });
      } else {
        showToast('Защита сработала!', 'success');
      }
    }

    setRollResult(roll);
  };

  // убежать от ICE
  const fleeICE = () => {
    if (!simulation || !simulation.iceEncountered) return;

    const roll = rollDice();
    const escapeDC = simulation.iceEncountered.speed + 8;
    const success = roll.total + netBonus >= escapeDC;

    if (success) {
      showToast('Успешное отступление!', 'success');
      setSimulation({
        ...simulation,
        phase: 'navigate',
        iceEncountered: null,
        iceHP: 0,
        isDaemon: false,
        lastAction: 'Отступил от ' + simulation.iceEncountered.name
      });
    } else {
      const damage = Math.floor(simulation.iceEncountered.strength / 2);
      showToast('Не удалось отступить! -' + damage + ' HP', 'error');
      setSimulation({
        ...simulation,
        interfaceHP: Math.max(0, simulation.interfaceHP - damage),
        lastAction: 'Провал отступления'
      });
    }

    setRollResult(roll);
  };

  // выйти из сети
  const exitNetwork = () => {
    if (!simulation) return;

    const newState = simulationStep(simulation, { type: 'EXIT' });
    setSimulation(newState);

    if (newState.dataCollected > 0) {
      showToast('Выход с ' + newState.dataCollected + 'eb данных', 'success');
    } else {
      showToast('Выход из сети без данных', 'info');
    }
  };

  // быстрый бросок
  const quickRoll = () => {
    const roll = rollDice();
    setRollResult(roll);
    showToast('d10: ' + roll.rolls[0] + ' + ' + netBonus + ' = ' + (roll.rolls[0] + netBonus), 'info');
  };

  const hint = simulation ? getSimulationHint(simulation) : 'Выберите сложность и начните взлом.';

  return (
    <div className="space-y-6 animate-fade-in">
      {!simulation?.active ? (
        <SimulationSetupPanel
          difficulty={difficulty}
          showRules={showRules}
          onDifficultyChange={setDifficulty}
          onStart={startSimulation}
          onToggleRules={() => setShowRules((current) => !current)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SimulationStatusPanel
              difficulty={difficulty}
              simulation={simulation}
              hint={hint}
              netBonus={netBonus}
            />
            <div className="card-cyber p-5 lg:col-span-2">
              {simulation.iceEncountered ? (
                <EncounterPanel
                  simulation={simulation}
                  playerPrograms={playerPrograms}
                  onAttack={attackICE}
                  onDefend={() => applyDefense(playerPrograms.find((program) => program.type === 'defense'))}
                  onFlee={fleeICE}
                />
              ) : (
                <NavigationPanel
                  simulation={simulation}
                  onBreach={breachNode}
                  onExit={exitNetwork}
                />
              )}

              {rollResult && <RollResultPanel rollResult={rollResult} netBonus={netBonus} />}
            </div>
          </div>

          {simulation.lastAction && (
            <div className="card-cyber p-4">
              <p className="text-cyber-muted text-sm">{simulation.lastAction}</p>
            </div>
          )}

          {simulation.phase === 'ended' && <SimulationEndedPanel simulation={simulation} onReset={resetSimulation} />}
        </>
      )}

      {simulation?.active && <QuickRollButton onClick={quickRoll} />}
    </div>
  );
}

export default HackSimulation;
