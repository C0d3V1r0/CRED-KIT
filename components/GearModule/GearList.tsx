import { useState, useMemo } from 'react';
import {
  useCharacterCoreActions,
  useCharacterState,
  useInventoryActions
} from '../../entities/character/model/hooks';
import { useToast } from '../common/Toast';
import { useLanguage } from '../../features/settings/model/hooks';
import type { Gear } from '@/types';
import gearData from '../../data/gear/items.json';
import { sortGear } from '../../logic/gear/gearCalculator';
import { isGear, readNamedRecordValues } from '../../utils/dataGuards';

const BASE_GEAR = readNamedRecordValues(gearData, 'gear', isGear);

interface GearCardProps {
  item: Gear;
  onAdd: (item: Gear) => void;
  tr: (ru: string, en: string) => string;
}

function GearCard({ item, onAdd, tr }: GearCardProps) {
  const typeLabels: Record<string, string> = {
    medical: tr('Медицина', 'Medical'),
    drug: tr('Препарат', 'Drug'),
    explosive: tr('Взрывчатка', 'Explosive'),
    gadget: tr('Гаджет', 'Gadget'),
    drone: tr('Дрон', 'Drone'),
    cyberware: 'Cyberware'
  };

  return (
    <div className="gear-catalog-card card hover-lift transition-all duration-300 flex flex-col h-full">
      <div className="flex justify-between items-start gap-3 mb-2">
        <h3 className="ui-card-title">{item.name}</h3>
        <span className="text-cyber-green text-sm font-mono shrink-0">{item.cost} eb</span>
      </div>

      <p className="ui-body-sm mb-3 line-clamp-2">{item.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="ui-badge ui-badge--cyan">
            {typeLabels[item.type]}
          </span>
        {item.single_use && (
          <span className="ui-badge ui-badge--accent">
            {tr('Одноразовый', 'Single use')}
          </span>
        )}
        {item.charges && (
          <span className="ui-badge">
            {item.charges}{tr('зар', 'chg')}
          </span>
        )}
        {item.side_effects && (
          <span className="ui-badge ui-badge--orange">
            {tr('Побочки', 'Side effects')}
          </span>
        )}
      </div>

      {item.effect && (
        <div className="ui-meta mb-3 rounded-lg border border-cyber-gray/22 bg-cyber-dark/44 p-2.5 line-clamp-2">
          <span>{tr('Эффект', 'Effect')}: </span>
          <span className="text-cyber-green">{item.effect}</span>
        </div>
      )}

      <div className="ui-meta mt-auto flex items-center gap-2">
        <span>{item.weight}{tr('кг', 'kg')}</span>
        <span>•</span>
        <span className={
          item.availability === 'common' ? 'text-cyber-green' :
          item.availability === 'uncommon' ? 'text-cyber-yellow' : 'text-cyber-orange'
        }>
          {item.availability === 'common' ? tr('Обычное', 'Common') : item.availability === 'uncommon' ? tr('Необычное', 'Uncommon') : tr('Редкое', 'Rare')}
        </span>
      </div>

      <button
        onClick={() => onAdd(item)}
        className="btn w-full mt-3"
      >
        {tr('Добавить', 'Add')}
      </button>
    </div>
  );
}

export function GearList() {
  const character = useCharacterState();
  const { addGear } = useInventoryActions();
  const { updateMoney } = useCharacterCoreActions();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'cost'>('name');

  const gear = useMemo(() => {
    let result = [...BASE_GEAR];

    if (filterType !== 'all') {
      result = result.filter(g => g.type === filterType);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(g => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
    }

    return sortGear(result, sortBy as 'name' | 'cost');
  }, [filterType, search, sortBy]);

  // Инвентарь персонажа - отдельный список
  // - зависим от всего character, т.к. это создаёт новую ссылку при изменении
  const inventory = useMemo(() => character.gear || [], [character.gear]);

  const handleAddGear = (item: Gear) => {
    if (character.money < item.cost) {
      showToast(`${tr('Недостаточно денег! Нужно', 'Not enough money. Need')} ${item.cost}eb`, 'error');
      return;
    }

    addGear(item);
    updateMoney(character.money - item.cost);
    showToast(`${tr('Добавлено', 'Added')}: ${item.name} (-${item.cost}eb)`, 'success');
  };

  const gearTypes = [
    { value: 'all', label: tr('Все', 'All') },
    { value: 'medical', label: tr('Медицина', 'Medical') },
    { value: 'drug', label: tr('Препараты', 'Drugs') },
    { value: 'explosive', label: tr('Взрывчатка', 'Explosives') },
    { value: 'gadget', label: tr('Гаджеты', 'Gadgets') },
    { value: 'drone', label: tr('Дроны', 'Drones') }
  ];

  return (
    <div className="space-y-4">
      {/* - инвентарь персонажа (добавленные предметы) */}
      {inventory.length > 0 && (
      <div className="card-cyber border-cyber-cyan/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-cyber-cyan/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-cyber-cyan">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-cyber-cyan">{tr('Ваш инвентарь', 'Your inventory')}</h3>
              <p className="ui-meta">{inventory.length} {tr('предметов', 'items')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {inventory.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-cyber-dark/50 border border-cyber-gray/22">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-cyber-cyan/10 flex items-center justify-center text-cyber-cyan text-xs font-bold">
                    {item.name[0]}
                  </div>
                  <div>
                    <div className="ui-card-title">{item.name}</div>
                    <div className="ui-meta-compact">{item.type}</div>
                  </div>
                </div>
                <span className="text-cyber-green text-sm font-mono">{item.cost}eb</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-cyber gear-catalog-panel">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h3 className="text-lg font-bold text-cyber-text">{tr('Снаряжение', 'Gear')}</h3>
            <p className="ui-body-sm">{tr('Расходники, гаджеты и утилита в одном каталоге с быстрым поиском.', 'Consumables, gadgets, and utility items in one catalog with quick search.')}</p>
          </div>
          <div className="gear-money-card rounded-xl border border-cyber-cyan/20 bg-cyber-cyan/8 px-4 py-3 text-sm">
            <div className="text-cyber-muted">{tr('Эдди', 'Eddies')}</div>
            <div className="text-cyber-cyan font-mono font-bold text-xl leading-none mt-1">{character.money.toLocaleString()}eb</div>
          </div>
        </div>

        <div className="gear-filter-row flex flex-wrap gap-3 items-center">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          aria-label={tr('Фильтр снаряжения', 'Gear type filter')}
          className="gear-filter-select select"
        >
          {gearTypes.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder={tr('Поиск...', 'Search...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={tr('Поиск снаряжения', 'Search gear')}
          className="gear-filter-search-input input flex-1 min-w-[150px]"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'cost')}
          aria-label={tr('Сортировка снаряжения', 'Gear sorting')}
          className="gear-filter-select select"
        >
          <option value="name">{tr('По имени', 'By name')}</option>
          <option value="cost">{tr('По цене', 'By cost')}</option>
        </select>
        </div>

        <div className="gear-results-row flex items-center justify-between text-sm mt-4">
          <span className="ui-body-sm">
            {tr('Найдено', 'Found')}: <span className="text-cyber-text font-medium">{gear.length}</span> {tr('предметов', 'items')}
          </span>
          <span className="ui-body-sm hidden sm:inline">{tr('Редкие и утилитарные предметы ищутся быстрее', 'Rare and utility items are easier to scan')}</span>
        </div>
      </div>

      <div className="gear-catalog-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gear.map(item => (
          <GearCard
            key={item.id}
            item={item}
            tr={tr}
            onAdd={handleAddGear}
          />
        ))}
      </div>

      {gear.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-title">{tr('Снаряжение не найдено', 'No gear found')}</div>
          <div className="empty-state-description mb-0">{tr('Измените фильтр или поисковый запрос, чтобы увидеть больше позиций.', 'Change the filter or search query to see more items.')}</div>
        </div>
      )}
    </div>
  );
}

export default GearList;
