import { openDB, DBSchema, IDBPDatabase, IDBPTransaction } from 'idb';
import type { Armor, Character, Cyberware, NetProgram, Weapon } from '@/types';

// Обёртка над браузерной базой данных для проекта CRED KIT.
// Здесь описывается схема БД и все операции чтения/записи, чтобы
// остальная часть приложения вообще не думала о ключах/сторах/транзакциях.

interface CredKitDB extends DBSchema {
  character: {
    key: string;
    value: { id: string; lastModified: number; [key: string]: unknown };
    indexes: { lastModified: number };
  };
  games: {
    key: string;
    value: { id?: string; date?: number; characterId?: string; [key: string]: unknown };
    indexes: { date: number; characterId: string };
  };
  custom_implants: {
    key: string;
    value: { id?: string; type?: string; created?: number; [key: string]: unknown };
    indexes: { type: number; created: number };
  };
  custom_weapons: {
    key: string;
    value: { id?: string; type?: string; created?: number; [key: string]: unknown };
    indexes: { type: number; created: number };
  };
  custom_armor: {
    key: string;
    value: { id?: string; type?: string; created?: number; [key: string]: unknown };
    indexes: { type: number; created: number };
  };
  custom_programs: {
    key: string;
    value: { id?: string; type?: string; created?: number; [key: string]: unknown };
    indexes: { type: number; created: number };
  };
  settings: {
    key: string;
    value: { key: string; value?: unknown };
  };
}

const DB_NAME = 'credkit-db';
// Версию увеличиваем только когда меняется структура стора или индексов.
const DB_VERSION = 4;
const EXPORT_SCHEMA_VERSION = 1;
// Жёстко ограничиваем "ширину" и "разговорчивость" импортов,
// чтобы огромный JSON не положил офлайн‑хранилище.
const MAX_IMPORT_ITEMS = 500;
const MAX_IMPORT_TEXT = 2000;

interface ExportDataPayload {
  character: Record<string, unknown> | null;
  games: Record<string, unknown>[];
  implants: Record<string, unknown>[];
  programs: Record<string, unknown>[];
  weapons: Record<string, unknown>[];
  armor: Record<string, unknown>[];
  settings: Record<string, unknown>[];
}

let dbPromise: Promise<IDBPDatabase<CredKitDB>> | null = null;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeString(value: unknown, fallback: string, maxLen = MAX_IMPORT_TEXT): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLen);
}

function sanitizeImportItem(value: unknown, idPrefix: string, index: number): Record<string, unknown> | null {
  if (!isObjectRecord(value)) return null;

  return {
    ...value,
    id: sanitizeString(value.id, `${idPrefix}_${Date.now()}_${index}`, 140)
  };
}

function sanitizeImportArray(value: unknown, idPrefix: string): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, MAX_IMPORT_ITEMS)
    .map((item, index) => sanitizeImportItem(item, idPrefix, index))
    .filter((item): item is Record<string, unknown> => item !== null);
}

type ImportStoreNames =
  | 'character'
  | 'games'
  | 'custom_implants'
  | 'custom_programs'
  | 'custom_weapons'
  | 'custom_armor'
  | 'settings';

async function clearImportTargetStores(tx: IDBPTransaction<CredKitDB, ImportStoreNames[], 'readwrite'>): Promise<void> {
  await Promise.all([
    tx.objectStore('character').clear(),
    tx.objectStore('games').clear(),
    tx.objectStore('custom_implants').clear(),
    tx.objectStore('custom_programs').clear(),
    tx.objectStore('custom_weapons').clear(),
    tx.objectStore('custom_armor').clear(),
    tx.objectStore('settings').clear()
  ]);
}

// - инициализация БД
//   Важно: наружу отдаём только Promise<void>, чтобы не давать прямой доступ к IDB‑инстансу.
export async function initDB(): Promise<void> {
  await getDB();
}

function getDB(): Promise<IDBPDatabase<CredKitDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CredKitDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('character')) {
          const charStore = db.createObjectStore('character', { keyPath: 'id' });
          charStore.createIndex('lastModified', 'lastModified');
        }

        if (!db.objectStoreNames.contains('games')) {
          const gamesStore = db.createObjectStore('games', { keyPath: 'id' });
          gamesStore.createIndex('date', 'date');
          gamesStore.createIndex('characterId', 'characterId');
        }

        if (!db.objectStoreNames.contains('custom_implants')) {
          const implantsStore = db.createObjectStore('custom_implants', { keyPath: 'id' });
          implantsStore.createIndex('type', 'type');
          implantsStore.createIndex('created', 'created');
        }

        if (!db.objectStoreNames.contains('custom_programs')) {
          const programsStore = db.createObjectStore('custom_programs', { keyPath: 'id' });
          programsStore.createIndex('type', 'type');
          programsStore.createIndex('created', 'created');
        }

        if (!db.objectStoreNames.contains('custom_weapons')) {
          const weaponsStore = db.createObjectStore('custom_weapons', { keyPath: 'id' });
          weaponsStore.createIndex('type', 'type');
          weaponsStore.createIndex('created', 'created');
        }

        if (!db.objectStoreNames.contains('custom_armor')) {
          const armorStore = db.createObjectStore('custom_armor', { keyPath: 'id' });
          armorStore.createIndex('type', 'type');
          armorStore.createIndex('created', 'created');
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// - персонаж
export async function saveCharacterToDB(character: Character): Promise<void> {
  const db = await getDB();
  await db.put('character', { ...character, id: 'current', lastModified: Date.now() });
}

export async function loadCharacterFromDB(id = 'current'): Promise<Record<string, unknown> | null> {
  const db = await getDB();
  const result = await db.get('character', id);
  return result ?? null;
}

export async function deleteCharacterFromDB(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('character', id);
}

export async function clearCharacterDataFromDB(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['character', 'games'], 'readwrite');
  await tx.objectStore('character').clear();
  await tx.objectStore('games').clear();
  await tx.done;
}

// - алиасы для совместимости
export const saveCharacter = saveCharacterToDB;
export const loadCharacter = loadCharacterFromDB;
export const deleteCharacter = deleteCharacterFromDB;

// - игровые сессии
export async function saveGameToDB(game: Record<string, unknown>): Promise<void> {
  const db = await getDB();
  await db.put('games', { ...game, date: Date.now() });
}

export async function loadGameFromDB(id: string): Promise<Record<string, unknown> | null> {
  const db = await getDB();
  const result = await db.get('games', id);
  return result || null;
}

export async function getAllGamesFromDB(): Promise<Record<string, unknown>[]> {
  const db = await getDB();
  return db.getAll('games');
}

export async function deleteGameFromDB(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('games', id);
}

// алиасы
export const saveGame = saveGameToDB;
export const loadGame = loadGameFromDB;
export const getAllGames = getAllGamesFromDB;
export const deleteGame = deleteGameFromDB;

// - кастомные импланты
export async function saveCustomImplantToDB(implant: Cyberware): Promise<void> {
  const db = await getDB();
  await db.put('custom_implants', { ...implant, created: Date.now() });
}

export async function loadCustomImplantsFromDB(): Promise<Record<string, unknown>[]> {
  const db = await getDB();
  return db.getAll('custom_implants');
}

export async function clearCustomImplantsFromDB(): Promise<void> {
  const db = await getDB();
  await db.clear('custom_implants');
}

export const saveCustomImplant = saveCustomImplantToDB;
export const loadCustomImplants = loadCustomImplantsFromDB;

// - кастомные программы
export async function saveCustomProgramToDB(program: NetProgram): Promise<void> {
  const db = await getDB();
  await db.put('custom_programs', { ...program, created: Date.now() });
}

export async function loadCustomProgramsFromDB(): Promise<Record<string, unknown>[]> {
  const db = await getDB();
  return db.getAll('custom_programs');
}

export async function clearCustomProgramsFromDB(): Promise<void> {
  const db = await getDB();
  await db.clear('custom_programs');
}

export const saveCustomProgram = saveCustomProgramToDB;
export const loadCustomPrograms = loadCustomProgramsFromDB;

// - кастомное оружие
export async function saveCustomWeaponToDB(weapon: Weapon): Promise<void> {
  const db = await getDB();
  await db.put('custom_weapons', { ...weapon, created: Date.now() });
}

export async function loadCustomWeaponsFromDB(): Promise<Record<string, unknown>[]> {
  const db = await getDB();
  return db.getAll('custom_weapons');
}

export async function clearCustomWeaponsFromDB(): Promise<void> {
  const db = await getDB();
  await db.clear('custom_weapons');
}

export const saveCustomWeapon = saveCustomWeaponToDB;
export const loadCustomWeapons = loadCustomWeaponsFromDB;

// - кастомная броня
export async function saveCustomArmorToDB(armor: Armor): Promise<void> {
  const db = await getDB();
  await db.put('custom_armor', { ...armor, created: Date.now() });
}

export async function loadCustomArmorFromDB(): Promise<Record<string, unknown>[]> {
  const db = await getDB();
  return db.getAll('custom_armor');
}

export async function clearCustomArmorFromDB(): Promise<void> {
  const db = await getDB();
  await db.clear('custom_armor');
}

export const saveCustomArmor = saveCustomArmorToDB;
export const loadCustomArmor = loadCustomArmorFromDB;

// - настройки
export async function saveSettingToDB(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key, value });
}

export async function loadSettingFromDB<T = unknown>(key: string): Promise<T | null> {
  const db = await getDB();
  const result = await db.get('settings', key);
  return (result?.value as T | undefined) ?? null;
}

export const saveSetting = saveSettingToDB;
export const loadSetting = loadSettingFromDB;

// - полный экспорт/импорт
export async function exportAllDataFromDB(): Promise<{
  schemaVersion: number;
  exportedAt: string;
  data: ExportDataPayload;
}> {
  const db = await getDB();
  const [character, games, implants, programs, weapons, armor, settings] = await Promise.all([
    db.get('character', 'current'),
    db.getAll('games'),
    db.getAll('custom_implants'),
    db.getAll('custom_programs'),
    db.getAll('custom_weapons'),
    db.getAll('custom_armor'),
    db.getAll('settings'),
  ]);

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: { character: character ?? null, games, implants, programs, weapons, armor, settings }
  };
}

export const exportAllData = exportAllDataFromDB;
export const importData = importDataToDB;

function normalizeImportPayload(raw: unknown): ExportDataPayload {
  if (!isObjectRecord(raw)) {
    throw new Error('Invalid import format');
  }

  if ('schemaVersion' in raw || 'data' in raw) {
    const schemaVersion = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : NaN;
    if (!Number.isFinite(schemaVersion)) {
      throw new Error('Invalid import schema version');
    }
    if (schemaVersion > EXPORT_SCHEMA_VERSION) {
      throw new Error('Import file is from a newer app version');
    }

    const payloadData = raw.data;
    if (!isObjectRecord(payloadData)) {
      throw new Error('Invalid import data payload');
    }
    return {
      character: isObjectRecord(payloadData.character) ? payloadData.character : null,
      games: Array.isArray(payloadData.games) ? payloadData.games.filter(isObjectRecord) : [],
      implants: Array.isArray(payloadData.implants) ? payloadData.implants.filter(isObjectRecord) : [],
      programs: Array.isArray(payloadData.programs) ? payloadData.programs.filter(isObjectRecord) : [],
      weapons: Array.isArray(payloadData.weapons) ? payloadData.weapons.filter(isObjectRecord) : [],
      armor: Array.isArray(payloadData.armor) ? payloadData.armor.filter(isObjectRecord) : [],
      settings: Array.isArray(payloadData.settings) ? payloadData.settings.filter(isObjectRecord) : []
    };
  }

  // Формат старого образца до schemaVersion (обратная совместимость)
  return {
    character: isObjectRecord(raw.character) ? raw.character : null,
    games: Array.isArray(raw.games) ? raw.games.filter(isObjectRecord) : [],
    implants: Array.isArray(raw.implants) ? raw.implants.filter(isObjectRecord) : [],
    programs: Array.isArray(raw.programs) ? raw.programs.filter(isObjectRecord) : [],
    weapons: Array.isArray(raw.weapons) ? raw.weapons.filter(isObjectRecord) : [],
    armor: Array.isArray(raw.armor) ? raw.armor.filter(isObjectRecord) : [],
    settings: Array.isArray(raw.settings) ? raw.settings.filter(isObjectRecord) : []
  };
}

export async function importDataToDB(data: unknown): Promise<void> {
  const payload = normalizeImportPayload(data);

  const db = await getDB();
  const tx = db.transaction(
    ['character', 'games', 'custom_implants', 'custom_programs', 'custom_weapons', 'custom_armor', 'settings'],
    'readwrite'
  );
  await clearImportTargetStores(tx);

  if (isObjectRecord(payload.character)) {
    await tx.objectStore('character').put({
      ...payload.character,
      id: 'current',
      lastModified: Date.now()
    });
  }

  const games = sanitizeImportArray(payload.games, 'game');
  for (const game of games) {
    await tx.objectStore('games').put({ ...game, date: Date.now() });
  }

  const implants = sanitizeImportArray(payload.implants, 'implant');
  for (const implant of implants) {
    await tx.objectStore('custom_implants').put({ ...implant, created: Date.now() });
  }

  const programs = sanitizeImportArray(payload.programs, 'program');
  for (const program of programs) {
    await tx.objectStore('custom_programs').put({ ...program, created: Date.now() });
  }

  const weapons = sanitizeImportArray(payload.weapons, 'weapon');
  for (const weapon of weapons) {
    await tx.objectStore('custom_weapons').put({ ...weapon, created: Date.now() });
  }

  const armor = sanitizeImportArray(payload.armor, 'armor');
  for (const armorItem of armor) {
    await tx.objectStore('custom_armor').put({ ...armorItem, created: Date.now() });
  }

  if (Array.isArray(payload.settings)) {
    const settings = payload.settings
      .slice(0, MAX_IMPORT_ITEMS)
      .filter(isObjectRecord)
      .map((item, index) => ({
        ...item,
        key: sanitizeString(item.key, `key_${index}`, 120),
        value: item.value
      }));

    for (const setting of settings) {
      await tx.objectStore('settings').put({
        key: sanitizeString(setting.key, 'key', 120),
        value: setting.value ?? null
      });
    }
  }

  await tx.done;
}
