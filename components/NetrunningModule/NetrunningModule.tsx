import { useMemo, useState } from 'react';
import { useDerivedStats } from '../../entities/character/model/hooks';
import { useToast } from '../../components/common/Toast';
import { Icons } from '../../utils/icons';
import type { Cyberdeck, InstalledProgram, NetProgram } from '@/types';
import programsData from '../../data/netrunning/programs.json';
import iceData from '../../data/netrunning/ice.json';
import decksData from '../../data/netrunning/decks.json';
import { isCyberdeck, isNetProgram, readArrayData } from '../../utils/dataGuards';
import { HackSimulation } from './HackSimulation';
import { NetworkActionCalculator } from './NetworkActionCalculator';
import { ProgramConstructor } from './ProgramConstructor';
import { BlackICEViewer } from './BlackICEViewer';
import { useLanguage } from '../../features/settings/model/hooks';
import {
  CurrentDeckCard,
  DeckSelectionGrid,
  EmptyProgramDetails,
  getProgramCost,
  InstalledProgramsCard,
  NetrunnerStatsCard,
  NetrunningTabs,
  ProgramBrowser,
  ProgramDetailsCard
} from './NetrunningModuleView';

type NetrunningTab = 'programs' | 'ice' | 'deck' | 'hack' | 'actions' | 'constructor' | 'blackice';

const ALL_PROGRAMS = [
  ...readArrayData(programsData, isNetProgram),
  ...readArrayData(iceData, isNetProgram)
];

const CYBERDECKS = readArrayData(decksData, isCyberdeck);

export function NetrunningModule() {
  const derivedStats = useDerivedStats();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);

  const [activeTab, setActiveTab] = useState<NetrunningTab>('programs');
  const [selectedDeck, setSelectedDeck] = useState<Cyberdeck | null>(null);
  const [installedPrograms, setInstalledPrograms] = useState<InstalledProgram[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<NetProgram | null>(null);

  const filteredPrograms = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();

    return ALL_PROGRAMS.filter((program) => {
      const matchesSearch = program.name.toLowerCase().includes(normalizedQuery);
      const matchesType = activeTab === 'programs'
        ? ['attack', 'defense', 'booster', 'utility'].includes(program.type)
        : ['ice', 'tracer'].includes(program.type);
      return matchesSearch && matchesType;
    });
  }, [activeTab, searchQuery]);

  const ramStats = useMemo(() => {
    const total = selectedDeck?.ram ?? 0;
    const used = installedPrograms.reduce((sum, program) => sum + getProgramCost(program), 0);
    return { total, used, free: total - used };
  }, [installedPrograms, selectedDeck]);

  const installProgram = (program: NetProgram) => {
    if (!selectedDeck) {
      showToast(tr('Сначала выберите нейролинк!', 'Select a cyberdeck first.'), 'warning');
      return;
    }

    const cost = getProgramCost(program);
    if (ramStats.used + cost > ramStats.total) {
      showToast(tr('Недостаточно RAM!', 'Not enough RAM.'), 'error');
      return;
    }

    const installed: InstalledProgram = {
      ...program,
      installedAt: Date.now()
    };

    setInstalledPrograms((current) => [...current, installed]);
    setSelectedProgram(null);
    showToast(`${program.name} ${tr('установлен', 'installed')}`, 'success');
  };

  const uninstallProgram = (id: string) => {
    const program = installedPrograms.find((item) => item.id === id);
    setInstalledPrograms((current) => current.filter((item) => item.id !== id));

    if (program) {
      showToast(`${program.name} ${tr('удалён', 'removed')}`, 'info');
    }
  };

  const equipDeck = (deck: Cyberdeck) => {
    setSelectedDeck(deck);
    setInstalledPrograms([]);
    showToast(`${deck.name} ${tr('экипирован', 'equipped')}`, 'success');
  };

  const tabs = [
    { id: 'programs' as const, label: t('netrunner.tab.programs'), icon: Icons.programs },
    { id: 'ice' as const, label: 'ICE', icon: Icons.ice },
    { id: 'deck' as const, label: t('netrunner.tab.deck'), icon: Icons.deck },
    { id: 'hack' as const, label: t('netrunner.tab.hack'), icon: Icons.hack },
    {
      id: 'actions' as const,
      label: t('netrunner.tab.time'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )
    },
    {
      id: 'constructor' as const,
      label: t('netrunner.tab.create'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
          <path d="M12 5v14M5 12h14" />
        </svg>
      )
    },
    {
      id: 'blackice' as const,
      label: 'Black ICE',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-cyber-cyan/20 bg-cyber-dark/55 px-3 py-3 text-center">
          <div className="text-lg font-bold text-cyber-cyan">{derivedStats.interface}</div>
          <div className="ui-meta-compact">{tr('Интерфейс', 'Interface')}</div>
        </div>
        <div className="rounded-xl border border-cyber-green/20 bg-cyber-dark/55 px-3 py-3 text-center">
          <div className="text-lg font-bold text-cyber-green">{installedPrograms.length}</div>
          <div className="ui-meta-compact">{tr('Программы', 'Programs')}</div>
        </div>
        <div className="rounded-xl border border-cyber-accent/20 bg-cyber-dark/55 px-3 py-3 text-center">
          <div className="text-lg font-bold text-cyber-accent">{selectedDeck ? `${ramStats.free}/${ramStats.total}` : '--'}</div>
          <div className="ui-meta-compact">RAM</div>
        </div>
      </div>

      <div className="lg:hidden">
        <NetrunningTabs tabs={tabs} activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId as NetrunningTab)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <NetrunnerStatsCard
          interfaceLevel={derivedStats.interface}
          initValue={((derivedStats.stats.INT + derivedStats.stats.REF) / 2).toFixed(1)}
          ramStats={ramStats}
          t={t}
        />
        <CurrentDeckCard selectedDeck={selectedDeck} tr={tr} onUnequip={() => setSelectedDeck(null)} />
        <InstalledProgramsCard installedPrograms={installedPrograms} tr={tr} onRemove={uninstallProgram} />
      </div>

      <div className="hidden lg:block">
        <NetrunningTabs tabs={tabs} activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId as NetrunningTab)} />
      </div>

      {activeTab === 'hack' ? (
        <div>
          <h2 className="sr-only">{tr('Симулятор взлома', 'Hack simulator')}</h2>
          <HackSimulation />
        </div>
      ) : activeTab === 'actions' ? (
        <NetworkActionCalculator />
      ) : activeTab === 'constructor' ? (
        <ProgramConstructor />
      ) : activeTab === 'blackice' ? (
        <BlackICEViewer />
      ) : activeTab === 'deck' ? (
        <DeckSelectionGrid decks={CYBERDECKS} selectedDeck={selectedDeck} tr={tr} onEquip={equipDeck} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProgramBrowser
            searchQuery={searchQuery}
            selectedProgram={selectedProgram}
            filteredPrograms={filteredPrograms}
            selectedDeck={selectedDeck}
            ramStats={ramStats}
            tr={tr}
            onSearchChange={setSearchQuery}
            onSelectProgram={setSelectedProgram}
            onInstallProgram={installProgram}
          />
          <div>
            {selectedProgram ? (
              <ProgramDetailsCard
                selectedProgram={selectedProgram}
                selectedDeck={selectedDeck}
                ramStats={ramStats}
                tr={tr}
                onClose={() => setSelectedProgram(null)}
                onInstall={installProgram}
              />
            ) : (
              <EmptyProgramDetails tr={tr} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NetrunningModule;
