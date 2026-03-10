import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../core/hooks';
import { requestManualCharacterResetBeforeHydration } from '../../../core/providers/CharacterPersistenceBridge';
import {
  clearCharacterDataFromDB,
  clearCustomArmorFromDB,
  clearCustomImplantsFromDB,
  clearCustomProgramsFromDB,
  clearCustomWeaponsFromDB,
  exportAllDataFromDB,
  importDataToDB,
  loadCharacterFromDB,
  loadCustomArmorFromDB,
  loadCustomImplantsFromDB,
  loadCustomProgramsFromDB,
  loadCustomWeaponsFromDB,
  saveCharacterToDB
} from '../../../services/indexedDB';
import {
  parseImportJson,
  sanitizeCharacterImport,
  sanitizeCustomArmorImport,
  sanitizeCustomCyberwareImport,
  sanitizeCustomProgramImport,
  sanitizeCustomWeaponImport
} from '../../../utils/importValidation';
import { characterActions, selectCharacter, selectCharacterError, selectCharacterLoading, selectDerivedStats } from './characterSlice';
import { createDefaultCharacter, createEmptyCustomContent } from './characterState';
import { customContentActions, selectCustomContent } from './customContentSlice';
import type {
  Armor,
  Character,
  CustomCombatSkill,
  Cyberware,
  Gear,
  NetProgram,
  ResourceTrack,
  StatKey,
  Weapon
} from '@/types';

const DEFAULT_CHARACTER: Character = createDefaultCharacter();
const MAX_IMPORT_JSON_BYTES = 2 * 1024 * 1024;

export function useCharacterState() {
  return useAppSelector(selectCharacter);
}

export function useDerivedStats() {
  return useAppSelector(selectDerivedStats);
}

export function useCustomContentState() {
  return useAppSelector(selectCustomContent);
}

export function useCharacterStatus() {
  const isLoading = useAppSelector(selectCharacterLoading);
  const error = useAppSelector(selectCharacterError);
  return { isLoading, error };
}

export function useCharacterCoreActions() {
  const dispatch = useAppDispatch();

  return {
    updateStat: useCallback((stat: StatKey, value: number) => {
      dispatch(characterActions.updateStat({ stat, value }));
    }, [dispatch]),
    updateBasicInfo: useCallback((updates: Partial<Pick<Character, 'name' | 'role' | 'level' | 'roleAbilityRank'>>) => {
      dispatch(characterActions.updateBasicInfo(updates));
    }, [dispatch]),
    updateSkills: useCallback((skills: Record<string, number>) => {
      dispatch(characterActions.updateSkills(skills));
    }, [dispatch]),
    updateCustomCombatSkills: useCallback((skills: CustomCombatSkill[]) => {
      dispatch(characterActions.updateCustomCombatSkills(skills));
    }, [dispatch]),
    updateResource: useCallback((resource: 'health' | 'humanity' | 'armorHead' | 'armorBody', value: Partial<ResourceTrack>) => {
      dispatch(characterActions.updateResource({ resource, value }));
    }, [dispatch]),
    updateMoney: useCallback((money: number) => {
      dispatch(characterActions.updateMoney(money));
    }, [dispatch])
  };
}

export function useCyberwareActions() {
  const dispatch = useAppDispatch();

  return {
    addCyberware: useCallback((implant: Cyberware) => {
      dispatch(characterActions.addCyberware(implant));
    }, [dispatch]),
    removeCyberware: useCallback((index: number) => {
      dispatch(characterActions.removeCyberware(index));
    }, [dispatch]),
    addCustomCyberware: useCallback((implant: Cyberware) => {
      dispatch(customContentActions.addCustomCyberware(implant));
    }, [dispatch])
  };
}

export function useInventoryActions() {
  const dispatch = useAppDispatch();

  return {
    addWeapon: useCallback((weapon: Weapon) => {
      dispatch(characterActions.addWeapon(weapon));
    }, [dispatch]),
    removeWeapon: useCallback((index: number) => {
      dispatch(characterActions.removeWeapon(index));
    }, [dispatch]),
    addArmor: useCallback((armor: Armor) => {
      dispatch(characterActions.addArmor(armor));
    }, [dispatch]),
    removeArmor: useCallback((index: number) => {
      dispatch(characterActions.removeArmor(index));
    }, [dispatch]),
    addGear: useCallback((item: Gear) => {
      dispatch(characterActions.addGear(item));
    }, [dispatch]),
    removeGear: useCallback((index: number) => {
      dispatch(characterActions.removeGear(index));
    }, [dispatch])
  };
}

export function useCustomContentActions() {
  const dispatch = useAppDispatch();

  return {
    addCustomProgram: useCallback((program: NetProgram) => {
      dispatch(customContentActions.addCustomProgram(program));
    }, [dispatch]),
    addCustomWeapon: useCallback((weapon: Weapon) => {
      dispatch(customContentActions.addCustomWeapon(weapon));
    }, [dispatch]),
    addCustomArmor: useCallback((armor: Armor) => {
      dispatch(customContentActions.addCustomArmor(armor));
    }, [dispatch])
  };
}

export function useCharacterPersistenceActions() {
  const dispatch = useAppDispatch();
  const character = useCharacterState();
  const isLoading = useAppSelector(selectCharacterLoading);

  return {
    resetCharacter: useCallback(() => {
      const freshCharacter = createDefaultCharacter();
      const emptyContent = createEmptyCustomContent();

      if (isLoading) {
        requestManualCharacterResetBeforeHydration();
      }

      dispatch(characterActions.resetDomainState(freshCharacter));
      dispatch(customContentActions.resetCustomContent(emptyContent));
      dispatch(characterActions.setError(null));

      saveCharacterToDB(freshCharacter).catch((saveError) => {
        console.error('Failed to save new character after reset:', saveError);
        dispatch(characterActions.setError('Ошибка сохранения персонажа'));
      });

      Promise.all([
        clearCustomImplantsFromDB(),
        clearCustomWeaponsFromDB(),
        clearCustomArmorFromDB(),
        clearCustomProgramsFromDB()
      ]).catch((clearError) => {
        console.error('Failed to clear custom content after reset:', clearError);
        dispatch(characterActions.setError('Ошибка сброса пользовательского контента'));
      });
    }, [dispatch, isLoading]),
    wipeCharacterData: useCallback(async () => {
      try {
        await clearCharacterDataFromDB();
        dispatch(characterActions.resetDomainState(createDefaultCharacter()));
        dispatch(customContentActions.resetCustomContent(createEmptyCustomContent()));
        dispatch(characterActions.setError(null));
      } catch (wipeError) {
        console.error('Failed to wipe character data:', wipeError);
        dispatch(characterActions.setError('Ошибка полного удаления персонажа'));
        throw wipeError;
      }
    }, [dispatch]),
    exportCharacter: useCallback(() => JSON.stringify(character, null, 2), [character]),
    importCharacter: useCallback((json: string) => {
      try {
        const parsed = parseImportJson(json, MAX_IMPORT_JSON_BYTES);
        const sanitized = sanitizeCharacterImport(parsed, DEFAULT_CHARACTER);
        dispatch(characterActions.replaceCharacter(sanitized));
        dispatch(characterActions.setError(null));
      } catch (importError) {
        console.error('Import failed:', importError);
        dispatch(characterActions.setError('Ошибка импорта персонажа'));
      }
    }, [dispatch]),
    exportAllData: useCallback(async () => {
      const data = await exportAllDataFromDB();
      return JSON.stringify(data, null, 2);
    }, []),
    importAllData: useCallback(async (json: string) => {
      try {
        const data = parseImportJson(json, MAX_IMPORT_JSON_BYTES);
        await importDataToDB(data);

        const [savedChar, implants, weapons, armor, programs] = await Promise.all([
          loadCharacterFromDB(),
          loadCustomImplantsFromDB(),
          loadCustomWeaponsFromDB(),
          loadCustomArmorFromDB(),
          loadCustomProgramsFromDB()
        ]);

        dispatch(characterActions.hydrateSuccess(
          savedChar ? sanitizeCharacterImport(savedChar, DEFAULT_CHARACTER) : createDefaultCharacter()
        ));
        dispatch(customContentActions.replaceCustomContent({
          cyberware: sanitizeCustomCyberwareImport(implants),
          weapons: sanitizeCustomWeaponImport(weapons),
          armor: sanitizeCustomArmorImport(armor),
          programs: sanitizeCustomProgramImport(programs)
        }));
        dispatch(characterActions.setError(null));
      } catch (importError) {
        console.error('Import error:', importError);
        dispatch(characterActions.setError('Ошибка импорта данных'));
        throw importError;
      }
    }, [dispatch])
  };
}
