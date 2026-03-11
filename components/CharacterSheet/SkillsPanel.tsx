import { useEffect, useMemo, useState } from 'react';
import {
  useCharacterCoreActions,
  useCharacterState
} from '../../entities/character/model/hooks';
import { useLanguage } from '../../features/settings/model/hooks';
import skillsData from '../../data/skills.json';
import { calculateSkillBonuses } from '../../logic/character/statsCalculator';
import type { CustomCombatSkill, SkillDefinition, SkillCategory } from '@/types';

const SKILLS = skillsData.skills as Record<string, SkillDefinition>;
const SKILL_CATEGORIES = skillsData.categories as Record<string, SkillCategory>;
const CATEGORY_ORDER = ['Awareness', 'Body', 'Control', 'Education', 'Fighting', 'Ranged Weapon', 'Social', 'Performance', 'Technique'];
const CATEGORY_LABELS_EN: Record<string, string> = {
  Awareness: 'Awareness',
  Body: 'Body',
  Control: 'Control',
  Education: 'Education',
  Fighting: 'Fighting',
  'Ranged Weapon': 'Ranged Weapon',
  Social: 'Social',
  Performance: 'Performance',
  Technique: 'Technique'
};
const CUSTOM_COMBAT_SKILL_COUNT = 3;
const SKILLS_PER_PAGE = 10;

const getDefaultLevels = (): Record<string, number> => {
  const levels: Record<string, number> = {};

  for (const key of Object.keys(SKILLS)) {
    levels[key] = 0;
  }

  return levels;
};

const createDefaultCustomCombatSkills = (): CustomCombatSkill[] => {
  const skills: CustomCombatSkill[] = [];

  for (let index = 0; index < CUSTOM_COMBAT_SKILL_COUNT; index += 1) {
    skills.push({
      id: `custom-combat-${index + 1}`,
      name: '',
      description: '',
      level: 0
    });
  }

  return skills;
};

const normalizeCustomCombatSkills = (skills: CustomCombatSkill[] | undefined): CustomCombatSkill[] => {
  const normalized = skills ? [...skills] : createDefaultCustomCombatSkills();

  while (normalized.length < CUSTOM_COMBAT_SKILL_COUNT) {
    normalized.push({
      id: `custom-combat-${normalized.length + 1}`,
      name: '',
      description: '',
      level: 0
    });
  }

  return normalized.slice(0, CUSTOM_COMBAT_SKILL_COUNT);
};

type FilteredSkill = SkillDefinition & {
  key: string;
  level: number;
};

function SkillsPanel() {
  const character = useCharacterState();
  const { updateSkills, updateCustomCombatSkills } = useCharacterCoreActions();
  const { language } = useLanguage();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const allSkillLevels = useMemo(
    () => ({ ...getDefaultLevels(), ...(character.skills || {}) }),
    [character.skills]
  );
  const customCombatSkills = useMemo(
    () => normalizeCustomCombatSkills(character.customCombatSkills),
    [character.customCombatSkills]
  );
  const skillBonuses = useMemo(
    () => calculateSkillBonuses(character.cyberware || []),
    [character.cyberware]
  );

  const filteredSkills = useMemo<FilteredSkill[]>(() => {
    return Object.entries(SKILLS)
      .filter(([key, skill]) => {
        if (selectedCategory !== 'all' && skill.category !== selectedCategory) {
          return false;
        }

        if (!searchQuery) {
          return true;
        }

        const normalizedQuery = searchQuery.toLowerCase();
        const matchesLabel = skill.label.toLowerCase().includes(normalizedQuery);
        const matchesKey = key.toLowerCase().includes(normalizedQuery);

        return matchesLabel || matchesKey;
      })
      .map(([key, skill]) => ({
        key,
        ...skill,
        level: allSkillLevels[key] || 0
      }));
  }, [allSkillLevels, searchQuery, selectedCategory]);

  const filteredCustomCombatSkills = useMemo(() => {
    return customCombatSkills.filter((skill) => {
      if (selectedCategory !== 'all' && selectedCategory !== 'Fighting') {
        return false;
      }

      if (!searchQuery) {
        return true;
      }

      const normalizedQuery = searchQuery.toLowerCase();
      return skill.name.toLowerCase().includes(normalizedQuery) || skill.description.toLowerCase().includes(normalizedQuery);
    });
  }, [customCombatSkills, searchQuery, selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const totalSkillPages = Math.max(1, Math.ceil(filteredSkills.length / SKILLS_PER_PAGE));
  const paginatedSkills = useMemo(
    () => filteredSkills.slice((currentPage - 1) * SKILLS_PER_PAGE, currentPage * SKILLS_PER_PAGE),
    [currentPage, filteredSkills]
  );

  const updateSkillLevel = (skillKey: string, value: string | number) => {
    const parsed = parseInt(String(value), 10);
    const newLevel = Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    updateSkills({
      ...allSkillLevels,
      [skillKey]: newLevel
    });
  };

  const updateCustomCombatSkill = (
    index: number,
    field: keyof Omit<CustomCombatSkill, 'id'>,
    value: string | number
  ) => {
    const nextSkills = customCombatSkills.map((skill, skillIndex) => {
      if (skillIndex !== index) {
        return skill;
      }

      if (field === 'level') {
        const parsed = parseInt(String(value), 10);
        return {
          ...skill,
          level: Number.isNaN(parsed) ? 0 : Math.max(0, parsed)
        };
      }

      return {
        ...skill,
        [field]: String(value)
      };
    });

    updateCustomCombatSkills(nextSkills);
  };

  const calculateModifier = (stat: string, level: number, skillKey?: string): number => {
    const statValue = Number(character.stats[stat as keyof typeof character.stats]) || 0;
    const implantBonus = skillKey ? (skillBonuses[skillKey] || 0) : 0;
    return statValue + (Number(level) || 0) + implantBonus;
  };

  const categoryStats = useMemo(() => {
    const stats: Record<string, { skills: number; points: number }> = {};
    let total = 0;
    let points = 0;

    for (const category of CATEGORY_ORDER) {
      const categorySkills = Object.entries(SKILLS).filter(([, skill]) => skill.category === category);
      const basePoints = categorySkills.reduce((sum, [skillKey]) => sum + (allSkillLevels[skillKey] || 0), 0);
      const customPoints = category === 'Fighting'
        ? customCombatSkills.reduce((sum, skill) => sum + skill.level, 0)
        : 0;
      const customCount = category === 'Fighting' ? customCombatSkills.length : 0;

      stats[category] = {
        skills: categorySkills.length + customCount,
        points: basePoints + customPoints
      };
      total += categorySkills.length + customCount;
      points += basePoints + customPoints;
    }

    return {
      categories: stats,
      total,
      points
    };
  }, [allSkillLevels, customCombatSkills]);

  return (
    <div className="space-y-4">
      <div className="card-cyber">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-cyber-text">{tr('Навыки', 'Skills')}</h2>
            <p className="text-cyber-muted text-sm">{tr('Выберите категорию, найдите нужный навык и редактируйте страницу без длинной простыни ниже.', 'Pick a category, find the skill you need, and edit one page at a time instead of scrolling through a long list.')}</p>
          </div>
          <div className="rounded-xl border border-cyber-accent/24 bg-cyber-accent/8 px-4 py-3 text-sm">
            <div className="text-cyber-muted">{tr('Всего очков', 'Total points')}</div>
            <div className="text-cyber-accent font-bold font-mono text-xl leading-none mt-1">{categoryStats.points}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]">
          <div>
            <label htmlFor="skills-category" className="block ui-meta mb-2">
              {tr('Категория', 'Category')}
            </label>
            <select
              id="skills-category"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="select w-full"
            >
              <option value="all">
                {tr('Все навыки', 'All skills')} ({categoryStats.total})
              </option>
              {CATEGORY_ORDER.map((category) => (
                <option key={category} value={category}>
                  {language === 'ru'
                    ? (SKILL_CATEGORIES[category]?.label || category)
                    : (CATEGORY_LABELS_EN[category] || category)} ({categoryStats.categories[category]?.skills || 0})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="skills-search" className="block ui-meta mb-2">
              {tr('Поиск', 'Search')}
            </label>
            <input
              id="skills-search"
              type="text"
              placeholder={tr('Поиск навыка...', 'Search skill...')}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      <div className="card-cyber overflow-hidden">
        {filteredSkills.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-b border-cyber-gray/14 px-4 py-3 text-sm md:px-5">
            <div className="text-cyber-muted">
              {tr('Показано', 'Showing')} <span className="text-cyber-text font-medium">{paginatedSkills.length}</span> {tr('из', 'of')} <span className="text-cyber-text font-medium">{filteredSkills.length}</span>
            </div>
            <div className="text-cyber-muted">
              {tr('Страница', 'Page')} <span className="text-cyber-text font-medium">{currentPage}</span> / <span className="text-cyber-text font-medium">{totalSkillPages}</span>
            </div>
          </div>
        )}

        <div className="space-y-3 md:hidden">
          {paginatedSkills.map((skill) => {
            const implantBonus = skillBonuses[skill.key] || 0;
            const modifier = calculateModifier(skill.stat, skill.level, skill.key);
            const statValue = character.stats[skill.stat] || 0;

            return (
              <div key={skill.key} className="rounded-xl border border-cyber-gray/18 bg-cyber-dark/44 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-cyber-text truncate" title={language === 'ru' ? skill.label : skill.key}>
                      {language === 'ru' ? skill.label : skill.key}
                    </div>
                    <div className="text-cyber-muted text-xs mt-1">
                      {language === 'ru' ? SKILL_CATEGORIES[skill.category]?.label : CATEGORY_LABELS_EN[skill.category]}
                    </div>
                    {skill.multiplier === 2 && (
                      <div className="text-cyber-orange text-2xs mt-1">x2</div>
                    )}
                  </div>
                  <span className="inline-flex rounded-lg border border-cyber-gray/22 bg-cyber-dark/60 px-2 py-1 text-2xs text-cyber-muted shrink-0">
                    {skill.stat} {statValue}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => updateSkillLevel(skill.key, skill.level - 1)}
                    className="w-9 h-9 rounded-lg border border-cyber-gray/24 bg-cyber-dark/60 hover:border-cyber-accent/34 hover:text-cyber-accent transition-colors flex items-center justify-center text-base shrink-0"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={skill.level}
                    onChange={(event) => updateSkillLevel(skill.key, event.target.value)}
                    className="input w-16 text-center font-mono font-bold text-sm py-2 px-2 shrink-0"
                  />
                  <button
                    onClick={() => updateSkillLevel(skill.key, skill.level + 1)}
                    className="w-9 h-9 rounded-lg border border-cyber-gray/24 bg-cyber-dark/60 hover:border-cyber-accent/34 hover:text-cyber-accent transition-colors flex items-center justify-center text-base shrink-0"
                  >
                    +
                  </button>
                  <div className="ml-auto text-right">
                    <div className="text-cyber-cyan font-mono text-lg font-bold leading-none">+{modifier}</div>
                    <div className="text-cyber-muted text-2xs mt-1">
                      {skill.stat}+{skill.level}{implantBonus > 0 ? `+${implantBonus}` : ''}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mobile-table-wrap hidden md:block">
          <table className="table w-full table-fixed">
            <thead>
              <tr>
                <th className="w-1/3 py-4">{tr('Навык', 'Skill')}</th>
                <th className="w-1/6 py-4">{tr('Хар-ка', 'Stat')}</th>
                <th className="w-1/6 py-4 text-center">{tr('Уровень', 'Level')}</th>
                <th className="w-1/3 py-4 text-center">{tr('Модификатор', 'Modifier')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSkills.map((skill) => {
                const implantBonus = skillBonuses[skill.key] || 0;
                const modifier = calculateModifier(skill.stat, skill.level, skill.key);
                const statValue = character.stats[skill.stat] || 0;

                return (
                  <tr key={skill.key} className="hover:bg-cyber-surface/28 transition-colors border-b border-cyber-gray/14">
                    <td className="py-4 min-w-0">
                      <div className="font-medium text-sm truncate" title={language === 'ru' ? skill.label : skill.key}>
                        {language === 'ru' ? skill.label : skill.key}
                      </div>
                      <div className="text-cyber-muted text-xs truncate mt-1">
                        {language === 'ru' ? SKILL_CATEGORIES[skill.category]?.label : CATEGORY_LABELS_EN[skill.category]}
                      </div>
                      {skill.multiplier === 2 && (
                        <div className="text-cyber-orange text-2xs mt-1">x2</div>
                      )}
                    </td>
                    <td className="py-4">
                      <span className="inline-flex rounded-lg border border-cyber-gray/22 bg-cyber-dark/52 px-2.5 py-1 text-2xs text-cyber-muted">{skill.stat} {statValue}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => updateSkillLevel(skill.key, skill.level - 1)}
                          className="w-8 h-8 rounded-lg border border-cyber-gray/24 bg-cyber-dark/60 hover:border-cyber-accent/34 hover:text-cyber-accent transition-colors flex items-center justify-center text-base"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={skill.level}
                          onChange={(event) => updateSkillLevel(skill.key, event.target.value)}
                          className="input w-16 text-center font-mono font-bold text-sm py-1.5 px-2"
                        />
                        <button
                          onClick={() => updateSkillLevel(skill.key, skill.level + 1)}
                          className="w-8 h-8 rounded-lg border border-cyber-gray/24 bg-cyber-dark/60 hover:border-cyber-accent/34 hover:text-cyber-accent transition-colors flex items-center justify-center text-base"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-center font-mono text-lg font-bold text-cyber-cyan">
                        +{modifier}
                        <span className="text-cyber-muted text-2xs ml-1.5 whitespace-nowrap">
                          ({skill.stat}+{skill.level}{implantBonus > 0 ? `+${implantBonus}` : ''})
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSkills.length === 0 && filteredCustomCombatSkills.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-title">{tr('Навыки не найдены', 'No skills found')}</div>
            <div className="empty-state-description mb-0">{tr('Попробуйте снять фильтр категории или изменить поисковый запрос.', 'Try clearing the category filter or changing the search query.')}</div>
          </div>
        )}

        {filteredSkills.length > SKILLS_PER_PAGE && (
          <div className="flex items-center justify-between gap-3 border-t border-cyber-gray/14 px-4 py-3 md:px-5">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tr('Назад', 'Previous')}
            </button>
            <div className="text-cyber-muted text-sm">
              {tr('Страница', 'Page')} <span className="text-cyber-text font-medium">{currentPage}</span> / <span className="text-cyber-text font-medium">{totalSkillPages}</span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalSkillPages, page + 1))}
              disabled={currentPage === totalSkillPages}
              className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tr('Дальше', 'Next')}
            </button>
          </div>
        )}
      </div>

      {(selectedCategory === 'all' || selectedCategory === 'Fighting') && (
        <div className="card-cyber">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-cyber-text">{tr('Боевые искусства и приёмы', 'Martial arts and maneuvers')}</h3>
              <p className="text-cyber-muted text-sm mt-1">
                {tr('Заполните свои школы, стили и приёмы вручную. Все слоты считаются через DEX.', 'Fill your custom schools, styles, and maneuvers manually. All slots use DEX.')}
              </p>
            </div>
            <span className="inline-flex rounded-lg border border-cyber-gray/22 bg-cyber-dark/52 px-3 py-1.5 text-xs text-cyber-muted">DEX {character.stats.DEX}</span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {customCombatSkills.map((skill, index) => {
              const shouldShow = filteredCustomCombatSkills.some((filteredSkill) => filteredSkill.id === skill.id) || !searchQuery;
              if (!shouldShow) {
                return null;
              }

              const modifier = calculateModifier('DEX', skill.level);

              return (
                <div key={skill.id} className="rounded-xl border border-cyber-orange/20 bg-cyber-dark/48 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-cyber-orange font-semibold text-sm">{tr('Слот', 'Slot')} #{index + 1}</span>
                    <span className="text-cyber-muted text-xs">DEX + {skill.level}</span>
                  </div>

                  <input
                    type="text"
                    value={skill.name}
                    onChange={(event) => updateCustomCombatSkill(index, 'name', event.target.value)}
                    placeholder={tr('Название школы или приёма', 'Style or maneuver name')}
                    className="input w-full"
                  />

                  <textarea
                    value={skill.description}
                    onChange={(event) => updateCustomCombatSkill(index, 'description', event.target.value)}
                    placeholder={tr('Короткое описание или заметка', 'Short description or note')}
                    className="input-text w-full min-h-[96px]"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCustomCombatSkill(index, 'level', skill.level - 1)}
                      className="w-8 h-8 rounded-lg border border-cyber-gray/24 bg-cyber-dark/60 hover:border-cyber-accent/34 hover:text-cyber-accent transition-colors flex items-center justify-center text-base"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={skill.level}
                      onChange={(event) => updateCustomCombatSkill(index, 'level', event.target.value)}
                      className="input w-20 text-center font-mono font-bold"
                    />
                    <button
                      onClick={() => updateCustomCombatSkill(index, 'level', skill.level + 1)}
                      className="w-8 h-8 rounded-lg border border-cyber-gray/24 bg-cyber-dark/60 hover:border-cyber-accent/34 hover:text-cyber-accent transition-colors flex items-center justify-center text-base"
                    >
                      +
                    </button>
                    <div className="ml-auto text-right">
                      <div className="text-cyber-orange font-mono text-lg font-bold">+{modifier}</div>
                      <div className="text-cyber-muted text-2xs">(DEX+{skill.level})</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-base font-semibold text-cyber-text mb-4">{tr('Быстрая справка', 'Quick reference')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-cyber-muted mb-2">{tr('Восприятие', 'Perception')}</div>
            <div className="text-cyber-text">{tr('INT/WILL + навык', 'INT/WILL + skill')}</div>
          </div>
          <div>
            <div className="text-cyber-muted mb-2">{tr('Ближний бой', 'Melee')}</div>
            <div className="text-cyber-text">DEX + {tr('навык', 'skill')}</div>
          </div>
          <div>
            <div className="text-cyber-muted mb-2">{tr('Дальний бой', 'Ranged')}</div>
            <div className="text-cyber-text">REF + {tr('навык', 'skill')}</div>
          </div>
          <div>
            <div className="text-cyber-muted mb-2">{tr('Техника', 'Tech')}</div>
            <div className="text-cyber-text">TECH + {tr('навык', 'skill')}</div>
          </div>
          <div>
            <div className="text-cyber-muted mb-2">{tr('Социализация', 'Social')}</div>
            <div className="text-cyber-text">{tr('ХАР/EMP + навык', 'CHA/EMP + skill')}</div>
          </div>
          <div>
            <div className="text-cyber-muted mb-2">{tr('Сцена', 'Performance')}</div>
            <div className="text-cyber-text">{tr('ХАР/TECH + навык', 'CHA/TECH + skill')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillsPanel;
