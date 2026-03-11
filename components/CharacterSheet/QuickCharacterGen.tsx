import { useState, useCallback } from 'react';
import {
  useCharacterCoreActions,
  useCharacterPersistenceActions
} from '../../entities/character/model/hooks';
import { useToast } from '../../components/common/Toast';
import { useLanguage } from '../../features/settings/model/hooks';
import { Icons } from '../../utils/icons';
import type { Role, StatKey } from '@/types';

// Роли с описаниями
const ROLES: { id: Role; label: { ru: string; en: string }; desc: { ru: string; en: string }; stats: StatKey[] }[] = [
  { id: 'Solo', label: { ru: 'Соло', en: 'Solo' }, desc: { ru: 'Наёмный убийца', en: 'Mercenary killer' }, stats: ['REF', 'DEX', 'WILL'] },
  { id: 'Netrunner', label: { ru: 'Нетраннер', en: 'Netrunner' }, desc: { ru: 'Хакер', en: 'Hacker' }, stats: ['INT', 'TECH', 'WILL'] },
  { id: 'Tech', label: { ru: 'Техник', en: 'Tech' }, desc: { ru: 'Инженер', en: 'Engineer' }, stats: ['TECH', 'INT', 'DEX'] },
  { id: 'Medtech', label: { ru: 'Медтех', en: 'Medtech' }, desc: { ru: 'Врач', en: 'Doctor' }, stats: ['TECH', 'INT', 'WILL'] },
  { id: 'Exec', label: { ru: 'Корпорат', en: 'Exec' }, desc: { ru: 'Корпоративный управленец', en: 'Corporate manager' }, stats: ['COOL', 'INT', 'TECH'] },
  { id: 'Lawman', label: { ru: 'Лоумен', en: 'Lawman' }, desc: { ru: 'Полицейский', en: 'Police officer' }, stats: ['REF', 'COOL', 'BODY'] },
  { id: 'Fixer', label: { ru: 'Фиксер', en: 'Fixer' }, desc: { ru: 'Брокер', en: 'Broker' }, stats: ['INT', 'COOL', 'LUCK'] },
  { id: 'Media', label: { ru: 'Медиа', en: 'Media' }, desc: { ru: 'Журналист', en: 'Journalist' }, stats: ['INT', 'COOL', 'LUCK'] },
  { id: 'Rocker', label: { ru: 'Рокер', en: 'Rocker' }, desc: { ru: 'Музыкант', en: 'Musician' }, stats: ['DEX', 'COOL', 'LUCK'] },
  { id: 'Nomad', label: { ru: 'Номад', en: 'Nomad' }, desc: { ru: 'Бродяга', en: 'Wanderer' }, stats: ['BODY', 'REF', 'TECH'] }
];

// Шаблоны персонажей
const TEMPLATES = [
  { id: 'balanced', label: { ru: 'Сбалансированный', en: 'Balanced' }, desc: { ru: 'Универсальный персонаж', en: 'All-round character' } },
  { id: 'combat', label: { ru: 'Боец', en: 'Combat' }, desc: { ru: 'Фокус на боевых навыках', en: 'Focus on combat skills' } },
  { id: 'hacker', label: { ru: 'Хакер', en: 'Hacker' }, desc: { ru: 'Фокус на взломе', en: 'Focus on hacking' } },
  { id: 'social', label: { ru: 'Социум', en: 'Social' }, desc: { ru: 'Фокус на общении', en: 'Focus on social skills' } }
] as const;

export function QuickCharacterGen() {
  const { updateStat, updateBasicInfo } = useCharacterCoreActions();
  const { resetCharacter } = useCharacterPersistenceActions();
  const { showToast } = useToast();
  const { language } = useLanguage();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);

  const [step, setStep] = useState<'role' | 'template' | 'stats' | 'complete'>('role');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('balanced');
  const [generatedStats, setGeneratedStats] = useState<Record<StatKey, number> | null>(null);
  const [characterName, setCharacterName] = useState('');

  // Сгенерировать случайное имя
  const generateName = useCallback(() => {
    const prefixes = ['Night', 'Cyber', 'Neon', 'Chrome', 'Street', 'Edge', 'Zero', 'Razor', 'Ghost', 'Phantom'];
    const suffixes = ['Wolf', 'Blade', 'Viper', 'Hawk', 'Rider', 'Coder', 'Jack', 'Nova', 'Strike', 'Shadow'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    setCharacterName(`${prefix}${suffix}`);
  }, []);

  // Сгенерировать характеристики
  const generateStats = useCallback(() => {
    const stats: Record<StatKey, number> = {
      INT: 0, REF: 0, DEX: 0, TECH: 0, WILL: 0, COOL: 0, LUCK: 0, MOVE: 0, BODY: 0, EMP: 0
    };

    // Базовое распределение: 67 очков на 10 характеристик (среднее ~6-7)
    const totalPoints = 67;
    let remaining = totalPoints;

    // Для каждой характеристики назначаем значение
    const statKeys = Object.keys(stats) as StatKey[];

    // Распределяем очки
    statKeys.forEach((key, index) => {
      if (index === statKeys.length - 1) {
        // Последняя получает всё оставшееся
        stats[key] = Math.max(2, remaining);
      } else {
        // Случайное значение от 2 до 10, но с учётом оставшихся
        const min = 2;
        const max = remaining - (statKeys.length - index - 1) * 2;
        const value = Math.floor(Math.random() * (max - min + 1)) + min;
        stats[key] = value;
        remaining -= value;
      }
    });

    // Применяем бонус роли
    if (selectedRole) {
      const role = ROLES.find(r => r.id === selectedRole);
      if (role) {
        role.stats.forEach(stat => {
          stats[stat] += 1;
        });
      }
    }

    // Применяем шаблон
    if (selectedTemplate === 'combat') {
      stats.REF += 2;
      stats.DEX += 1;
      stats.BODY += 1;
      stats.INT = Math.max(2, stats.INT - 1);
    } else if (selectedTemplate === 'hacker') {
      stats.INT += 2;
      stats.TECH += 1;
      stats.WILL += 1;
      stats.REF = Math.max(2, stats.REF - 1);
    } else if (selectedTemplate === 'social') {
      stats.COOL += 2;
      stats.EMP += 1;
      stats.LUCK += 1;
      stats.TECH = Math.max(2, stats.TECH - 1);
    }

    (Object.keys(stats) as StatKey[]).forEach((key) => {
      stats[key] = Math.min(10, Math.max(2, stats[key]));
    });

    setGeneratedStats(stats);
    setStep('stats');
  }, [selectedRole, selectedTemplate]);

  // Применить сгенерированного персонажа
  const applyCharacter = () => {
    if (!generatedStats) return;

    // Сбрасываем и применяем новые значения
    resetCharacter();

    // Применяем имя
    if (characterName) {
      updateBasicInfo({ name: characterName });
    }

    // Применяем роль
    if (selectedRole) {
      updateBasicInfo({ role: selectedRole });
    }

    // Применяем характеристики
    Object.entries(generatedStats).forEach(([key, value]) => {
      updateStat(key as StatKey, value);
    });

    showToast(tr(`Персонаж ${characterName || 'создан'} готов!`, `Character ${characterName || 'created'} is ready!`), 'success');
    setStep('complete');
  };

  // Начать заново
  const startOver = () => {
    setStep('role');
    setSelectedRole(null);
    setSelectedTemplate('balanced');
    setGeneratedStats(null);
    setCharacterName('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* - заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyber-green/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-cyber-green">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-cyber-text">{tr('Быстрый генератор', 'Quick generator')}</h2>
          <p className="text-cyber-muted text-xs">{tr('Создайте персонажа за 3 шага', 'Create a character in 3 steps')}</p>
        </div>
      </div>

      {/* - прогресс */}
      <div className="flex gap-2">
        {['role', 'template', 'stats'].map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-all ${
              ['role', 'template', 'stats', 'complete'].indexOf(step) > i
                ? 'bg-cyber-accent'
                : 'bg-cyber-gray/30'
            }`}
          />
        ))}
      </div>

      {/* - ШАГ 1: Выбор роли */}
      {step === 'role' && (
        <div className="card-cyber p-6 animate-fade-in">
          <h3 className="text-lg font-bold text-cyber-text mb-4">{tr('Шаг 1: Выберите роль', 'Step 1: Choose role')}</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedRole === role.id
                    ? 'bg-cyber-accent/12 border-cyber-accent/34 text-cyber-text shadow-[0_10px_20px_rgba(0,0,0,0.16)]'
                    : 'bg-cyber-dark/54 border-cyber-gray/24 text-cyber-muted hover:text-cyber-text hover:border-cyber-gray/42'
                }`}
              >
                <div className="font-medium text-sm">{tr(role.label.ru, role.label.en)}</div>
                <div className="text-xs mt-1 opacity-70">{tr(role.desc.ru, role.desc.en)}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setSelectedRole(null)}
              className="flex-1 py-2.5 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30 text-cyber-muted hover:text-cyber-text transition-all"
            >
              {tr('Пропустить', 'Skip')}
            </button>
            <button
              onClick={() => setStep('template')}
              disabled={!selectedRole}
              className="flex-1 py-2.5 rounded-lg bg-cyber-accent/20 border border-cyber-accent/40 text-cyber-accent hover:bg-cyber-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tr('Дальше', 'Next')}
            </button>
          </div>
        </div>
      )}

      {/* - ШАГ 2: Выбор шаблона */}
      {step === 'template' && (
        <div className="card-cyber p-6 animate-fade-in">
          <h3 className="text-lg font-bold text-cyber-text mb-4">{tr('Шаг 2: Выберите стиль', 'Step 2: Choose style')}</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedTemplate === template.id
                    ? 'bg-cyber-accent/12 border-cyber-accent/34 text-cyber-text shadow-[0_10px_20px_rgba(0,0,0,0.16)]'
                    : 'bg-cyber-dark/54 border-cyber-gray/24 text-cyber-muted hover:text-cyber-text hover:border-cyber-gray/42'
                }`}
              >
                <div className="font-medium">{tr(template.label.ru, template.label.en)}</div>
                <div className="text-xs mt-1 opacity-70">{tr(template.desc.ru, template.desc.en)}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep('role')}
              className="flex-1 py-2.5 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30 text-cyber-muted hover:text-cyber-text transition-all"
            >
              {tr('← Назад', '← Back')}
            </button>
            <button
              onClick={generateStats}
              className="flex-1 py-2.5 rounded-lg bg-cyber-accent/20 border border-cyber-accent/40 text-cyber-accent hover:bg-cyber-accent/30 transition-all flex items-center justify-center gap-2"
            >
              {Icons.dice}
              <span>{tr('Бросить кубики', 'Roll dice')}</span>
            </button>
          </div>
        </div>
      )}

      {/* - ШАГ 3: Результат */}
      {step === 'stats' && generatedStats && (
        <div className="card-cyber p-6 animate-fade-in">
          <h3 className="text-lg font-bold text-cyber-text mb-4">{tr('Шаг 3: Проверьте характеристики', 'Step 3: Review stats')}</h3>

          {/* - имя */}
          <div className="mb-4">
            <label className="block text-cyber-muted text-xs mb-2">{tr('Имя персонажа', 'Character name')}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="input flex-1"
                placeholder={tr('Или нажмите 🎲', 'Or roll 🎲')}
              />
              <button
                onClick={generateName}
                className="px-4 py-2 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30 text-cyber-muted hover:text-cyber-cyan transition-all"
              >
                {Icons.dice}
              </button>
            </div>
          </div>

          {/* - характеристики */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3 mb-4">
            {(Object.keys(generatedStats) as StatKey[]).map(key => {
              const value = generatedStats[key];
              const isHigh = value >= 8;
              const isLow = value <= 3;

              return (
                <div key={key} className="text-center">
                  <div className={`text-xs mb-1 ${
                    isHigh ? 'text-cyber-green' : isLow ? 'text-cyber-orange' : 'text-cyber-muted'
                  }`}>
                    {key}
                  </div>
                  <div className={`text-xl font-bold font-mono py-3 rounded-xl ${
                    isHigh ? 'bg-cyber-green/10 border border-cyber-green/24' :
                    isLow ? 'bg-cyber-orange/10 border border-cyber-orange/24' :
                    'bg-cyber-dark/52 border border-cyber-gray/20'
                  }`}>
                    {value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* - роль */}
          {selectedRole && (
            <div className="p-4 rounded-xl bg-cyber-dark/52 border border-cyber-gray/22 mb-4">
              <span className="text-cyber-muted text-xs">{tr('Роль', 'Role')}: </span>
              <span className="text-cyber-accent">{selectedRole ? tr(ROLES.find(r => r.id === selectedRole)?.label.ru || '', ROLES.find(r => r.id === selectedRole)?.label.en || '') : ''}</span>
              <span className="text-cyber-muted text-xs mx-2">|</span>
              <span className="text-cyber-muted text-xs">{tr('Шаблон', 'Template')}: </span>
              <span className="text-cyber-cyan">{tr(TEMPLATES.find(t => t.id === selectedTemplate)?.label.ru || '', TEMPLATES.find(t => t.id === selectedTemplate)?.label.en || '')}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep('template')}
              className="flex-1 py-2.5 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30 text-cyber-muted hover:text-cyber-text transition-all"
            >
              {tr('← Назад', '← Back')}
            </button>
            <button
              onClick={generateStats}
              className="flex-1 py-2.5 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30 text-cyber-muted hover:text-cyber-cyan transition-all flex items-center justify-center gap-2"
            >
              {Icons.refresh}
              <span>{tr('Перебросить', 'Reroll')}</span>
            </button>
            <button
              onClick={applyCharacter}
              className="flex-1 py-2.5 rounded-lg bg-cyber-green/20 border border-cyber-green/40 text-cyber-green hover:bg-cyber-green/30 transition-all flex items-center justify-center gap-2"
            >
              {Icons.check}
              <span>{tr('Применить', 'Apply')}</span>
            </button>
          </div>
        </div>
      )}

      {/* - Готово */}
      {step === 'complete' && (
        <div className="empty-state card-cyber p-8 text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cyber-green/16 border border-cyber-green/28 flex items-center justify-center">
            <span className="text-4xl">✓</span>
          </div>
          <h3 className="text-xl font-bold text-cyber-text mb-2">{tr('Персонаж создан!', 'Character created!')}</h3>
          <p className="text-cyber-muted mb-6">{tr('Персонаж готов к приключениям в Night City', 'Your character is ready for adventures in Night City')}</p>
          <button
            onClick={startOver}
            className="px-6 py-3 rounded-lg bg-cyber-accent/20 border border-cyber-accent/40 text-cyber-accent hover:bg-cyber-accent/30 transition-all"
          >
            {tr('Создать ещё одного', 'Create another one')}
          </button>
        </div>
      )}
    </div>
  );
}

export default QuickCharacterGen;
