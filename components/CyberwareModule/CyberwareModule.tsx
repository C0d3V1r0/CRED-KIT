import { useEffect, useMemo, useState } from 'react';
import {
  useCharacterState,
  useCustomContentState,
  useCyberwareActions,
  useDerivedStats
} from '../../entities/character/model/hooks';
import { Icons } from '../../utils/icons';
import { checkImplantCompatibility, checkSlotLimits } from '../../logic/cyberware/humanityCalculator';
import { formatSlot } from '../../utils/dice';
import { HumanityMeter } from './HumanityMeter';
import { BodySchematic } from './BodySchematic';
import { BlackChromeLab } from './BlackChromeLab';
import {
  ImplantCard,
  ImplantDetails,
  buildBodyZoneCounts,
  getLocalizedImplantDescription,
  getLocalizedImplantName,
  ZONE_SLOT_MAP
} from './CyberwareViews';
import { useLanguage } from '../../features/settings/model/hooks';
import standardImplants from '../../data/implants/standard.json';
import { isCyberware, readArrayData } from '../../utils/dataGuards';
import type { Cyberware, CyberwareSlot } from '@/types';

interface CyberwareModuleProps {
  implants?: Cyberware[];
}

const STANDARD_IMPLANTS = readArrayData(standardImplants, isCyberware);

const CyberwareModule = ({ implants }: CyberwareModuleProps) => {
  const { t, language } = useLanguage();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);
  const character = useCharacterState();
  const derivedStats = useDerivedStats();
  const customContent = useCustomContentState();
  const { addCyberware, removeCyberware } = useCyberwareActions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedSlot, setSelectedSlot] = useState<CyberwareSlot | null>(null);
  const [selectedImplant, setSelectedImplant] = useState<Cyberware | null>(null);
  const [activeView, setActiveView] = useState<'browser' | 'lab'>('browser');

  useEffect(() => {
    if (!selectedImplant) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImplant(null);
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [selectedImplant]);

  const allImplants = useMemo(() => {
    const baseImplants = implants ?? STANDARD_IMPLANTS;
    const customImplants = customContent.cyberware.filter((item) => !('damage' in item) && !('sp' in item));
    return [...baseImplants, ...customImplants];
  }, [implants, customContent.cyberware]);

  const filteredImplants = useMemo(() => {
    return allImplants.filter((implant) => {
      const q = searchTerm.toLowerCase();
      const localizedName = getLocalizedImplantName(implant, language).toLowerCase();
      const localizedDescription = getLocalizedImplantDescription(implant, language).toLowerCase();
      const matchesSearch = localizedName.includes(q) || localizedDescription.includes(q);
      if (selectedSlot && implant.slot !== selectedSlot) {
        return false;
      }

      if (selectedZone === 'all') {
        return matchesSearch;
      }

      const allowedSlots = ZONE_SLOT_MAP[selectedZone] ?? [];
      return matchesSearch && allowedSlots.includes(implant.slot);
    });
  }, [allImplants, language, searchTerm, selectedZone, selectedSlot]);

  const compatibility = selectedImplant ? checkImplantCompatibility(selectedImplant, character.cyberware) : null;
  const slotLimits = checkSlotLimits(character.cyberware);
  const selectedSlotImplant = selectedSlot ? character.cyberware.find((item) => item.slot === selectedSlot) ?? null : null;
  const selectedImplantInstalled = selectedImplant ? character.cyberware.some((item) => item.id === selectedImplant.id) : false;

  const handleZoneClick = (zone: string) => {
    setSelectedZone(zone);
    setSelectedSlot(null);
  };

  const handleSlotClick = (slot: CyberwareSlot) => {
    setSelectedSlot(slot);
    setSelectedZone('all');
  };

  const handleSlotRemove = (slot: CyberwareSlot) => {
    const index = character.cyberware.findIndex((item) => item.slot === slot);
    if (index >= 0) {
      removeCyberware(index);
      setSelectedSlot(null);
    }
  };

  const handleInstall = (implant: Cyberware) => {
    const check = checkImplantCompatibility(implant, character.cyberware);
    if (check.compatible) {
      addCyberware(implant);
      setSelectedImplant(null);
      setSelectedSlot(null);
    }
  };

  const bodyZoneCounts = useMemo(() => buildBodyZoneCounts(allImplants), [allImplants]);
  const bodyZones = [
    { id: 'all', label: tr('Все', 'All'), count: bodyZoneCounts.all },
    { id: 'head', label: tr('Голова', 'Head'), count: bodyZoneCounts.head },
    { id: 'torso', label: tr('Торс', 'Torso'), count: bodyZoneCounts.torso },
    { id: 'arm_l', label: tr('Рука Л', 'Left arm'), count: bodyZoneCounts.arm_l },
    { id: 'arm_r', label: tr('Рука П', 'Right arm'), count: bodyZoneCounts.arm_r },
    { id: 'leg_l', label: tr('Нога Л', 'Left leg'), count: bodyZoneCounts.leg_l },
    { id: 'leg_r', label: tr('Нога П', 'Right leg'), count: bodyZoneCounts.leg_r }
  ] as const;
  const occupiedSlots = character.cyberware.length;
  const totalSlotCount = Object.keys(ZONE_SLOT_MAP).reduce((sum, zoneId) => sum + (ZONE_SLOT_MAP[zoneId]?.length ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="sr-only">{t('cyberware.title')}</h2>

      <div className="module-tabs flex gap-1 p-1 bg-cyber-dark/50 rounded-xl border border-cyber-gray/30 overflow-x-auto scrollbar-hide">
        <button
          data-testid="cyberware-view-browser"
          onClick={() => setActiveView('browser')}
          className={`module-tab-btn relative flex-1 min-w-[170px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
            activeView === 'browser' ? 'text-cyber-text' : 'text-cyber-muted hover:text-cyber-text'
          }`}
        >
          {activeView === 'browser' && (
            <div className="absolute inset-0 rounded-lg bg-cyber-accent/10 border border-cyber-accent/20" />
          )}
          <span className="relative z-10">{Icons.chip}</span>
          <span className="relative z-10">{t('cyberware.view.database')}</span>
        </button>
        <button
          data-testid="cyberware-view-lab"
          onClick={() => setActiveView('lab')}
          className={`module-tab-btn relative flex-1 min-w-[170px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
            activeView === 'lab' ? 'text-cyber-text' : 'text-cyber-muted hover:text-cyber-text'
          }`}
        >
          {activeView === 'lab' && (
            <div className="absolute inset-0 rounded-lg bg-cyber-accent/10 border border-cyber-accent/20" />
          )}
          <span className="relative z-10">{Icons.lab}</span>
          <span className="relative z-10">{t('cyberware.view.lab')}</span>
          {customContent.cyberware.length > 0 && (
            <span className="relative z-10 px-1.5 py-0.5 text-2xs rounded bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30">
              {customContent.cyberware.length}
            </span>
          )}
        </button>
      </div>

      {activeView === 'lab' && <BlackChromeLab />}

      {activeView === 'browser' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="order-2 space-y-4 lg:order-1">
            <div className="card-cyber">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyber-accent/20 flex items-center justify-center">
                  <span className="text-cyber-accent">{Icons.search}</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-cyber-text">{t('cyberware.view.database')}</h2>
                  <p className="text-cyber-muted text-xs">{filteredImplants.length} {tr('имплантов', 'implants')}</p>
                </div>
              </div>

              <div className="relative mb-4">
                <input
                  data-testid="cyberware-search"
                  type="text"
                  placeholder={t('cyberware.search.placeholder')}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="input w-full pl-10 focus:border-cyber-cyan"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {bodyZones.map((zone) => (
                  <button
                    data-testid={`cyberware-zone-${zone.id}`}
                    key={zone.id}
                    onClick={() => handleZoneClick(zone.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                      selectedZone === zone.id && !selectedSlot
                        ? 'bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/40'
                        : 'bg-cyber-dark/60 text-cyber-muted border border-cyber-gray/30 hover:text-cyber-text hover:border-cyber-gray/50'
                    }`}
                  >
                    <span>{zone.label}</span>
                    <span className={`px-1.5 py-0.5 rounded text-2xs ${selectedZone === zone.id && !selectedSlot ? 'bg-cyber-accent/30' : 'bg-cyber-gray/40'}`}>
                      {zone.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin">
              {filteredImplants.length === 0 ? (
                <div className="empty-state card-cyber p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyber-dark/70 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-cyber-muted">
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                      <path d="M9 9h6v6H9z" />
                    </svg>
                  </div>
                  <p className="empty-state-title">{t('cyberware.list.empty')}</p>
                  <p className="empty-state-description mb-0">{tr('Попробуйте снять фильтр по зоне или очистить поиск, чтобы увидеть больше имплантов.', 'Try clearing the zone filter or search to see more implants.')}</p>
                </div>
              ) : (
                filteredImplants.map((implant) => (
                  <ImplantCard
                    key={implant.id}
                    implant={implant}
                    onClick={() => setSelectedImplant(implant)}
                    isInstalled={character.cyberware.some((item) => item.id === implant.id)}
                    isSelected={selectedImplant?.id === implant.id}
                  />
                ))
              )}
            </div>

            {character.cyberware.length > 0 && (
              <div className="card-cyber border-cyber-accent/24">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-cyber-accent/20 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-cyber-accent">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-cyber-text">{t('cyberware.installed.title')}</h3>
                    <p className="text-cyber-muted text-xs">{character.cyberware.length} {t('cyberware.installed.count')}</p>
                  </div>
                  <div className="ml-auto px-2 py-1 rounded bg-cyber-accent/10 border border-cyber-accent/20">
                    <span className="text-cyber-accent text-xs font-medium">-{derivedStats.totalHL} HL</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {character.cyberware.map((implant, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-cyber-dark/50 border border-cyber-gray/22 hover:border-cyber-accent/24 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-cyber-accent" />
                        <div>
                          <div className="font-medium text-cyber-text text-sm">{getLocalizedImplantName(implant, language)}</div>
                          <div className="text-cyber-muted text-xs flex items-center gap-2">
                            <span>{formatSlot(implant.slot, language)}</span>
                            <span className="text-cyber-orange">-{implant.hl} HL</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeCyberware(index)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-orange/10 text-cyber-orange border border-cyber-orange/24 hover:bg-cyber-orange/16 transition-all text-xs">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                        <span className="font-medium">{tr('Удалить', 'Remove')}</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-3 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/16 flex items-center gap-2 text-cyber-cyan text-xs">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <span>{tr('Клик по слоту на схеме тела -> детали импланта -> кнопка удаления', 'Click a body slot -> implant details -> remove button')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="order-1 space-y-4 lg:order-2">
            <div className="card-cyber border-cyber-cyan/20 bg-gradient-to-br from-cyber-cyan/8 via-cyber-dark/60 to-cyber-purple/8">
              <div className="space-y-4">
                <div className="max-w-3xl">
                  <div className="ui-kicker rounded-full border border-cyber-cyan/20 bg-cyber-cyan/10 px-3 py-1 text-cyber-cyan">
                    <span>{Icons.chip}</span>
                    <span>{tr('Хром-контур', 'Chrome overview')}</span>
                  </div>
                  <h2 className="max-w-[24ch] text-base font-bold leading-[1.2] text-cyber-text sm:text-[1.3rem]">
                    {tr('Схема имплантов и нагрузка на человечность', 'Implant map and humanity load')}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-cyber-muted">
                    {tr(
                      'Сначала ориентируйтесь по схеме тела, потом уже докручивайте список. Так экран меньше перегружает и быстрее показывает, где реально осталось место под апгрейды.',
                      'Start from the body map and only then drill into the list. It reduces noise and shows where upgrades still fit.'
                    )}
                  </p>
                  <div className="mt-4 hidden xl:flex flex-wrap gap-2">
                    <div className="metric-chip metric-chip--green">
                      <span className="metric-chip__label">{tr('Человечность', 'Humanity')}</span>
                      <span className="metric-chip__value">{derivedStats.humanity} / {derivedStats.maxHumanity}</span>
                    </div>
                    <div className="metric-chip metric-chip--accent">
                      <span className="metric-chip__label">HL</span>
                      <span className="metric-chip__value">{derivedStats.totalHL}</span>
                    </div>
                    <div className="metric-chip metric-chip--cyan">
                      <span className="metric-chip__label">{tr('Статус', 'State')}</span>
                      <span className="metric-chip__value">{tr('Нормальный', 'Stable')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 sm:min-w-[336px]">
                    <div className="min-w-0 rounded-xl border border-cyber-cyan/20 bg-cyber-dark/55 px-2.5 py-3 text-center">
                      <div className="text-lg font-bold text-cyber-cyan">{occupiedSlots}</div>
                      <div className="text-[11px] leading-tight text-cyber-muted">{tr('Установлено', 'Installed')}</div>
                    </div>
                    <div className="min-w-0 rounded-xl border border-cyber-accent/20 bg-cyber-dark/55 px-2.5 py-3 text-center">
                      <div className="text-lg font-bold text-cyber-accent">{totalSlotCount}</div>
                      <div className="text-[11px] leading-tight text-cyber-muted">{tr('Всего слотов', 'Total slots')}</div>
                    </div>
                    <div className="min-w-0 rounded-xl border border-cyber-green/20 bg-cyber-dark/55 px-2.5 py-3 text-center">
                      <div className="text-lg font-bold text-cyber-green">{derivedStats.humanity}</div>
                      <div className="text-[11px] leading-tight text-cyber-muted">{tr('Человечность', 'Humanity')}</div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-cyber-cyan/16 bg-cyber-dark/45 px-3 py-2.5 text-xs text-cyber-muted">
                    {tr('Схема тела теперь главный экран, а каталог и детали работают как второй слой.', 'The body map stays primary now, while the catalog and details act as the second layer.')}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-cyber">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyber-purple/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-cyber-purple">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-cyber-text">{tr('Схема тела', 'Body diagram')}</h2>
                  <p className="text-cyber-muted text-xs">{character.cyberware.length} {tr('установлено', 'installed')}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="p-2 rounded-lg bg-cyber-dark/50 border border-cyber-gray/22 text-center">
                  <div className="text-lg font-bold text-cyber-purple">{slotLimits.zoneCounts.head}</div>
                  <div className="text-2xs text-cyber-muted">{tr('Голова', 'Head')}</div>
                </div>
                <div className="p-2 rounded-lg bg-cyber-dark/50 border border-cyber-gray/22 text-center">
                  <div className="text-lg font-bold text-cyber-cyan">{slotLimits.zoneCounts.torso}</div>
                  <div className="text-2xs text-cyber-muted">{tr('Торс', 'Torso')}</div>
                </div>
                <div className="p-2 rounded-lg bg-cyber-dark/50 border border-cyber-gray/22 text-center">
                  <div className="text-lg font-bold text-cyber-yellow">{slotLimits.zoneCounts.arms}</div>
                  <div className="text-2xs text-cyber-muted">{tr('Руки', 'Arms')}</div>
                </div>
                <div className="p-2 rounded-lg bg-cyber-dark/50 border border-cyber-gray/22 text-center">
                  <div className="text-lg font-bold text-cyber-green">{slotLimits.zoneCounts.legs}</div>
                  <div className="text-2xs text-cyber-muted">{tr('Ноги', 'Legs')}</div>
                </div>
              </div>

              <BodySchematic
                cyberware={character.cyberware}
                onZoneClick={handleZoneClick}
                onSlotClick={handleSlotClick}
                onSlotRemove={handleSlotRemove}
                selectedSlot={selectedSlot}
              />
            </div>

            {selectedSlot && (
              <div className="card-cyber border-cyber-cyan/28">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyber-cyan/20 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-cyber-cyan">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-cyber-cyan">{formatSlot(selectedSlot, language)}</h3>
                    <p className="text-cyber-muted text-xs">
                      {selectedSlotImplant
                        ? `${tr('Установлен', 'Installed')}: ${getLocalizedImplantName(selectedSlotImplant, language)}`
                        : tr('Слот пуст', 'Slot is empty')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="xl:hidden">
              <HumanityMeter
                currentHL={derivedStats.totalHL}
                maxHumanity={derivedStats.maxHumanity}
                humanity={derivedStats.humanity}
                showDetails={true}
              />
            </div>
          </div>
        </div>
      )}

      {selectedImplant && (
        <div
          className="fixed inset-0 z-[70] bg-cyber-black/75 backdrop-blur-sm p-3 md:p-6 overflow-y-auto"
          onClick={() => setSelectedImplant(null)}
        >
          <div className="min-h-full flex items-center justify-center">
            <div className="w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
              <ImplantDetails
                implant={selectedImplant}
                compatibility={compatibility}
                isInstalled={selectedImplantInstalled}
                onInstall={() => handleInstall(selectedImplant)}
                onClose={() => setSelectedImplant(null)}
                onRemove={() => {
                  const index = character.cyberware.findIndex((item) => item.id === selectedImplant.id);
                  if (index >= 0) {
                    removeCyberware(index);
                    setSelectedImplant(null);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CyberwareModule;
