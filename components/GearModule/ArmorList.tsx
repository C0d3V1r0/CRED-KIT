import { useState, useMemo } from 'react';
import {
  useCharacterCoreActions,
  useCharacterState,
  useCustomContentState,
  useInventoryActions
} from '../../entities/character/model/hooks';
import { useToast } from '../common/Toast';
import { useLanguage } from '../../features/settings/model/hooks';
import type { Armor } from '@/types';
import armorData from '../../data/gear/armor.json';
import { sortGear } from '../../logic/gear/gearCalculator';
import { isArmor, readNamedRecordValues } from '../../utils/dataGuards';

const BASE_ARMOR = readNamedRecordValues(armorData, 'armor', isArmor);

interface ArmorCardProps {
  armor: Armor;
  onAdd: (armor: Armor) => void;
  canAfford?: boolean;
  tr: (ru: string, en: string) => string;
}

function ArmorCard({ armor, onAdd, canAfford = true, tr }: ArmorCardProps) {
  const locationLabels: Record<string, string> = {
    head: tr('Голова', 'Head'),
    torso: tr('Торс', 'Torso'),
    arms: tr('Руки', 'Arms'),
    legs: tr('Ноги', 'Legs')
  };

  return (
    <div className={`gear-catalog-card card hover-lift transition-all duration-300 flex flex-col h-full ${!canAfford ? 'border-cyber-orange/24 bg-cyber-orange/4' : ''}`}>
      <div className="flex justify-between items-start gap-3 mb-2">
        <h3 className="ui-card-title">{armor.name}</h3>
        <span className={`text-sm font-mono shrink-0 ${canAfford ? 'text-cyber-green' : 'text-cyber-orange'}`}>
          {armor.cost} eb
        </span>
      </div>

      <p className="ui-body-sm mb-3 line-clamp-2">{armor.description}</p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
        <div className="flex items-center gap-1">
          <span className="ui-meta">SP:</span>
          <span className="ui-meta font-mono font-bold text-cyber-green">{armor.sp}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="ui-meta">{tr('Вес', 'Weight')}:</span>
          <span className="ui-meta text-cyber-cyan">{armor.weight} {tr('кг', 'kg')}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="ui-meta">{tr('Скрытность', 'Concealability')}:</span>
          <span className={`ui-meta ${
            armor.concealability === 'easy' ? 'text-cyber-green' :
            armor.concealability === 'medium' ? 'text-cyber-yellow' :
            armor.concealability === 'hard' ? 'text-cyber-orange' : 'text-cyber-purple'
          }`}>
            {armor.concealability === 'easy' ? tr('Легко', 'Easy') : armor.concealability === 'medium' ? tr('Средне', 'Medium') : armor.concealability === 'hard' ? tr('Сложно', 'Hard') : tr('Всегда', 'Always')}
          </span>
        </div>
        <div className="col-span-2 flex items-center gap-1">
          <span className="ui-meta">{tr('Зоны', 'Zones')}:</span>
          <div className="flex gap-1">
            {armor.locations.map(loc => (
              <span key={loc} className="ui-badge">
                {locationLabels[loc]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {armor.requires_implant && (
        <div className="mb-2">
          <span className="ui-badge ui-badge--accent">
          {tr('Требует имплант', 'Requires implant')}
          </span>
        </div>
      )}

      <button
        onClick={() => onAdd(armor)}
        disabled={!canAfford}
        className={`btn w-full mt-auto ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {canAfford ? tr('Добавить', 'Add') : tr('Не хватает денег', 'Not enough money')}
      </button>
    </div>
  );
}

export function ArmorList() {
  const character = useCharacterState();
  const customContent = useCustomContentState();
  const { updateMoney } = useCharacterCoreActions();
  const { addArmor } = useInventoryActions();
  const { showToast } = useToast();
  const { language } = useLanguage();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'sp'>('name');

  const armor = useMemo(() => {
    const customArmor = customContent?.armor || [];
    let result = [...BASE_ARMOR, ...customArmor];

    if (filterType !== 'all') {
      result = result.filter(a => a.type === filterType);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }

    return sortGear(result, sortBy as 'name' | 'cost' | 'damage');
  }, [filterType, search, sortBy, customContent]);

  const armorTypes = [
    { value: 'all', label: tr('Все', 'All'), count: BASE_ARMOR.length },
    { value: 'clothing', label: tr('Одежда', 'Clothing'), count: BASE_ARMOR.filter((a) => a.type === 'clothing').length },
    { value: 'vest', label: tr('Жилеты', 'Vests'), count: BASE_ARMOR.filter((a) => a.type === 'vest').length },
    { value: 'full', label: tr('Костюмы', 'Suits'), count: BASE_ARMOR.filter((a) => a.type === 'full').length },
    { value: 'helmet', label: tr('Шлемы', 'Helmets'), count: BASE_ARMOR.filter((a) => a.type === 'helmet').length },
    { value: 'subdermal', label: tr('Импланты', 'Implants'), count: BASE_ARMOR.filter((a) => a.type === 'subdermal').length }
  ];

  const handleAddArmor = (item: Armor) => {
    if (character.money < item.cost) {
      showToast(`${tr('Недостаточно денег! Нужно', 'Not enough money. Need')} ${item.cost}eb`, 'error');
      return;
    }

    updateMoney(character.money - item.cost);
    addArmor(item);
    showToast(`${tr('Добавлено', 'Added')}: ${item.name} (-${item.cost}eb)`, 'success');
  };

  return (
    <div className="space-y-4">
      <div className="card-cyber gear-catalog-panel">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h3 className="text-lg font-bold text-cyber-text">{tr('Броня', 'Armor')}</h3>
            <p className="ui-body-sm">{tr('Сравнивайте защиту, скрытность и зоны попадания без визуальной каши.', 'Compare protection, concealability, and body coverage without visual clutter.')}</p>
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
          aria-label={tr('Фильтр типа брони', 'Armor type filter')}
          className="gear-filter-select select"
        >
          {armorTypes.map(t => (
            <option key={t.value} value={t.value}>{t.label} ({t.count})</option>
          ))}
        </select>

        <div className="gear-filter-search-wrap flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={tr('Поиск брони...', 'Search armor...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={tr('Поиск брони', 'Search armor')}
            className="input w-full"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'cost' | 'sp')}
          aria-label={tr('Сортировка брони', 'Armor sorting')}
          className="gear-filter-select select"
        >
          <option value="name">{tr('По имени', 'By name')}</option>
          <option value="cost">{tr('По цене', 'By cost')}</option>
          <option value="sp">{tr('По защите', 'By armor')}</option>
        </select>
        </div>

        <div className="gear-results-row flex items-center justify-between text-sm mt-4">
        <span className="ui-body-sm">
          {tr('Найдено', 'Found')}: <span className="text-cyber-text font-medium">{armor.length}</span> {tr('предметов', 'items')}
        </span>
        <span className="ui-body-sm hidden sm:inline">{tr('Смотрите SP и зоны рядом, без лишних шагов', 'See SP and coverage at a glance')}</span>
        </div>
      </div>

      {/* сетка карточек */}
      <div className="gear-catalog-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {armor.map(item => (
          <ArmorCard
            key={item.id}
            armor={item}
            onAdd={handleAddArmor}
            tr={tr}
            canAfford={character.money >= item.cost}
          />
        ))}
      </div>

      {armor.length === 0 && (
        <div className="empty-state">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <div className="empty-state-title">{tr('Броня не найдена', 'No armor found')}</div>
          <div className="empty-state-description mb-0">{tr('Упростите фильтры или измените поисковую фразу.', 'Relax the filters or change the search phrase.')}</div>
        </div>
      )}
    </div>
  );
}

export default ArmorList;
