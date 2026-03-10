import { Icons } from '../../utils/icons';
import type { NetProgram } from '@/types';
import type { SimulationState } from '../../logic/netrunning/netSimulation';

interface DifficultyOption {
  value: number;
  label: string;
  desc: string;
}

interface EncounterICE {
  name: string;
  strength: number;
  speed: number;
  effects?: string;
  special?: string;
  is_black_ice?: boolean;
  is_daemon?: boolean;
}

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { value: 1, label: '1 - Локальная', desc: 'Простая сеть' },
  { value: 2, label: '2 - Корпоративная', desc: 'Базовая защита' },
  { value: 3, label: '3 - Защищенная', desc: 'Сильная защита' },
  { value: 4, label: '4 - Военная', desc: 'Опасная сеть' },
  { value: 5, label: '5 - Суперкомпьютер', desc: 'Смертельно' }
];

export function getHPColor(current: number, max: number) {
  const percent = current / max;
  if (percent > 0.6) return 'text-cyber-green';
  if (percent > 0.3) return 'text-cyber-yellow';
  return 'text-cyber-orange';
}

export function getICEColor(ice: EncounterICE) {
  if (ice.is_daemon) return 'text-cyber-purple';
  if (ice.is_black_ice) return 'text-cyber-red';
  return 'text-cyber-orange';
}

interface SimulationSetupPanelProps {
  difficulty: number;
  showRules: boolean;
  onDifficultyChange: (difficulty: number) => void;
  onStart: () => void;
  onToggleRules: () => void;
}

export function SimulationSetupPanel({
  difficulty,
  showRules,
  onDifficultyChange,
  onStart,
  onToggleRules
}: SimulationSetupPanelProps) {
  return (
    <div className="card-cyber p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-cyber-purple/20 flex items-center justify-center">
          <span className="text-cyber-purple">{Icons.hack}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-cyber-text">Симулятор взлома</h2>
          <p className="text-cyber-muted text-sm">Взлом компьютерных сетей</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-cyber-muted text-sm mb-3">Сложность сети</label>
        <div className="grid grid-cols-5 gap-2">
          {DIFFICULTY_OPTIONS.map((difficultyOption) => (
            <button
              key={difficultyOption.value}
              onClick={() => onDifficultyChange(difficultyOption.value)}
              className={`p-3 rounded-lg border transition-all ${difficulty === difficultyOption.value
                ? 'bg-cyber-accent/20 border-cyber-accent/50 text-cyber-accent'
                : 'bg-cyber-dark/60 border-cyber-gray/30 text-cyber-muted hover:text-cyber-text hover:border-cyber-gray/50'
              }`}
            >
              <div className="font-bold">{difficultyOption.value}</div>
              <div className="text-2xs mt-1 opacity-70">{difficultyOption.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {difficulty >= 3 && (
        <div className="mb-4 p-3 rounded-lg bg-cyber-purple/10 border border-cyber-purple/30">
          <div className="flex items-center gap-2 text-cyber-purple text-sm mb-1">
            {Icons.daemon}
            <span className="font-medium">Внимание: Возможна встреча с Демонами!</span>
          </div>
          <p className="text-cyber-muted text-xs">
            На сложности 3+ могут появиться демоны — опасные программы с особыми способностями.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onStart}
          data-testid="hack-start"
          className="flex-1 py-3 px-4 rounded-lg bg-cyber-accent/20 border border-cyber-accent/40 text-cyber-accent font-medium hover:bg-cyber-accent/30 transition-all"
        >
          Начать взлом
        </button>
        <button
          onClick={onToggleRules}
          className="py-3 px-4 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30 text-cyber-muted hover:text-cyber-text transition-all"
        >
          {Icons.info}
        </button>
      </div>

      {showRules && (
        <div className="mt-6 p-4 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
          <h3 className="font-bold text-cyber-text mb-3">Как взламывать</h3>
          <div className="space-y-2 text-sm text-cyber-muted">
            <p><span className="text-cyber-accent">1.</span> Прорыв узла: бросок d10 + ИНТ + интерфейс vs 4 + сложность</p>
            <p><span className="text-cyber-accent">2.</span> Защита атакует при неудаче - используйте атакующие программы</p>
            <p><span className="text-cyber-accent">3.</span> Демоны на сложности 3+ имеют особые способности</p>
            <p><span className="text-cyber-accent">4.</span> При 0 HP интерфейса - потеря связи</p>
            <p><span className="text-cyber-accent">5.</span> Собирайте данные и выходите с прибылью!</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface SimulationStatusPanelProps {
  difficulty: number;
  simulation: SimulationState;
  hint: string;
  netBonus: number;
}

export function SimulationStatusPanel({ difficulty, simulation, hint, netBonus }: SimulationStatusPanelProps) {
  return (
    <div className="card-cyber p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-cyber-purple/20 flex items-center justify-center">
          <span className="text-cyber-purple">{Icons.hack}</span>
        </div>
        <div>
          <h3 className="font-bold text-cyber-text">Статус</h3>
          <p className="text-cyber-muted text-xs">Сеть уровень {difficulty}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-cyber-muted">Связь</span>
          <span className={getHPColor(simulation.interfaceHP, simulation.maxInterfaceHP)}>
            {simulation.interfaceHP}/{simulation.maxInterfaceHP}
          </span>
        </div>
        <div className="h-2 rounded-full bg-cyber-dark overflow-hidden">
          <div
            className={`h-full transition-all ${simulation.interfaceHP / simulation.maxInterfaceHP > 0.3 ? 'bg-gradient-to-r from-cyber-green to-cyber-yellow' : 'bg-cyber-orange'}`}
            style={{ width: `${(simulation.interfaceHP / simulation.maxInterfaceHP) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-cyber-muted">Бонус взлома</span>
          <span className="text-cyber-cyan">+{netBonus}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cyber-muted">Узлов пройдено</span>
          <span className="text-cyber-text">{simulation.nodesBreached}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cyber-muted">Данные</span>
          <span className="text-cyber-accent">{simulation.dataCollected}eb</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cyber-muted">Обнаружение</span>
          <span className={simulation.detectionLevel >= 2 ? 'text-cyber-orange' : 'text-cyber-text'}>
            {'!'.repeat(simulation.detectionLevel + 1)}
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
        <p className="text-cyber-muted text-xs">{hint}</p>
      </div>
    </div>
  );
}

interface EncounterPanelProps {
  simulation: SimulationState;
  playerPrograms: NetProgram[];
  onAttack: (program?: NetProgram) => void;
  onDefend: () => void;
  onFlee: () => void;
}

export function EncounterPanel({ simulation, playerPrograms, onAttack, onDefend, onFlee }: EncounterPanelProps) {
  if (!simulation.iceEncountered) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          simulation.isDaemon
            ? 'bg-cyber-purple/20'
            : simulation.iceEncountered.is_black_ice
              ? 'bg-cyber-red/20'
              : 'bg-cyber-orange/20'
        }`}>
          <span className={`${simulation.isDaemon ? 'text-cyber-purple' : simulation.iceEncountered.is_black_ice ? 'text-cyber-red' : 'text-cyber-orange'} text-xl`}>
            {simulation.isDaemon ? Icons.daemon : simulation.iceEncountered.is_black_ice ? Icons.skull : '!'}
          </span>
        </div>
        <div>
          <h3 className={`font-bold text-lg ${getICEColor(simulation.iceEncountered)}`}>
            {simulation.isDaemon ? 'ДЕМОН' : simulation.iceEncountered.is_black_ice ? 'Чёрный лёд' : 'Защита'}: {simulation.iceEncountered.name}
          </h3>
          <p className="text-cyber-muted text-xs">
            Сила: {simulation.iceEncountered.strength} | Скорость: {simulation.iceEncountered.speed}
          </p>
          {simulation.isDaemon && simulation.iceEncountered.special && (
            <p className="text-cyber-purple text-xs mt-1">
              Способность: {simulation.iceEncountered.special.replace(/_/g, ' ')}
            </p>
          )}
        </div>
      </div>

      <div className={`p-3 rounded-lg mb-4 text-sm ${
        simulation.isDaemon
          ? 'bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-purple'
          : simulation.iceEncountered.is_black_ice
            ? 'bg-cyber-red/10 border border-cyber-red/30 text-cyber-red'
            : 'bg-cyber-dark/60 border border-cyber-gray/30 text-cyber-muted'
      }`}>
        {simulation.iceEncountered.effects || simulation.iceEncountered.special || 'Описание отсутствует'}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="text-xs text-cyber-muted mb-1">
            {simulation.isDaemon ? 'HP демона' : 'HP защиты'}
          </div>
          <div className="h-2 rounded-full bg-cyber-dark overflow-hidden">
            <div
              className={`h-full transition-all ${simulation.isDaemon ? 'bg-cyber-purple' : 'bg-cyber-orange'}`}
              style={{ width: `${Math.max(0, (simulation.iceHP / simulation.iceEncountered.strength) * 100)}%` }}
            />
          </div>
        </div>
        <span className={`${simulation.isDaemon ? 'text-cyber-purple' : 'text-cyber-orange'} font-mono`}>
          {Math.max(0, simulation.iceHP)}/{simulation.iceEncountered.strength}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-cyber-muted text-xs mb-2">Ваши атакующие программы:</p>
        <div className="flex flex-wrap gap-2">
          {playerPrograms.filter((program) => program.type === 'attack').slice(0, 4).map((program) => (
            <button
              key={program.id}
              onClick={() => onAttack(program)}
              className="px-3 py-1.5 rounded-lg bg-cyber-orange/10 border border-cyber-orange/30 text-cyber-orange text-sm hover:bg-cyber-orange/20 transition-all"
            >
              {program.name} (+{program.strength})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onAttack()}
          className="py-2.5 rounded-lg bg-cyber-orange/20 border border-cyber-orange/40 text-cyber-orange font-medium hover:bg-cyber-orange/30 transition-all"
        >
          Атака
        </button>
        <button
          onClick={onDefend}
          className="py-2.5 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan font-medium hover:bg-cyber-cyan/30 transition-all"
        >
          Защита
        </button>
        <button
          onClick={onFlee}
          className="py-2.5 rounded-lg bg-cyber-green/20 border border-cyber-green/40 text-cyber-green font-medium hover:bg-cyber-green/30 transition-all"
        >
          Отступление
        </button>
      </div>
    </div>
  );
}

interface NavigationPanelProps {
  simulation: SimulationState;
  onBreach: () => void;
  onExit: () => void;
}

export function NavigationPanel({ simulation, onBreach, onExit }: NavigationPanelProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-cyber-green/20 flex items-center justify-center">
          <span className="text-cyber-green">{Icons.shield}</span>
        </div>
        <div>
          <h3 className="font-bold text-cyber-green text-lg">Узел чист</h3>
          <p className="text-cyber-muted text-xs">Продвигайтесь к цели</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {Array.from({ length: 3 + simulation.difficulty * 2 }).map((_, index) => (
          <div
            key={index}
            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-mono text-sm transition-all ${index < simulation.currentNode
              ? 'bg-cyber-green/20 border border-cyber-green/40 text-cyber-green'
              : index === simulation.currentNode
                ? 'bg-cyber-accent/20 border border-cyber-accent/40 text-cyber-accent animate-pulse'
                : 'bg-cyber-dark/60 border border-cyber-gray/30 text-cyber-muted'
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBreach}
          data-testid="hack-breach"
          className="flex-1 py-3 rounded-lg bg-cyber-accent/20 border border-cyber-accent/40 text-cyber-accent font-medium hover:bg-cyber-accent/30 transition-all"
        >
          Прорыв
        </button>
        <button
          onClick={onExit}
          className="py-3 px-4 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30 text-cyber-muted hover:text-cyber-orange hover:border-cyber-orange/40 transition-all"
        >
          {Icons.exit}
        </button>
      </div>
    </div>
  );
}

interface RollResultPanelProps {
  rollResult: { rolls: number[]; total: number };
  netBonus: number;
}

export function RollResultPanel({ rollResult, netBonus }: RollResultPanelProps) {
  return (
    <div className="mt-4 p-3 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
      <p className="text-cyber-muted text-xs mb-2">Результат броска:</p>
      <div className="flex items-center gap-2">
        <span className="text-cyber-text font-mono">[{rollResult.rolls.join(', ')}]</span>
        <span className="text-cyber-accent">= {rollResult.total}</span>
        <span className="text-cyber-muted">+ {netBonus} бонус</span>
        <span className="text-cyber-green">= {rollResult.total + netBonus}</span>
      </div>
    </div>
  );
}

interface SimulationEndedPanelProps {
  simulation: SimulationState;
  onReset: () => void;
}

export function SimulationEndedPanel({ simulation, onReset }: SimulationEndedPanelProps) {
  return (
    <div className="card-cyber p-6 text-center">
      <div className={`text-2xl font-bold mb-2 ${simulation.success ? 'text-cyber-green' : 'text-cyber-orange'}`}>
        {simulation.success ? 'Взлом успешен!' : 'Связь потеряна'}
      </div>
      <p className="text-cyber-muted mb-4">
        {simulation.success
          ? `Вы вынесли ${simulation.dataCollected}eb данных!`
          : 'Ваш интерфейс уничтожен. Данные потеряны.'}
      </p>
      <button
        onClick={onReset}
        data-testid="hack-reset"
        className="py-2.5 px-6 rounded-lg bg-cyber-accent/20 border border-cyber-accent/40 text-cyber-accent hover:bg-cyber-accent/30 transition-all"
      >
        Новый взлом
      </button>
    </div>
  );
}

interface QuickRollButtonProps {
  onClick: () => void;
}

export function QuickRollButton({ onClick }: QuickRollButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onClick}
        data-testid="hack-quick-roll"
        className="w-14 h-14 rounded-full bg-cyber-dark/90 border border-cyber-gray/50 text-cyber-muted hover:text-cyber-cyan hover:border-cyber-cyan/50 transition-all shadow-lg flex items-center justify-center"
        title="Roll d10"
      >
        {Icons.dice}
      </button>
    </div>
  );
}
