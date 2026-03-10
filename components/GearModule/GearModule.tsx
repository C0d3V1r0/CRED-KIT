import { useState } from 'react';
import { useCharacterState, useInventoryActions } from '../../entities/character/model/hooks';
import { WeaponsList } from './WeaponsList';
import { ArmorList } from './ArmorList';
import { GearList } from './GearList';
import { GearConstructor } from './GearConstructor';
import { calculateGearStats } from '../../logic/gear/gearCalculator';
import { Icons } from '../../utils/icons';
import { useLanguage } from '../../features/settings/model/hooks';

type TabId = 'weapons' | 'armor' | 'gear' | 'inventory' | 'create';

export function GearModule() {
  const character = useCharacterState();
  const { t, language } = useLanguage();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);
  const [activeTab, setActiveTab] = useState<TabId>('weapons');
  const tabs = [
    { id: 'weapons' as const, label: t('gear.tab.weapons'), icon: Icons.weapons },
    { id: 'armor' as const, label: t('gear.tab.armor'), icon: Icons.armor },
    { id: 'gear' as const, label: t('gear.tab.gear'), icon: Icons.gear },
    { id: 'inventory' as const, label: t('gear.tab.inventory'), icon: Icons.about },
    { id: 'create' as const, label: t('gear.tab.create'), icon: Icons.cyberware }
  ];

  const weapons = character.weapons ?? [];
  const armor = character.armor ?? [];
  const gear = character.gear ?? [];
  const gearStats = calculateGearStats(weapons, armor, gear);

  const totalItems = weapons.length + armor.length + gear.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-cyber-text">{t('gear.title')}</h2>
          <p className="text-cyber-muted text-sm">{t('gear.subtitle')}</p>
        </div>

        <div className="gear-stats-row flex flex-wrap gap-2 text-sm">
          <div className="metric-chip metric-chip--cyan">
            <span className="metric-chip__label">{t('gear.stats.weight')}:</span>
            <span className="metric-chip__value">{gearStats.totalWeight} {tr('кг', 'kg')}</span>
          </div>
          <div className="metric-chip metric-chip--green">
            <span className="metric-chip__label">{tr('SP тело/голова', 'SP body/head')}:</span>
            <span className="metric-chip__value">{gearStats.armorBodySP}/{gearStats.armorHeadSP}</span>
          </div>
          <div className="metric-chip metric-chip--accent">
            <span className="metric-chip__label">{t('gear.stats.weapons')}:</span>
            <span className="metric-chip__value">{gearStats.weaponCount}</span>
          </div>
          <div className="metric-chip metric-chip--cyan">
            <span className="metric-chip__label">{t('gear.stats.items')}:</span>
            <span className="metric-chip__value">{totalItems}</span>
          </div>
        </div>
      </div>

      <div className="module-tabs gear-tabs flex gap-1 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            data-testid={`gear-tab-${tab.id}`}
            className={`module-tab-btn flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/30'
                : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-gray/20'
            }`}
          >
            <span className="w-5 h-5 shrink-0">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.id === 'inventory' && totalItems > 0 && (
              <span className="ui-badge ui-badge--cyan">
                {totalItems}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* - подсказка для новых пользователей */}
      {activeTab === 'gear' && (
        <div className="p-3 rounded-lg bg-cyber-green/5 border border-cyber-green/20 text-cyber-green text-xs flex items-center gap-2">
          <span>{Icons.info}</span>
          <span>
            {t('gear.hint.addToInventory')} <span className="font-medium">{t('gear.hint.inventory')}</span>
          </span>
        </div>
      )}

      <div className="min-h-[400px]">
        {activeTab === 'weapons' && <WeaponsList />}
        {activeTab === 'armor' && <ArmorList />}
        {activeTab === 'gear' && <GearList />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'create' && <GearConstructor />}
      </div>
    </div>
  );
}

function InventoryView() {
  const character = useCharacterState();
  const { removeWeapon, removeArmor, removeGear } = useInventoryActions();
  const { t, language } = useLanguage();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);
  const inventory = character || { weapons: [], armor: [], gear: [] };
  const totalItems = (inventory.weapons?.length || 0) + (inventory.armor?.length || 0) + (inventory.gear?.length || 0);

  const handleRemoveItem = (type: 'weapons' | 'armor' | 'gear', index: number) => {
    if (type === 'weapons') removeWeapon(index);
    else if (type === 'armor') removeArmor(index);
    else if (type === 'gear') removeGear(index);
  };

  if (totalItems === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 text-cyber-gray/40 flex items-center justify-center">
          <span className="w-10 h-10">{Icons.about}</span>
        </div>
        <h3 className="text-lg font-bold text-cyber-text mb-2">{t('gear.emptyInventory.title')}</h3>
        <p className="text-cyber-muted">{t('gear.emptyInventory.desc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(inventory.weapons?.length || 0) > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-cyber-muted uppercase tracking-wider">
            <span className="w-4 h-4 text-cyber-accent">{Icons.weapons}</span>
            {t('gear.tab.weapons')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(inventory.weapons || []).map((item, i) => (
              <div key={i} className="card flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-cyber-text truncate">{item.name}</div>
                  <div className="text-xs text-cyber-muted">{item.damage} {tr('урона', 'damage')}</div>
                </div>
                <button
                  onClick={() => handleRemoveItem('weapons', i)}
                  className="text-cyber-muted hover:text-cyber-accent p-1.5 shrink-0 transition-colors"
                  title={tr('Удалить', 'Remove')}
                >
                  <span className="w-4 h-4 block">{Icons.close}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(inventory.armor?.length || 0) > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-cyber-muted uppercase tracking-wider">
            <span className="w-4 h-4 text-cyber-green">{Icons.armor}</span>
            {t('gear.tab.armor')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(inventory.armor || []).map((item, i) => (
              <div key={i} className="card flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-cyber-text truncate">{item.name}</div>
                  <div className="text-xs text-cyber-muted">{item.sp} SP</div>
                </div>
                <button
                  onClick={() => handleRemoveItem('armor', i)}
                  className="text-cyber-muted hover:text-cyber-accent p-1.5 shrink-0 transition-colors"
                  title={tr('Удалить', 'Remove')}
                >
                  <span className="w-4 h-4 block">{Icons.close}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(inventory.gear?.length || 0) > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-cyber-muted uppercase tracking-wider">
            <span className="w-4 h-4 text-cyber-cyan">{Icons.gear}</span>
            {t('gear.tab.gear')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(inventory.gear || []).map((item, i) => (
              <div key={i} className="card flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-cyber-text truncate">{item.name}</div>
                  <div className="text-xs text-cyber-muted truncate">{item.effect || item.description?.slice(0, 40)}</div>
                </div>
                <button
                  onClick={() => handleRemoveItem('gear', i)}
                  className="text-cyber-muted hover:text-cyber-accent p-1.5 shrink-0 transition-colors"
                  title={tr('Удалить', 'Remove')}
                >
                  <span className="w-4 h-4 block">{Icons.close}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GearModule;
