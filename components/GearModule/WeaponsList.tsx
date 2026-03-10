import { useState, useMemo } from 'react';
import {
  useCharacterCoreActions,
  useCharacterState,
  useCustomContentState,
  useInventoryActions
} from '../../entities/character/model/hooks';
import { useToast } from '../common/Toast';
import { useLanguage } from '../../features/settings/model/hooks';
import type { Weapon } from '@/types';
import weaponsData from '../../data/gear/weapons.json';
import { parseDamage, sortGear } from '../../logic/gear/gearCalculator';
import { isWeapon, readNamedRecordValues } from '../../utils/dataGuards';

const BASE_WEAPONS = readNamedRecordValues(weaponsData, 'weapons', isWeapon);

interface WeaponCardProps {
  weapon: Weapon;
  onAdd: (weapon: Weapon) => void;
  canAfford?: boolean;
  tr: (ru: string, en: string) => string;
}

function WeaponCard({ weapon, onAdd, canAfford = true, tr }: WeaponCardProps) {
  const damage = parseDamage(weapon.damage);

  return (
    <div className={`gear-catalog-card card hover-lift transition-all duration-300 flex flex-col h-full ${!canAfford ? 'border-cyber-orange/24 bg-cyber-orange/4' : ''}`}>
      <div className="flex justify-between items-start gap-3 mb-2">
        <h3 className="ui-card-title">{weapon.name}</h3>
        <span className={`text-sm font-mono shrink-0 ${canAfford ? 'text-cyber-green' : 'text-cyber-orange'}`}>
          {weapon.cost} eb
        </span>
      </div>

      <p className="ui-body-sm mb-3 line-clamp-2">{weapon.description}</p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
        <div className="flex items-center gap-1">
          <span className="ui-meta">{tr('Урон', 'Damage')}:</span>
          <span className="ui-meta font-medium font-mono text-cyber-text">{damage} ({weapon.damage})</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="ui-meta">{tr('Скорость', 'ROF')}:</span>
          <span className="ui-meta font-mono text-cyber-cyan">{weapon.rate_of_fire}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="ui-meta">{tr('Скрытность', 'Concealability')}:</span>
          <span className={`ui-meta ${
            weapon.concealability === 'easy' ? 'text-cyber-green' :
            weapon.concealability === 'medium' ? 'text-cyber-yellow' : 'text-cyber-orange'
          }`}>
            {weapon.concealability === 'easy' ? tr('Легко', 'Easy') : weapon.concealability === 'medium' ? tr('Средне', 'Medium') : tr('Сложно', 'Hard')}
          </span>
        </div>
        {weapon.ammo && (
          <div className="flex items-center gap-1">
            <span className="ui-meta">{tr('Патроны', 'Ammo')}:</span>
            <span className="ui-meta font-medium text-cyber-text">{weapon.ammo}</span>
          </div>
        )}
      </div>

      <button onClick={() => onAdd(weapon)} disabled={!canAfford} className={`btn w-full mt-auto ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {canAfford ? tr('Добавить', 'Add') : tr('Не хватает денег', 'Not enough money')}
      </button>
    </div>
  );
}

export function WeaponsList() {
  const character = useCharacterState();
  const customContent = useCustomContentState();
  const { updateMoney } = useCharacterCoreActions();
  const { addWeapon } = useInventoryActions();
  const { showToast } = useToast();
  const { language } = useLanguage();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'damage'>('name');

  const weapons = useMemo(() => {
    const customWeapons = customContent?.weapons || [];
    let result = [...BASE_WEAPONS, ...customWeapons];

    if (filterType !== 'all') {
      result = result.filter(w => w.type === filterType);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(w => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q));
    }

    return sortGear(result, sortBy);
  }, [filterType, search, sortBy, customContent]);

  const weaponTypes = [
    { value: 'all', label: tr('Все', 'All'), count: BASE_WEAPONS.length },
    { value: 'pistol', label: tr('Пистолеты', 'Pistols'), count: BASE_WEAPONS.filter((w) => w.type === 'pistol').length },
    { value: 'smg', label: tr('ПП', 'SMG'), count: BASE_WEAPONS.filter((w) => w.type === 'smg').length },
    { value: 'rifle', label: tr('Винтовки', 'Rifles'), count: BASE_WEAPONS.filter((w) => w.type === 'rifle').length },
    { value: 'shotgun', label: tr('Дробовики', 'Shotguns'), count: BASE_WEAPONS.filter((w) => w.type === 'shotgun').length },
    { value: 'melee', label: tr('Холодное', 'Melee'), count: BASE_WEAPONS.filter((w) => w.type === 'melee').length }
  ];

  const handleAddWeapon = (weapon: Weapon) => {
    if (character.money < weapon.cost) {
      showToast(`${tr('Недостаточно денег! Нужно', 'Not enough money. Need')} ${weapon.cost}eb`, 'error');
      return;
    }

    updateMoney(character.money - weapon.cost);
    addWeapon(weapon);
    showToast(`${tr('Добавлено', 'Added')}: ${weapon.name} (-${weapon.cost}eb)`, 'success');
  };

  return (
    <div className="space-y-4">
      <div className="card-cyber gear-catalog-panel">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h3 className="text-lg font-bold text-cyber-text">{tr('Оружие', 'Weapons')}</h3>
            <p className="ui-body-sm">{tr('Подберите ствол под бюджет и задачу без перегруженных списков.', 'Pick the right weapon for your budget and use case without overloaded lists.')}</p>
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
          aria-label={tr('Фильтр типа оружия', 'Weapon type filter')}
          className="gear-filter-select select"
        >
          {weaponTypes.map(t => (
            <option key={t.value} value={t.value}>{t.label} ({t.count})</option>
          ))}
        </select>

        <div className="gear-filter-search-wrap flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={tr('Поиск оружия...', 'Search weapons...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={tr('Поиск оружия', 'Search weapons')}
            className="input w-full"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'cost' | 'damage')}
          aria-label={tr('Сортировка оружия', 'Weapon sorting')}
          className="gear-filter-select select"
        >
          <option value="name">{tr('По имени', 'By name')}</option>
          <option value="cost">{tr('По цене', 'By cost')}</option>
          <option value="damage">{tr('По урону', 'By damage')}</option>
        </select>
        </div>

        <div className="gear-results-row flex items-center justify-between text-sm mt-4">
        <span className="ui-body-sm">
          {tr('Найдено', 'Found')}: <span className="text-cyber-text font-medium">{weapons.length}</span> {tr('предметов', 'items')}
        </span>
        <span className="ui-body-sm hidden sm:inline">{tr('Сортировка и фильтры применяются мгновенно', 'Filters and sorting update instantly')}</span>
        </div>
      </div>

      <div className="gear-catalog-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weapons.map(weapon => (
          <WeaponCard
            key={weapon.id}
            weapon={weapon}
            onAdd={handleAddWeapon}
            tr={tr}
            canAfford={character.money >= weapon.cost}
          />
        ))}
      </div>

      {weapons.length === 0 && (
        <div className="empty-state">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 3l-6 12-4 2-5-2L3 11"/>
          </svg>
          <div className="empty-state-title">{tr('Оружие не найдено', 'No weapons found')}</div>
          <div className="empty-state-description mb-0">{tr('Снимите часть фильтров или попробуйте другой поисковый запрос.', 'Clear some filters or try a different search query.')}</div>
        </div>
      )}
    </div>
  );
}

export default WeaponsList;
