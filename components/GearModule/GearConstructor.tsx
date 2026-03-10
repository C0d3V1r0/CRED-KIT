import { useState, useCallback } from 'react';
import {
  useCustomContentActions,
  useInventoryActions
} from '../../entities/character/model/hooks';
import { useToast } from '../../components/common/Toast';
import { Icons } from '../../utils/icons';
import { useLanguage } from '../../features/settings/model/hooks';
import {
  buildCustomGearItem,
  changeDraftType,
  createDefaultGearDraft,
  type GearTypeId
} from '../../features/gear-constructor/model/gearBuilder';

const GEAR_TYPES = [
  { id: 'weapon', label: 'Оружие', color: 'orange' },
  { id: 'armor', label: 'Броня', color: 'cyan' },
  { id: 'gear', label: 'Предмет', color: 'purple' }
] as const;

const WEAPON_TYPES = [
  { id: 'pistol', label: 'Пистолет' },
  { id: 'smg', label: 'СМГ' },
  { id: 'rifle', label: 'Винтовка' },
  { id: 'shotgun', label: 'Дробовик' },
  { id: 'melee', label: 'Холодное' }
] as const;

const ARMOR_TYPES = [
  { id: 'clothing', label: 'Одежда' },
  { id: 'vest', label: 'Жилет' },
  { id: 'full', label: 'Полная' },
  { id: 'helmet', label: 'Шлем' },
  { id: 'subdermal', label: 'Субдермальная' }
] as const;

const CONCEALABILITY = [
  { id: 'easy', label: 'Легко' },
  { id: 'medium', label: 'Средне' },
  { id: 'hard', label: 'Трудно' },
  { id: 'always', label: 'Всегда видно' }
] as const;

const AVAILABILITY = [
  { id: 'common', label: 'Обычный' },
  { id: 'uncommon', label: 'Необычный' },
  { id: 'rare', label: 'Редкий' }
] as const;

export function GearConstructor() {
  const { addCustomWeapon, addCustomArmor } = useCustomContentActions();
  const { addWeapon, addArmor, addGear } = useInventoryActions();
  const { showToast } = useToast();
  const { language } = useLanguage();
  const tr = (ru: string, en: string) => (language === 'ru' ? ru : en);

  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<GearTypeId>('weapon');
  const [form, setForm] = useState(() => createDefaultGearDraft());

  const resetForm = useCallback(() => {
    setSelectedType('weapon');
    setForm(createDefaultGearDraft());
    setIsCreating(false);
  }, []);

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const changeGearType = (type: GearTypeId) => {
    setSelectedType(type);
    setForm((current) => changeDraftType(current, type));
  };

  const saveGear = () => {
    if (!form.name?.trim()) {
      showToast('Введите название!', 'error');
      return;
    }

    const customId = 'custom_' + Date.now();

    const builtItem = buildCustomGearItem(customId, selectedType, form);

    if (builtItem.kind === 'weapon') {
      addWeapon(builtItem.catalog);
      addCustomWeapon(builtItem.catalog);
    } else if (builtItem.kind === 'armor') {
      addArmor(builtItem.catalog);
      addCustomArmor(builtItem.catalog);
    } else {
      addGear(builtItem.inventory);
    }

    showToast(`Создано и добавлено: ${form.name}`, 'success');
    resetForm();
  };

  const getTypeColor = (type: string) => {
    return GEAR_TYPES.find(t => t.id === type)?.color || 'gray';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyber-accent/20 flex items-center justify-center">
            <span className="w-5 h-5 text-cyber-accent">{Icons.cyberware}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-cyber-text">Конструктор снаряжения</h2>
            <p className="ui-meta">Создавайте оружие, броню и предметы</p>
          </div>
        </div>

        {!isCreating && (
          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-accent/20 border border-cyber-accent/40 text-cyber-accent hover:bg-cyber-accent/30 transition-all"
          >
            <span className="w-5 h-5">{Icons.cyberware}</span>
            <span>Создать</span>
          </button>
        )}
      </div>

      {isCreating && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-cyber-text">Новое снаряжение</h3>
            <button
              onClick={resetForm}
              className="text-cyber-muted hover:text-cyber-text transition-colors"
            >
              <span className="w-5 h-5 block">{Icons.close}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {GEAR_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => changeGearType(type.id)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  selectedType === type.id
                    ? `bg-cyber-${type.color}/20 border-cyber-${type.color}/50 text-cyber-${type.color}`
                    : 'bg-cyber-dark/60 border-cyber-gray/30 text-cyber-muted hover:text-cyber-text'
                }`}
              >
                <span className="w-6 h-6 mx-auto flex items-center justify-center">
                  {type.id === 'weapon' && <span className="w-5 h-5">{Icons.weapons}</span>}
                  {type.id === 'armor' && <span className="w-5 h-5">{Icons.armor}</span>}
                  {type.id === 'gear' && <span className="w-5 h-5">{Icons.gear}</span>}
                </span>
                <div className="ui-meta mt-1">{type.label}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block ui-meta mb-2">Название *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input w-full"
                placeholder={tr('Например: Militech Arms Deal', 'Example: Militech Arms Deal')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block ui-meta mb-2">Описание</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-text w-full h-20 resize-none"
                placeholder={tr('Описание предмета...', 'Item description...')}
              />
            </div>

            <div>
              <label className="block ui-meta mb-2">Тип</label>
              <select
                value={form.subtype}
                onChange={(e) => setForm({ ...form, subtype: e.target.value })}
                className="select w-full"
              >
                {selectedType === 'weapon' && WEAPON_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
                {selectedType === 'armor' && ARMOR_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
                {selectedType === 'gear' && (
                  <>
                    <option value="medical">Медицина</option>
                    <option value="drug">Препарат</option>
                    <option value="explosive">Взрывчатка</option>
                    <option value="gadget">Гаджет</option>
                    <option value="drone">Дрон</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block ui-meta mb-2">Стоимость (eb)</label>
              <input
                type="number"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: parseInt(e.target.value) || 0 })}
                className="input w-full"
                min="0"
              />
            </div>

            <div>
              <label className="block ui-meta mb-2">Вес</label>
              <input
                type="number"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })}
                className="input w-full"
                step="0.1"
                min="0"
              />
            </div>

            <div>
              <label className="block ui-meta mb-2">Скрываемость</label>
              <select
                value={form.concealability}
                onChange={(e) => setForm({ ...form, concealability: e.target.value })}
                className="select w-full"
              >
                {CONCEALABILITY.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block ui-meta mb-2">Доступность</label>
              <select
                value={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.value })}
                className="select w-full"
              >
                {AVAILABILITY.map(a => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </div>

            {selectedType === 'weapon' && (
              <>
                <div>
                  <label className="block ui-meta mb-2">Урон</label>
                  <input
                    type="text"
                    value={form.damage}
                    onChange={(e) => setForm({ ...form, damage: e.target.value })}
                    className="input w-full"
                    placeholder="2d6"
                  />
                </div>
                <div>
                  <label className="block ui-meta mb-2">Скорострельность</label>
                  <input
                    type="number"
                    value={form.rate_of_fire}
                    onChange={(e) => setForm({ ...form, rate_of_fire: parseInt(e.target.value) || 1 })}
                    className="input w-full"
                    min="1"
                  />
                </div>
              </>
            )}

            {selectedType === 'armor' && (
              <div>
                <label className="block ui-meta mb-2">Броня (SP)</label>
                <input
                  type="number"
                  value={form.sp}
                  onChange={(e) => setForm({ ...form, sp: parseInt(e.target.value) || 0 })}
                  className="input w-full"
                  min="0"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block ui-meta mb-2">Эффекты/Примечания</label>
              <textarea
                value={form.effects}
                onChange={(e) => setForm({ ...form, effects: e.target.value })}
                className="input-text w-full h-20 resize-none"
                placeholder={tr('Особые эффекты...', 'Special effects...')}
              />
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30">
            <div className="ui-kicker mb-2">Превью:</div>
            <div className="flex items-center gap-3">
              <div className={`w-1 h-12 rounded-full bg-cyber-${getTypeColor(selectedType)}`} />
              <div className="flex-1 min-w-0">
                <div className="ui-card-title truncate">{form.name || 'Название'}</div>
                <div className="ui-body-sm truncate">{form.description || 'Описание...'}</div>
                <div className="flex items-center gap-2 mt-1 ui-meta">
                  <span className="text-cyber-accent">{form.cost}eb</span>
                  <span>•</span>
                  <span className="text-cyber-cyan">{form.weight}{tr('кг', 'kg')}</span>
                  {selectedType === 'weapon' && form.damage && (
                    <>
                      <span>•</span>
                      <span className="text-cyber-orange">{form.damage}</span>
                    </>
                  )}
                  {selectedType === 'armor' && form.sp > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-cyber-cyan">SP {form.sp}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={resetForm}
              className="flex-1 py-2.5 rounded-lg bg-cyber-dark/60 border border-cyber-gray/30 text-cyber-muted hover:text-cyber-text transition-all"
            >
              Отмена
            </button>
            <button
              onClick={saveGear}
              className="flex-1 py-2.5 rounded-lg bg-cyber-accent/20 border border-cyber-accent/40 text-cyber-accent hover:bg-cyber-accent/30 transition-all flex items-center justify-center gap-2"
            >
              <span className="w-5 h-5">{Icons.cyberware}</span>
              <span>Создать</span>
            </button>
          </div>
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cyber-text">Моё снаряжение</h3>
          <span className="ui-meta">0 предметов</span>
        </div>

        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyber-dark flex items-center justify-center">
            <span className="w-8 h-8 text-cyber-muted">{Icons.gear}</span>
          </div>
          <p className="text-cyber-muted mb-2">Нет созданного снаряжения</p>
          <p className="ui-meta">{tr('Нажмите "Создать" чтобы добавить своё', 'Press "Create" to add your own')}</p>
        </div>
      </div>
    </div>
  );
}

export default GearConstructor;
