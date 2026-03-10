import { useEffect, useState } from 'react';
import {
  useCharacterCoreActions,
  useCharacterPersistenceActions,
  useCharacterState,
  useCharacterStatus,
  useCyberwareActions,
  useDerivedStats
} from '../../entities/character/model/hooks';
import { useLanguage } from '../../features/settings/model/hooks';
import { ConfirmDialog } from '../common/Modal';
import { useToast } from '../common/Toast';
import { exportCharacterToPdf } from '../../utils/pdfExport';
import SkillsPanel from './SkillsPanel';
import QuickCharacterGen from './QuickCharacterGen';
import {
  BasicInfoCard,
  CharacterResourcesCard,
  createStatDrafts,
  DerivedStatsGrid,
  InstalledCyberwareCard,
  RoleAbilityCard,
  StatsEditorCard
} from './CharacterSheetSections';
import type { StatKey } from '@/types';

function CharacterSheet() {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);
  const subtabs = [
    { id: 'basic' as const, label: tr('Персонаж', 'Character') },
    { id: 'skills' as const, label: tr('Навыки', 'Skills') },
    { id: 'quick' as const, label: tr('Генератор', 'Generator') }
  ];
  const [activeSubtab, setActiveSubtab] = useState<'basic' | 'skills' | 'quick'>('basic');
  const [damageInput, setDamageInput] = useState('');
  const [healInput, setHealInput] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const character = useCharacterState();
  const derivedStats = useDerivedStats();
  const { isLoading } = useCharacterStatus();
  const { updateStat, updateBasicInfo, updateMoney, updateResource } = useCharacterCoreActions();
  const { removeCyberware } = useCyberwareActions();
  const { resetCharacter } = useCharacterPersistenceActions();
  const [statDrafts, setStatDrafts] = useState<Record<StatKey, string>>(() => createStatDrafts(character.stats));

  useEffect(() => {
    setStatDrafts(createStatDrafts(character.stats));
  }, [character.stats]);

  const handlePdfExport = () => {
    try {
      exportCharacterToPdf(character, derivedStats, language);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : tr('Не удалось открыть окно печати', 'Failed to open print window'),
        'error'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="module-tabs flex gap-1 p-1 bg-cyber-dark/50 rounded-xl border border-cyber-gray/30 overflow-x-auto scrollbar-hide">
        {subtabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubtab(tab.id)}
            data-testid={`character-subtab-${tab.id}`}
            className={`module-tab-btn relative flex-1 min-w-[132px] px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
              activeSubtab === tab.id ? 'text-cyber-text' : 'text-cyber-text/80 hover:text-cyber-text'
            }`}
          >
            {activeSubtab === tab.id && (
              <div className="absolute inset-0 rounded-lg bg-cyber-accent/10 border border-cyber-accent/20" />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeSubtab === 'basic' && (
        <div className="space-y-6 animate-fade-in">
          <BasicInfoCard
            character={character}
            isLoading={isLoading}
            tr={tr}
            onNameChange={(name) => updateBasicInfo({ name })}
            onRoleChange={(role) => updateBasicInfo({ role })}
            onLevelChange={(level) => updateBasicInfo({ level })}
            onRoleAbilityRankChange={(roleAbilityRank) => updateBasicInfo({ roleAbilityRank })}
            onMoneyChange={updateMoney}
            onExportPdf={handlePdfExport}
            onOpenResetDialog={() => setIsResetDialogOpen(true)}
          />

          <DerivedStatsGrid derivedStats={derivedStats} language={language} tr={tr} />

          <RoleAbilityCard character={character} tr={tr} />

          <StatsEditorCard
            character={character}
            statDrafts={statDrafts}
            setStatDrafts={setStatDrafts}
            tr={tr}
            updateStat={updateStat}
          />

          <CharacterResourcesCard
            character={character}
            derivedStats={derivedStats}
            language={language}
            damageInput={damageInput}
            healInput={healInput}
            setDamageInput={setDamageInput}
            setHealInput={setHealInput}
            tr={tr}
            updateResource={updateResource}
          />

          <InstalledCyberwareCard
            character={character}
            derivedStats={derivedStats}
            tr={tr}
            onRemove={removeCyberware}
          />
        </div>
      )}

      {activeSubtab === 'skills' && (
        <div className="animate-fade-in">
          <SkillsPanel />
        </div>
      )}

      {activeSubtab === 'quick' && (
        <div className="animate-fade-in">
          <QuickCharacterGen />
        </div>
      )}

      <ConfirmDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={resetCharacter}
        title={tr('Новый персонаж', 'New character')}
        message={tr(
          'Создать нового персонажа? Все изменения будут потеряны.',
          'Create new character? All unsaved changes will be lost.'
        )}
        confirmText={tr('Создать', 'Create')}
        cancelText={tr('Отмена', 'Cancel')}
        variant="warning"
      />
    </div>
  );
}

export default CharacterSheet;
