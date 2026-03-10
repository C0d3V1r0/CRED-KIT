import { useState } from 'react';
import { Icons } from '../../utils/icons';

type NetActionRule = {
  id: string;
  nameRu: string;
  nameEn: string;
  checkRu: string;
  checkEn: string;
  resultRu: string;
  resultEn: string;
  noteRu: string;
  noteEn: string;
};

const NET_ACTION_RULES: NetActionRule[] = [
  {
    id: 'backdoor',
    nameRu: 'Backdoor',
    nameEn: 'Backdoor',
    checkRu: 'NET действие: 1. Бросок Interface против DV пароля.',
    checkEn: 'NET Action: 1. Roll Interface against the password DV.',
    resultRu: 'На успехе открывает защищённый узел и позволяет пройти дальше.',
    resultEn: 'On success, opens a secured node and lets you continue.',
    noteRu: 'Сложность задаёт архитектура. В corebook это не отдельные раунды времени, а одно NET действие.',
    noteEn: 'The architecture sets the DV. In core rules this is one NET Action, not a variable round timer.'
  },
  {
    id: 'pathfinder',
    nameRu: 'Pathfinder',
    nameEn: 'Pathfinder',
    checkRu: 'NET действие: 1. Бросок Interface против DV архитектуры.',
    checkEn: 'NET Action: 1. Roll Interface against the architecture DV.',
    resultRu: 'Показывает структуру этажей и помогает планировать маршрут по сети.',
    resultEn: 'Reveals the floor structure and helps plan your route through the architecture.',
    noteRu: 'Pathfinder не уменьшает стоимость других действий по времени сам по себе.',
    noteEn: 'Pathfinder does not reduce the time cost of other actions by itself.'
  },
  {
    id: 'eyedee',
    nameRu: 'Eye-Dee',
    nameEn: 'Eye-Dee',
    checkRu: 'NET действие: 1. Бросок Interface против DV сущности.',
    checkEn: 'NET Action: 1. Roll Interface against the target DV.',
    resultRu: 'Позволяет опознать Black ICE, демона, программу или содержимое узла.',
    resultEn: 'Lets you identify Black ICE, demons, programs, or node contents.',
    noteRu: 'Это информационное действие. Его эффект не меняет базовую стоимость следующих действий.',
    noteEn: 'This is an information action. Its effect does not alter the base action cost of later actions.'
  },
  {
    id: 'control',
    nameRu: 'Control',
    nameEn: 'Control',
    checkRu: 'NET действие: 1. Бросок Interface против DV control node.',
    checkEn: 'NET Action: 1. Roll Interface against the control node DV.',
    resultRu: 'Даёт управление системами, привязанными к control node.',
    resultEn: 'Grants control over systems linked to the control node.',
    noteRu: 'Исполнение команды после захвата узла идёт через правила конкретной системы.',
    noteEn: 'Executing a command after seizing the node follows the rules of the specific system.'
  },
  {
    id: 'slide',
    nameRu: 'Slide',
    nameEn: 'Slide',
    checkRu: 'NET действие: 1. Бросок Interface против Perception/Interface демона или ICE.',
    checkEn: 'NET Action: 1. Roll Interface against a demon or ICE perception/interface check.',
    resultRu: 'Позволяет уйти от обнаружения и пройти мимо защитной логики.',
    resultEn: 'Lets you avoid detection and slip past defensive logic.',
    noteRu: 'Slide работает как отдельная проверка укрытия, а не как модификатор времени.',
    noteEn: 'Slide is a separate stealth check, not a time modifier.'
  },
  {
    id: 'cloak',
    nameRu: 'Cloak',
    nameEn: 'Cloak',
    checkRu: 'NET действие: 1. Бросок Interface против следа/логов сети.',
    checkEn: 'NET Action: 1. Roll Interface against the network trace/logs.',
    resultRu: 'Скрывает следы после работы в архитектуре.',
    resultEn: 'Covers your tracks after operating in the architecture.',
    noteRu: 'Это пост-действие по скрытию следов, а не ускорение нетраннинга.',
    noteEn: 'This is a post-action concealment step, not a speed boost.'
  },
  {
    id: 'virus',
    nameRu: 'Virus',
    nameEn: 'Virus',
    checkRu: 'NET действие: 1. Нужен контроль узла; затем задаётся эффект вируса.',
    checkEn: 'NET Action: 1. Requires control of the node, then you define the virus effect.',
    resultRu: 'Встраивает отложенный или постоянный эффект в архитектуру.',
    resultEn: 'Embeds a delayed or persistent effect into the architecture.',
    noteRu: 'Точные последствия и DV зависят от того, что именно меняется в системе.',
    noteEn: 'Exact consequences and DV depend on what exactly is being changed in the system.'
  },
  {
    id: 'zap',
    nameRu: 'Zap',
    nameEn: 'Zap',
    checkRu: 'NET действие: 1. Боевая атака Interface против цели в сети.',
    checkEn: 'NET Action: 1. Combat attack using Interface against a target in the NET.',
    resultRu: 'Наносит урон программам, демонам или Black ICE по их правилам.',
    resultEn: 'Deals damage to programs, demons, or Black ICE using their own rules.',
    noteRu: 'Сила программы и защита цели меняют исход боя, но не стоимость самого действия.',
    noteEn: 'Program strength and target defenses change the outcome of combat, not the action cost itself.'
  }
];

export function NetworkActionCalculator() {
  const [selectedAction, setSelectedAction] = useState<string>(NET_ACTION_RULES[0].id);
  const action = NET_ACTION_RULES.find((item) => item.id === selectedAction) ?? NET_ACTION_RULES[0];

  return (
    <div className="card-cyber p-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-cyber-orange/20 flex items-center justify-center">
          <span className="text-cyber-orange">{Icons.clock}</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-cyber-text">NET Action Reference</h3>
          <p className="text-cyber-muted text-xs">
            В corebook нет плавающего таймера по сложности сети: стандартные NET-действия тратят 1 NET Action, а не 1-5 раундов по эвристике.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-cyber-cyan/20 bg-cyber-dark/55 p-4 mb-6">
        <div className="text-cyber-cyan font-semibold mb-1">Базовое правило</div>
        <div className="text-cyber-text font-mono text-lg">3 NET Actions / turn</div>
        <div className="text-cyber-muted text-sm mt-2">
          Используйте этот блок как справочник по action economy. DV, программы, демоны и ICE меняют исход проверки, но не подменяют базовую стоимость действий хаусрульными таймерами.
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {NET_ACTION_RULES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedAction(item.id)}
            className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${
              selectedAction === item.id
                ? 'bg-cyber-accent/20 border-cyber-accent/50 text-cyber-accent'
                : 'bg-cyber-dark/60 border-cyber-gray/30 text-cyber-muted hover:text-cyber-text hover:border-cyber-gray/50'
            }`}
          >
            {item.nameRu}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
          <div className="flex items-center justify-between gap-3">
            <span className="text-cyber-text font-semibold">{action.nameRu}</span>
            <span className="text-cyber-green font-mono font-bold">1 NET Action</span>
          </div>
          <div className="text-cyber-muted text-sm mt-3">{action.checkRu}</div>
        </div>

        <div className="p-4 rounded-lg bg-cyber-black/50 border border-cyber-gray/20">
          <div className="text-cyber-muted text-xs mb-2">Что даёт</div>
          <div className="text-cyber-text text-sm">{action.resultRu}</div>
        </div>

        <div className="p-4 rounded-lg bg-cyber-green/5 border border-cyber-green/20">
          <div className="flex items-start gap-2">
            <span className="text-cyber-green mt-0.5">{Icons.info}</span>
            <div className="text-cyber-green text-xs">
              <p className="font-medium mb-1">Rule note</p>
              <p>{action.noteRu}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkActionCalculator;
