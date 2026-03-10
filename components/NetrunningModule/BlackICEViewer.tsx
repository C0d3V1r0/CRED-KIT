import { useState } from 'react';
import { useCharacterState } from '../../entities/character/model/hooks';
import { useToast } from '../../components/common/Toast';
import { Icons } from '../../utils/icons';
import { useLanguage } from '../../features/settings/model/hooks';
import iceData from '../../data/netrunning/ice.json';

const ICE_CATEGORIES = [
  { id: 'all', label: { ru: 'Все', en: 'All' }, color: 'gray' },
  { id: 'tracer', label: { ru: 'Трейсеры', en: 'Tracers' }, color: 'pink' },
  { id: 'attack', label: { ru: 'Атакующие', en: 'Attack' }, color: 'orange' },
  { id: 'defense', label: { ru: 'Защитные', en: 'Defense' }, color: 'cyan' },
  { id: 'black_ice', label: { ru: 'Чёрный лёд', en: 'Black ICE' }, color: 'red' },
  { id: 'daemon', label: { ru: 'Демоны', en: 'Daemons' }, color: 'purple' }
] as const;

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

const ALL_ICE = iceData as ICEEntry[];

function calculateIceStats(iceEntries: ICEEntry[]) {
  return {
    total: iceEntries.length,
    blackIce: iceEntries.filter((item) => item.is_black_ice).length,
    daemons: iceEntries.filter((item) => item.is_daemon).length,
    attack: iceEntries.filter((item) => item.type === 'attack').length,
    tracer: iceEntries.filter((item) => item.type === 'tracer').length
  };
}

function evaluateIceDanger(ice: ICEEntry, interfaceHP: number, tr: (ru: string, en: string) => string) {
  const survivable = interfaceHP >= ice.strength * 2;
  return survivable
    ? { danger: false, message: tr('Возможно к выживанию', 'Survivable with caution') }
    : { danger: true, message: tr('ОПАСНО! Ваш интерфейс может не выдержать', 'DANGER! Your interface may not survive') };
}

export function BlackICEViewer() {
  const character = useCharacterState();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedICE, setSelectedICE] = useState<ICEEntry | null>(null);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredICE = ALL_ICE.filter((item) => {
    if (activeCategory !== 'all' && item.type !== activeCategory) {
      return false;
    }
    if (!normalizedSearch) {
      return true;
    }
    return item.name.toLowerCase().includes(normalizedSearch) || item.description.toLowerCase().includes(normalizedSearch);
  });

  const stats = calculateIceStats(ALL_ICE);
  const interfaceHP = 10 + Math.floor(((character?.stats?.BODY || 5) + (character?.stats?.WILL || 5)) / 2);

  // Получить цвет опасности
  const getDangerColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-cyber-green';
      case 'medium': return 'text-cyber-yellow';
      case 'high': return 'text-cyber-orange';
      case 'extreme': return 'text-cyber-red';
      default: return 'text-cyber-muted';
    }
  };

  // Показать детали
  const showDetails = (ice: ICEEntry) => {
    setSelectedICE(ice);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* - заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyber-red/20 flex items-center justify-center">
          <span className="text-cyber-red">{Icons.skull}</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-cyber-text">{tr('ICE & Демоны', 'ICE & Daemons')}</h2>
          <p className="ui-meta">{tr('Опасные программы сетевой защиты', 'Dangerous network defense programs')}</p>
        </div>
      </div>

      {/* - статистика */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="card-cyber p-3 text-center">
          <div className="text-xl font-bold text-cyber-text">{stats.total}</div>
          <div className="ui-meta-compact">{tr('Всего ICE', 'Total ICE')}</div>
        </div>
        <div className="card-cyber p-3 text-center">
          <div className="text-xl font-bold text-cyber-red">{stats.blackIce}</div>
          <div className="ui-meta-compact">{tr('Чёрный лёд', 'Black ICE')}</div>
        </div>
        <div className="card-cyber p-3 text-center">
          <div className="text-xl font-bold text-cyber-purple">{stats.daemons}</div>
          <div className="ui-meta-compact">{tr('Демоны', 'Daemons')}</div>
        </div>
        <div className="card-cyber p-3 text-center">
          <div className="text-xl font-bold text-cyber-orange">{stats.attack}</div>
          <div className="ui-meta-compact">{tr('Атакующие', 'Attack')}</div>
        </div>
        <div className="card-cyber p-3 text-center">
          <div className="text-xl font-bold text-cyber-pink">{stats.tracer}</div>
          <div className="ui-meta-compact">{tr('Трейсеры', 'Tracers')}</div>
        </div>
      </div>

      {/* - фильтры */}
      <div className="flex flex-wrap gap-2">
        {ICE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? `bg-cyber-${cat.color}/20 border-cyber-${cat.color}/50 text-cyber-${cat.color}`
                : 'bg-cyber-dark/60 border-cyber-gray/30 text-cyber-muted hover:text-cyber-text'
            }`}
          >
            {cat.label[language]}
          </button>
        ))}
      </div>

      {/* - поиск */}
      <input
        type="text"
        placeholder={tr('Поиск ICE...', 'Search ICE...')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input w-full"
      />

      {/* - список ICE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
        {filteredICE.map(ice => {
          const isBlackIce = ice.is_black_ice;
          const isDaemon = ice.is_daemon;

          return (
            <div
              key={ice.id}
              onClick={() => showDetails(ice)}
              className={`card-cyber p-4 cursor-pointer transition-all hover:border-cyber-accent/40 ${
                isBlackIce ? 'border-cyber-red/30 bg-cyber-red/5' :
                isDaemon ? 'border-cyber-purple/30 bg-cyber-purple/5' :
                ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isBlackIce && <span className="text-cyber-red text-xs">{Icons.skull}</span>}
                  {isDaemon && <span className="text-cyber-purple text-xs">{Icons.eye}</span>}
                  <h3 className="ui-card-title">{ice.name}</h3>
                </div>
                <span className={`ui-badge ${ice.danger_level === 'extreme' || ice.danger_level === 'high' ? 'ui-badge--orange' : ice.danger_level === 'medium' ? 'ui-badge--accent' : 'ui-badge--green'}`}>
                  {ice.danger_level.toUpperCase()}
                </span>
              </div>

              <p className="ui-meta line-clamp-2 mb-3">{ice.description}</p>

              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-3">
                  <span className="text-cyber-accent">STR: {ice.strength}</span>
                  <span className="text-cyber-cyan">SPD: {ice.speed}</span>
                </div>
                <span className="text-cyber-green">{ice.cost}eb</span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredICE.length === 0 && (
        <div className="text-center py-12 text-cyber-muted">
          {tr('ICE не найден', 'ICE not found')}
        </div>
      )}

      {/* - модальное окно деталей */}
      {selectedICE && (
        (() => {
          const dangerAssessment = evaluateIceDanger(selectedICE, interfaceHP, tr);

          return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedICE(null)}>
          <div className="card-cyber p-6 max-w-md w-full animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {selectedICE.is_black_ice && <span className="text-2xl">{Icons.skull}</span>}
                {selectedICE.is_daemon && <span className="text-2xl">{Icons.eye}</span>}
                <h3 className="text-lg font-bold text-cyber-text">{selectedICE.name}</h3>
              </div>
              <button
                onClick={() => setSelectedICE(null)}
                className="w-8 h-8 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30 text-cyber-muted hover:text-cyber-text flex items-center justify-center"
              >
                {Icons.close}
              </button>
            </div>

            <div className={`p-3 rounded-lg mb-4 ${
              selectedICE.is_black_ice ? 'bg-cyber-red/10 border border-cyber-red/30' :
              selectedICE.is_daemon ? 'bg-cyber-purple/10 border border-cyber-purple/30' :
              'bg-cyber-dark/60 border border-cyber-gray/30'
            }`}>
              <p className="text-cyber-text text-sm">{selectedICE.description}</p>
            </div>

            {/* - характеристики */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-2 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
                <div className="text-cyber-muted text-xs">{tr('Сила', 'Strength')} (STR)</div>
                <div className="text-lg font-bold text-cyber-accent">{selectedICE.strength}</div>
              </div>
              <div className="p-2 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
                <div className="text-cyber-muted text-xs">{tr('Скорость', 'Speed')} (SPD)</div>
                <div className="text-lg font-bold text-cyber-cyan">{selectedICE.speed}</div>
              </div>
              <div className="p-2 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
                <div className="text-cyber-muted text-xs">{tr('Стоимость', 'Cost')}</div>
                <div className="text-lg font-bold text-cyber-green">{selectedICE.cost}eb</div>
              </div>
              <div className="p-2 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
                <div className="text-cyber-muted text-xs">{tr('Опасность', 'Danger')}</div>
                <div className={`text-lg font-bold ${getDangerColor(selectedICE.danger_level)}`}>
                  {selectedICE.danger_level.toUpperCase()}
                </div>
              </div>
            </div>

            {/* - эффект */}
            <div className="p-3 rounded-lg bg-cyber-accent/10 border border-cyber-accent/30 mb-4">
              <div className="text-cyber-muted text-xs mb-1">{tr('Эффект', 'Effect')}:</div>
              <p className="text-cyber-accent text-sm">{selectedICE.effects}</p>
            </div>

            {/* - особые способности */}
            {selectedICE.special && (
              <div className="p-3 rounded-lg bg-cyber-purple/10 border border-cyber-purple/30 mb-4">
                <div className="text-cyber-muted text-xs mb-1">{tr('Особенность', 'Special')}:</div>
                <p className="text-cyber-purple text-sm capitalize">{selectedICE.special.replace('_', ' ')}</p>
              </div>
            )}

            {/* - проверка опасности */}
            {character && (
              <div className={`p-3 rounded-lg border ${
                dangerAssessment.danger
                  ? 'bg-cyber-orange/10 border-cyber-orange/30'
                  : 'bg-cyber-green/10 border-cyber-green/30'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {dangerAssessment.danger ? Icons.warning : Icons.shield}
                  <span className={dangerAssessment.danger ? 'text-cyber-orange' : 'text-cyber-green'}>
                    {dangerAssessment.danger ? tr('ВНИМАНИЕ!', 'WARNING!') : tr('ВЫЖИВАЕМО', 'SURVIVABLE')}
                  </span>
                </div>
                <p className="text-cyber-muted text-xs">{dangerAssessment.message}</p>
              </div>
            )}

            <button
              onClick={() => {
                showToast(`${tr('Подробности сохранены', 'Details saved')}: ${selectedICE.name}`, 'info');
                setSelectedICE(null);
              }}
              className="w-full py-2.5 rounded-lg bg-cyber-accent/20 border border-cyber-accent/40 text-cyber-accent hover:bg-cyber-accent/30 transition-all mt-4"
            >
              {tr('Закрыть', 'Close')}
            </button>
          </div>
        </div>
          );
        })()
      )}
    </div>
  );
}

export default BlackICEViewer;
