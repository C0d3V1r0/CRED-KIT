import type { ReactNode } from 'react';
import { Icons } from '../../utils/icons';
import type { Cyberdeck, InstalledProgram, NetProgram } from '@/types';

export function getProgramCost(program: NetProgram | InstalledProgram): number {
  return typeof program.level === 'number' ? program.level : 1;
}

export function getTypeColor(type: string) {
  switch (type) {
    case 'attack': return 'text-cyber-orange';
    case 'defense': return 'text-cyber-cyan';
    case 'booster': return 'text-cyber-green';
    case 'ice': return 'text-cyber-purple';
    case 'tracer': return 'text-cyber-pink';
    default: return 'text-cyber-muted';
  }
}

export function getTypeIcon(type: string) {
  switch (type) {
    case 'attack':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
          <path d="M12 2v20M2 12h20" />
        </svg>
      );
    case 'defense':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case 'booster':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case 'ice':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
        </svg>
      );
    case 'tracer':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      );
    default:
      return null;
  }
}

type TranslateFn = (ru: string, en: string) => string;

interface RamStats {
  total: number;
  used: number;
  free: number;
}

interface NetrunnerStatsCardProps {
  interfaceLevel: number;
  initValue: string;
  ramStats: RamStats;
  t: (key: string) => string;
}

export function NetrunnerStatsCard({ interfaceLevel, initValue, ramStats, t }: NetrunnerStatsCardProps) {
  return (
    <div className="card-cyber p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-cyber-green/20 flex items-center justify-center">
          <span className="text-cyber-green">{Icons.brain}</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-cyber-text">{t('netrunner.stats.title')}</h3>
          <p className="text-cyber-muted text-xs">{t('netrunner.stats.interfaceLevel')} {interfaceLevel}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
          <span className="text-cyber-muted text-sm">{t('netrunner.stats.interfaceLevel')}</span>
          <span className="text-cyber-cyan font-bold">{interfaceLevel}</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
          <span className="text-cyber-muted text-sm">INIT</span>
          <span className="text-cyber-green font-bold font-mono">{initValue}</span>
        </div>
        <hr className="border-cyber-gray/30" />
        <div className="flex items-center justify-between p-2 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
          <span className="text-cyber-accent text-sm font-medium">{t('netrunner.ram')}</span>
          <span className={`font-bold font-mono ${ramStats.free < 2 ? 'text-cyber-orange' : 'text-cyber-accent'}`}>
            {ramStats.used}/{ramStats.total}
          </span>
        </div>
      </div>
    </div>
  );
}

interface CurrentDeckCardProps {
  selectedDeck: Cyberdeck | null;
  tr: TranslateFn;
  onUnequip: () => void;
}

export function CurrentDeckCard({ selectedDeck, tr, onUnequip }: CurrentDeckCardProps) {
  return (
    <div className="card-cyber p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-cyber-purple/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-cyber-purple">
            <rect x="6" y="6" width="12" height="16" rx="2" />
            <path d="M6 10h12M9 14h6" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-cyber-text">{tr('Текущий нейролинк', 'Current cyberdeck')}</h3>
          <p className="text-cyber-muted text-xs">{selectedDeck ? selectedDeck.name : tr('Не выбран', 'Not selected')}</p>
        </div>
      </div>

      {selectedDeck ? (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
            <div className="flex items-center justify-between">
              <span className="font-medium text-cyber-text">{selectedDeck.name}</span>
              <span className="px-1.5 py-0.5 text-2xs rounded bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/30">
                {tr('Экипирован', 'Equipped')}
              </span>
            </div>
            <p className="text-cyber-muted text-xs mt-1">{selectedDeck.description}</p>
          </div>
          <div className="flex gap-3 text-sm">
            <MetricPill label="RAM" value={selectedDeck.ram} tone="cyan" />
            <MetricPill label="MU" value={selectedDeck.mu} tone="green" />
            <MetricPill label="Cost" value={`${selectedDeck.cost}eb`} tone="accent" />
          </div>
          <button
            onClick={onUnequip}
            className="w-full py-2 rounded-lg bg-cyber-orange/10 border border-cyber-orange/30 text-cyber-orange text-sm hover:bg-cyber-orange/20 transition-all"
          >
            {tr('Снять нейролинк', 'Unequip cyberdeck')}
          </button>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-cyber-dark flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-cyber-muted">
              <rect x="6" y="6" width="12" height="16" rx="2" />
              <path d="M6 10h12" />
            </svg>
          </div>
          <p className="text-cyber-muted text-sm">{tr('Нейролинк не выбран', 'No cyberdeck selected')}</p>
          <p className="text-cyber-muted text-xs mt-1">{tr('Выберите из списка ниже', 'Choose one from the list below')}</p>
        </div>
      )}
    </div>
  );
}

function MetricPill({ label, value, tone }: { label: string; value: string | number; tone: 'cyan' | 'green' | 'accent' }) {
  const toneClass = tone === 'cyan' ? 'metric-chip--cyan' : tone === 'green' ? 'metric-chip--green' : 'metric-chip--accent';
  return (
    <div className={`metric-chip ${toneClass} flex-1 justify-center text-center`}>
      <span className="metric-chip__label">{label}</span>
      <span className="metric-chip__value">{value}</span>
    </div>
  );
}

interface InstalledProgramsCardProps {
  installedPrograms: InstalledProgram[];
  tr: TranslateFn;
  onRemove: (id: string) => void;
}

export function InstalledProgramsCard({ installedPrograms, tr, onRemove }: InstalledProgramsCardProps) {
  return (
    <div className="card-cyber p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-cyber-cyan/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-cyber-cyan">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-cyber-text">{tr('Программы', 'Programs')}</h3>
          <p className="text-cyber-muted text-xs">{installedPrograms.length} {tr('установлено', 'installed')}</p>
        </div>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin" role="region" tabIndex={0} aria-label={tr('Установленные программы', 'Installed programs')}>
        {installedPrograms.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-cyber-muted text-xs">{tr('Программы не установлены', 'No programs installed')}</p>
          </div>
        ) : (
          installedPrograms.map((program) => (
            <div
              key={program.id}
              className="group flex items-center justify-between p-2.5 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30 hover:border-cyber-accent/30 transition-all"
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded flex items-center justify-center ${getTypeColor(program.type)} bg-current/10`}>
                  {getTypeIcon(program.type)}
                </div>
                <span className="text-cyber-text text-sm">{program.name}</span>
              </div>
              <button
                onClick={() => onRemove(program.id)}
                aria-label={tr(`Удалить программу ${program.name}`, `Remove program ${program.name}`)}
                title={tr('Удалить программу', 'Remove program')}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded bg-cyber-orange/20 border border-cyber-orange/30 text-cyber-orange text-xs hover:bg-cyber-orange/30 transition-all flex items-center justify-center"
              >
                <span className="w-3 h-3">{Icons.close}</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface TabItem {
  id: string;
  label: string;
  icon: ReactNode;
}

export function NetrunningTabs({
  tabs,
  activeTab,
  onTabChange
}: {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}) {
  return (
    <div className="module-tabs flex gap-1 p-1 bg-cyber-dark/50 rounded-xl border border-cyber-gray/30 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          data-testid={`net-tab-${tab.id}`}
          className={`module-tab-btn relative flex-1 min-w-[148px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
            activeTab === tab.id ? 'text-cyber-text' : 'text-cyber-muted hover:text-cyber-text'
          }`}
        >
          {activeTab === tab.id && (
            <div className="absolute inset-0 rounded-lg bg-cyber-accent/10 border border-cyber-accent/20" />
          )}
          <span className="relative z-10">{tab.icon}</span>
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

interface DeckSelectionGridProps {
  decks: Cyberdeck[];
  selectedDeck: Cyberdeck | null;
  tr: TranslateFn;
  onEquip: (deck: Cyberdeck) => void;
}

export function DeckSelectionGrid({ decks, selectedDeck, tr, onEquip }: DeckSelectionGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck) => (
        <div
          key={deck.id}
          data-testid={`deck-card-${deck.id}`}
          className={`group relative p-5 rounded-xl bg-cyber-dark/60 border cursor-pointer transition-all duration-300 hover-lift ${
            selectedDeck?.id === deck.id ? 'border-cyber-accent/50 bg-cyber-accent/5' : 'border-cyber-gray/30 hover:border-cyber-accent/30'
          }`}
          onClick={() => onEquip(deck)}
        >
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyber-accent/5 to-transparent" />
          </div>

          <div className="relative flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-bold transition-colors ${selectedDeck?.id === deck.id ? 'text-cyber-accent' : 'text-cyber-text'}`}>
                  {deck.name}
                </span>
                {selectedDeck?.id === deck.id && (
                  <span className="ui-badge ui-badge--cyan">
                    {tr('Выбран', 'Selected')}
                  </span>
                )}
              </div>
              <p className="text-cyber-muted text-xs line-clamp-2 mb-3">{deck.description}</p>

              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1 text-cyber-cyan">RAM: {deck.ram}</span>
                <span className="flex items-center gap-1 text-cyber-green">MU: {deck.mu}</span>
                <span className="flex items-center gap-1 text-cyber-accent">{deck.cost}eb</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ProgramBrowserProps {
  searchQuery: string;
  selectedProgram: NetProgram | null;
  filteredPrograms: NetProgram[];
  selectedDeck: Cyberdeck | null;
  ramStats: RamStats;
  tr: TranslateFn;
  onSearchChange: (value: string) => void;
  onSelectProgram: (program: NetProgram) => void;
  onInstallProgram: (program: NetProgram) => void;
}

export function ProgramBrowser({
  searchQuery,
  selectedProgram,
  filteredPrograms,
  selectedDeck,
  ramStats,
  tr,
  onSearchChange,
  onSelectProgram,
  onInstallProgram
}: ProgramBrowserProps) {
  return (
    <div className="card-cyber p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyber-cyan/12 text-cyber-cyan">
              {Icons.programs}
            </div>
            <div>
              <h3 className="text-lg font-bold text-cyber-text">{tr('Браузер программ', 'Program browser')}</h3>
              <p className="text-xs text-cyber-muted">
                {filteredPrograms.length} {tr('записей доступно для загрузки', 'entries available for install')}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl border px-3 py-2 text-xs ${
          selectedDeck
            ? 'border-cyber-green/20 bg-cyber-green/8 text-cyber-green'
            : 'border-cyber-orange/20 bg-cyber-orange/8 text-cyber-orange'
        }`}>
          {selectedDeck
            ? tr(`Свободно RAM: ${ramStats.free} из ${ramStats.total}`, `Free RAM: ${ramStats.free} of ${ramStats.total}`)
            : tr('Сначала выберите деку, затем загружайте софт', 'Pick a deck before loading software')}
        </div>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder={tr('Поиск...', 'Search...')}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="input w-full pl-10 focus:border-cyber-cyan"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin" role="region" tabIndex={0} aria-label={tr('Список программ', 'Program list')}>
        {filteredPrograms.length === 0 ? (
          <div className="empty-state rounded-xl border border-cyber-gray/24 bg-cyber-dark/45 px-6 py-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-cyber-dark/70 text-cyber-muted">
              {Icons.programs}
            </div>
            <p className="empty-state-title">{tr('Ничего не найдено', 'Nothing found')}</p>
            <p className="empty-state-description mb-0">
              {tr('Снимите фильтр поиска или переключитесь между программами и ICE.', 'Clear the search or switch between programs and ICE.')}
            </p>
          </div>
        ) : filteredPrograms.map((program) => {
          const isDisabled = !selectedDeck || ramStats.used + getProgramCost(program) > ramStats.total;

          return (
            <div
              key={program.id}
              data-testid={`net-program-card-${program.id}`}
              className={`group relative p-3 rounded-lg bg-cyber-dark/60 border cursor-pointer transition-all duration-300 ${
                selectedProgram?.id === program.id ? 'border-cyber-accent/50 bg-cyber-accent/5' : 'border-cyber-gray/30 hover:border-cyber-accent/30'
              }`}
              onClick={() => onSelectProgram(program)}
            >
              <div className="relative flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${getTypeColor(program.type)} bg-current/10`}>
                      {getTypeIcon(program.type)}
                    </div>
                    <span className={`font-medium text-sm ${selectedProgram?.id === program.id ? 'text-cyber-accent' : 'text-cyber-text'}`}>
                      {program.name}
                    </span>
                    <span className={`ui-badge ${program.type === 'attack'
                      ? 'ui-badge--orange'
                      : program.type === 'defense'
                        ? 'ui-badge--cyan'
                        : program.type === 'booster'
                          ? 'ui-badge--green'
                          : 'ui-badge--accent'}`}>
                      {program.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-cyber-muted text-xs mt-1 line-clamp-2 ml-8">{program.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs ml-8">
                    {program.strength && <span className="text-cyber-orange">STR: {program.strength}</span>}
                    {program.speed && <span className="text-cyber-cyan">SPD: {program.speed}</span>}
                    <span className="text-cyber-accent">{program.cost}eb</span>
                  </div>
                </div>
                <button
                  data-testid={`net-program-add-${program.id}`}
                  aria-label={tr(`Установить программу ${program.name}`, `Install program ${program.name}`)}
                  title={tr('Установить программу', 'Install program')}
                  className={`icon-action ml-2 text-sm ${
                    isDisabled
                      ? 'cursor-not-allowed border-cyber-gray/18 bg-cyber-gray/16 text-cyber-muted'
                      : 'icon-action--accent'
                  }`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onInstallProgram(program);
                  }}
                  disabled={isDisabled}
                >
                  <span className="w-4 h-4">{Icons.plus}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ProgramDetailsCardProps {
  selectedProgram: NetProgram;
  selectedDeck: Cyberdeck | null;
  ramStats: RamStats;
  tr: TranslateFn;
  onClose: () => void;
  onInstall: (program: NetProgram) => void;
}

export function ProgramDetailsCard({ selectedProgram, selectedDeck, ramStats, tr, onClose, onInstall }: ProgramDetailsCardProps) {
  const isDisabled = !selectedDeck || ramStats.used + getProgramCost(selectedProgram) > ramStats.total;

  return (
    <div className="card-cyber p-5 border-cyber-accent/50 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-10 rounded-full ${getTypeColor(selectedProgram.type).replace('text-', 'bg-')}`} />
          <div>
            <h3 className="text-lg font-bold text-cyber-text">{selectedProgram.name}</h3>
            <span className={`ui-badge ${selectedProgram.type === 'attack'
              ? 'ui-badge--orange'
              : selectedProgram.type === 'defense'
                ? 'ui-badge--cyan'
                : selectedProgram.type === 'booster'
                  ? 'ui-badge--green'
                  : 'ui-badge--accent'}`}>
              {selectedProgram.type.toUpperCase()}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label={tr('Закрыть карточку программы', 'Close program details')}
          title={tr('Закрыть', 'Close')}
          className="icon-action"
        >
          <span className="w-4 h-4">{Icons.close}</span>
        </button>
      </div>

      <p className="text-cyber-muted text-sm mb-4">{selectedProgram.description}</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <StatTile label={tr('Цена', 'Cost')} value={`${selectedProgram.cost}eb`} tone="accent" />
        {selectedProgram.strength && <StatTile label={tr('Сила', 'Strength')} value={selectedProgram.strength} tone="orange" />}
        {selectedProgram.speed && <StatTile label={tr('Скорость', 'Speed')} value={selectedProgram.speed} tone="cyan" />}
        {selectedProgram.danger_level && (
          <StatTile
            label={tr('Опасность', 'Danger')}
            value={selectedProgram.danger_level}
            tone={selectedProgram.danger_level === 'extreme' || selectedProgram.danger_level === 'high' ? 'orange' : 'green'}
          />
        )}
      </div>

      {selectedProgram.effects && (
        <div className="mb-4 p-3 rounded-lg bg-cyber-green/5 border border-cyber-green/20">
          <span className="text-cyber-green text-xs font-medium">{tr('Эффект', 'Effect')}</span>
          <p className="text-cyber-green text-sm mt-1">
            {typeof selectedProgram.effects === 'string' ? selectedProgram.effects : JSON.stringify(selectedProgram.effects)}
          </p>
        </div>
      )}

      <button
        data-testid="net-program-install"
        onClick={() => onInstall(selectedProgram)}
        disabled={isDisabled}
        className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
          !selectedDeck
            ? 'bg-cyber-gray/20 text-cyber-muted border border-cyber-gray/30 cursor-not-allowed'
            : isDisabled
              ? 'bg-cyber-orange/10 text-cyber-orange border border-cyber-orange/30'
              : 'bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/40 hover:bg-cyber-accent/30'
        }`}
      >
        {!selectedDeck
          ? tr('Нужен нейролинк', 'Cyberdeck required')
          : isDisabled
            ? tr('Недостаточно RAM', 'Not enough RAM')
            : tr('Установить программу', 'Install program')}
      </button>
    </div>
  );
}

function StatTile({ label, value, tone }: { label: string; value: string | number; tone: 'accent' | 'orange' | 'cyan' | 'green' }) {
  const textClass = tone === 'accent' ? 'text-cyber-accent' : tone === 'orange' ? 'text-cyber-orange' : tone === 'cyan' ? 'text-cyber-cyan' : 'text-cyber-green';
  return (
    <div className="p-2.5 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
      <span className="text-cyber-muted text-xs block">{label}</span>
      <span className={`${textClass} font-bold`}>{value}</span>
    </div>
  );
}

export function EmptyProgramDetails({ tr }: { tr: TranslateFn }) {
  return (
    <div className="empty-state card-cyber p-8">
      <div className="empty-state-icon w-16 h-16 mx-auto mb-4 rounded-full bg-cyber-dark/70 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-cyber-muted">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      </div>
      <p className="empty-state-title mb-2">{tr('Выберите программу', 'Select a program')}</p>
      <p className="empty-state-description mb-0">{tr('для просмотра деталей и быстрого сравнения характеристик', 'to view details and compare characteristics quickly')}</p>
    </div>
  );
}
