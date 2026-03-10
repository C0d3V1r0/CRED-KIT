import { useState, useCallback } from 'react';
import {
  useCustomContentActions,
  useCustomContentState
} from '../../entities/character/model/hooks';
import { useToast } from '../../components/common/Toast';
import { Icons } from '../../utils/icons';
import { useLanguage } from '../../features/settings/model/hooks';
import type { NetProgram } from '@/types';

const PROGRAM_TYPES = [
  { id: 'attack', label: { ru: 'Атакующая', en: 'Attack' }, color: 'orange', icon: Icons.attack },
  { id: 'defense', label: { ru: 'Защитная', en: 'Defense' }, color: 'cyan', icon: Icons.defense },
  { id: 'booster', label: { ru: 'Усиление', en: 'Booster' }, color: 'green', icon: Icons.booster },
  { id: 'utility', label: { ru: 'Утилита', en: 'Utility' }, color: 'purple', icon: Icons.utility },
  { id: 'tracer', label: { ru: 'Трейсер', en: 'Tracer' }, color: 'pink', icon: Icons.tracer }
] as const;

const DANGER_LEVELS = [
  { id: 'low', label: { ru: 'Низкая', en: 'Low' }, color: 'green' },
  { id: 'medium', label: { ru: 'Средняя', en: 'Medium' }, color: 'yellow' },
  { id: 'high', label: { ru: 'Высокая', en: 'High' }, color: 'orange' },
  { id: 'extreme', label: { ru: 'Критическая', en: 'Critical' }, color: 'red' }
] as const;

export function ProgramConstructor() {
  const customContent = useCustomContentState();
  const { addCustomProgram } = useCustomContentActions();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);

  const [isCreating, setIsCreating] = useState(false);
  const [editingProgram, setEditingProgram] = useState<NetProgram | null>(null);

  // Форма создания/редактирования
  const [form, setForm] = useState<Partial<NetProgram>>({
    name: '',
    description: '',
    type: 'attack',
    cost: 100,
    level: 1,
    strength: undefined,
    speed: undefined,
    danger_level: 'low',
    effects: ''
  });

  // Сброс формы
  const resetForm = useCallback(() => {
    setForm({
      name: '',
      description: '',
      type: 'attack',
      cost: 100,
      level: 1,
      strength: undefined,
      speed: undefined,
      danger_level: 'low',
      effects: ''
    });
    setIsCreating(false);
    setEditingProgram(null);
  }, []);

  // Начать создание
  const startCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  // Начать редактирование
  const startEdit = (program: NetProgram) => {
    setForm({
      name: program.name,
      description: program.description,
      type: program.type,
      cost: program.cost,
      level: program.level,
      strength: program.strength,
      speed: program.speed,
      danger_level: program.danger_level,
      effects: typeof program.effects === 'string' ? program.effects : ''
    });
    setEditingProgram(program);
    setIsCreating(true);
  };

  // Сохранить программу
  const saveProgram = () => {
    if (!form.name?.trim()) {
      showToast(tr('Введите название программы!', 'Enter a program name.'), 'error');
      return;
    }

    const newProgram: NetProgram = {
      id: editingProgram?.id || `custom_${Date.now()}`,
      name: form.name.trim(),
      description: form.description?.trim() || '',
      type: form.type as NetProgram['type'],
      cost: form.cost || 0,
      level: form.level || 1,
      strength: form.strength,
      speed: form.speed,
      danger_level: form.danger_level as NetProgram['danger_level'],
      effects: form.effects
    };

    // - добавляем в кастомные программы
    addCustomProgram(newProgram);

    // Показываем результат
    showToast(
      `${editingProgram ? tr('Обновлено', 'Updated') : tr('Создано', 'Created')}: ${newProgram.name}`,
      'success'
    );

    resetForm();
  };

  // Удалить программу
  const deleteProgram = (program: NetProgram) => {
    showToast(`${tr('Удалено', 'Deleted')}: ${program.name}`, 'info');
  };

  // Получить цвет типа
  const getTypeColor = (type: string) => {
    return PROGRAM_TYPES.find(t => t.id === type)?.color || 'gray';
  };

  // Кастомные программы пользователя
  const customPrograms = customContent.programs;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* - заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyber-purple/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-cyber-purple">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-cyber-text">{tr('Конструктор скриптов', 'Program Constructor')}</h2>
            <p className="ui-meta">{tr('Создавайте свои программы', 'Create your own programs')}</p>
          </div>
        </div>

        {!isCreating && (
          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-accent/20 border border-cyber-accent/40 text-cyber-accent hover:bg-cyber-accent/30 transition-all"
          >
            {Icons.plus}
            <span>{tr('Создать', 'Create')}</span>
          </button>
        )}
      </div>

      {/* - форма создания/редактирования */}
      {isCreating && (
        <div className="card-cyber p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-cyber-text">
              {editingProgram ? tr('Редактирование', 'Edit Program') : tr('Новая программа', 'New Program')}
            </h3>
            <button
              onClick={resetForm}
              className="w-8 h-8 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30 text-cyber-muted hover:text-cyber-text transition-all"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* - название */}
            <div className="md:col-span-2">
              <label className="block ui-meta mb-2">{tr('Название', 'Name')} *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input w-full"
                placeholder={tr('Например: Blood Spider', 'Example: Blood Spider')}
              />
            </div>

            {/* - описание */}
            <div className="md:col-span-2">
              <label className="block ui-meta mb-2">{tr('Описание', 'Description')}</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input w-full h-24 resize-none"
                placeholder={tr('Описание работы программы...', 'Program description...')}
              />
            </div>

            {/* - тип */}
            <div>
              <label className="block ui-meta mb-2">{tr('Тип', 'Type')}</label>
              <div className="grid grid-cols-5 gap-1">
                {PROGRAM_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setForm({ ...form, type: type.id })}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      form.type === type.id
                        ? `bg-cyber-${type.color}/20 border-cyber-${type.color}/50 text-cyber-${type.color}`
                        : 'bg-cyber-dark/60 border-cyber-gray/30 text-cyber-muted hover:text-cyber-text'
                    }`}
                    title={type.label[language]}
                  >
                    <span className="w-5 h-5">{type.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* - уровень опасности */}
            <div>
              <label className="block ui-meta mb-2">{tr('Опасность', 'Danger')}</label>
              <select
                value={form.danger_level}
                onChange={(e) => setForm({ ...form, danger_level: e.target.value as NetProgram['danger_level'] })}
                className="select w-full"
              >
                {DANGER_LEVELS.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.label[language]}
                  </option>
                ))}
              </select>
            </div>

            {/* - стоимость */}
            <div>
              <label className="block ui-meta mb-2">{tr('Стоимость', 'Cost')} (eb)</label>
              <input
                type="number"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: parseInt(e.target.value) || 0 })}
                className="input w-full"
                min="0"
              />
            </div>

            {/* - уровень (RAM) */}
            <div>
              <label className="block ui-meta mb-2">RAM ({tr('уровень', 'level')})</label>
              <input
                type="number"
                value={form.level}
                onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) || 1 })}
                className="input w-full"
                min="1"
              />
            </div>

            {/* - сила */}
            <div>
              <label className="block ui-meta mb-2">{tr('Сила', 'Strength')} ({tr('опционально', 'optional')})</label>
              <input
                type="number"
                value={form.strength || ''}
                onChange={(e) => setForm({ ...form, strength: e.target.value ? parseInt(e.target.value) : undefined })}
                className="input w-full"
                placeholder="d6"
              />
            </div>

            {/* - скорость */}
            <div>
              <label className="block ui-meta mb-2">{tr('Скорость', 'Speed')} ({tr('опционально', 'optional')})</label>
              <input
                type="number"
                value={form.speed || ''}
                onChange={(e) => setForm({ ...form, speed: e.target.value ? parseInt(e.target.value) : undefined })}
                className="input w-full"
              />
            </div>

            {/* - эффекты */}
            <div className="md:col-span-2">
              <label className="block ui-meta mb-2">{tr('Эффект', 'Effect')} ({tr('описание', 'description')})</label>
              <textarea
                value={typeof form.effects === 'string' ? form.effects : ''}
                onChange={(e) => setForm({ ...form, effects: e.target.value })}
                className="input w-full h-20 resize-none"
                placeholder={tr('Например: При попадании наносит 6d6 урона...', 'Example: On hit deals 6d6 damage...')}
              />
            </div>
          </div>

          {/* - превью */}
          <div className="mt-6 p-4 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
            <div className="ui-kicker mb-2">{tr('Превью', 'Preview')}:</div>
            <div className="flex items-center gap-3">
              <div className={`w-1 h-12 rounded-full bg-cyber-${getTypeColor(form.type || 'gray')}`} />
              <div className="flex-1">
                <div className="ui-card-title">{form.name || tr('Название', 'Name')}</div>
                <div className="ui-body-sm">{form.description || tr('Описание...', 'Description...')}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`ui-badge ${form.type === 'attack'
                    ? 'ui-badge--orange'
                    : form.type === 'defense'
                      ? 'ui-badge--cyan'
                      : form.type === 'booster'
                        ? 'ui-badge--green'
                        : 'ui-badge--accent'}`}>
                    {PROGRAM_TYPES.find(t => t.id === form.type)?.label[language]}
                  </span>
                  <span className="ui-meta">{form.cost}eb</span>
                  {form.strength && <span className="ui-meta text-cyber-orange">STR: {form.strength}</span>}
                  {form.speed && <span className="ui-meta text-cyber-cyan">SPD: {form.speed}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* - кнопки */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={resetForm}
              className="flex-1 py-2.5 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30 text-cyber-muted hover:text-cyber-text transition-all"
            >
              {tr('Отмена', 'Cancel')}
            </button>
            <button
              onClick={saveProgram}
              className="flex-1 py-2.5 rounded-lg bg-cyber-accent/20 border border-cyber-accent/40 text-cyber-accent hover:bg-cyber-accent/30 transition-all flex items-center justify-center gap-2"
            >
              {Icons.save}
              <span>{editingProgram ? tr('Обновить', 'Update') : tr('Создать', 'Create')}</span>
            </button>
          </div>
        </div>
      )}

      {/* - список кастомных программ */}
      <div className="card-cyber p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cyber-text">{tr('Мои скрипты', 'My Programs')}</h3>
          <span className="ui-meta">{customPrograms.length} {tr('программ', 'programs')}</span>
        </div>

        {customPrograms.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyber-dark flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-cyber-muted">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4"/>
              </svg>
            </div>
            <p className="text-cyber-muted mb-2">{tr('Нет созданных программ', 'No custom programs yet')}</p>
            <p className="ui-meta">{tr('Нажмите "Создать" чтобы добавить свою', 'Press "Create" to add your first one')}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
            {customPrograms.map((program, index) => {
              // Для программ из customContent используем временную структуру
              const tempProgram = {
                ...program,
                type: 'utility' as const,
                danger_level: 'low' as const,
                effects: ''
              };

              return (
                <div
                  key={index}
                  className="group relative p-3 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30 hover:border-cyber-accent/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-10 rounded-full bg-cyber-${getTypeColor(tempProgram.type)}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-cyber-text">{tempProgram.name}</span>
                          <span className="ui-badge ui-badge--cyan">CUSTOM</span>
                        </div>
                        <div className="ui-meta line-clamp-1">
                          {tempProgram.description || tr('Без описания', 'No description')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(tempProgram)}
                        className="icon-action icon-action--cyan opacity-0 group-hover:opacity-100"
                      >
                        {Icons.edit}
                      </button>
                      <button
                        onClick={() => deleteProgram(tempProgram)}
                        className="icon-action icon-action--orange opacity-0 group-hover:opacity-100"
                      >
                        {Icons.trash}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgramConstructor;
