import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  characterActions,
  selectCharacter,
  selectCharacterLoading
} from '../../entities/character/model/characterSlice';
import { customContentActions, selectCustomContent } from '../../entities/character/model/customContentSlice';
import { createDefaultCharacter, createEmptyCustomContent } from '../../entities/character/model/characterState';
import type { CustomContent } from '@/types';
import {
  initDB,
  saveCharacterToDB,
  loadCharacterFromDB,
  saveCustomImplantToDB,
  loadCustomImplantsFromDB,
  saveCustomWeaponToDB,
  loadCustomWeaponsFromDB,
  saveCustomArmorToDB,
  loadCustomArmorFromDB,
  saveCustomProgramToDB,
  loadCustomProgramsFromDB
} from '../../services/indexedDB';
import {
  sanitizeCharacterImport,
  sanitizeCustomArmorImport,
  sanitizeCustomCyberwareImport,
  sanitizeCustomProgramImport,
  sanitizeCustomWeaponImport
} from '../../utils/importValidation';

function buildPersistedCustomIds(content?: CustomContent) {
  return {
    cyberware: new Set((content?.cyberware ?? []).map((item) => item.id)),
    weapons: new Set((content?.weapons ?? []).map((item) => item.id)),
    armor: new Set((content?.armor ?? []).map((item) => item.id)),
    programs: new Set((content?.programs ?? []).map((item) => item.id))
  };
}

function persistNewCustomItems<T extends { id: string }>(
  items: T[],
  persistedIds: Set<string>,
  saveItem: (item: T) => Promise<unknown>,
  onError: (itemId: string, error: unknown) => void
) {
  items.forEach((item) => {
    if (persistedIds.has(item.id)) {
      return;
    }

    persistedIds.add(item.id);
    saveItem(item).catch((error) => {
      persistedIds.delete(item.id);
      onError(item.id, error);
    });
  });
}

const DEFAULT_CHARACTER = createDefaultCharacter();
let manualResetRequestedBeforeHydration = false;

export function requestManualCharacterResetBeforeHydration(): void {
  manualResetRequestedBeforeHydration = true;
}

export function CharacterPersistenceBridge({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const character = useAppSelector(selectCharacter);
  const customContent = useAppSelector(selectCustomContent);
  const isLoading = useAppSelector(selectCharacterLoading);
  const didManualResetBeforeHydration = useRef(false);
  const persistedCustomIdsRef = useRef(buildPersistedCustomIds());

  const resetPersistedCustomIds = useCallback((content?: CustomContent) => {
    persistedCustomIdsRef.current = buildPersistedCustomIds(content);
  }, []);

  const hydrateFromDB = useCallback(async (options?: { respectManualReset?: boolean; shouldApply?: () => boolean }) => {
    const respectManualReset = options?.respectManualReset ?? true;
    const shouldApply = options?.shouldApply ?? (() => true);
    const [savedChar, implants, weapons, armor, programs] = await Promise.all([
      loadCharacterFromDB(),
      loadCustomImplantsFromDB(),
      loadCustomWeaponsFromDB(),
      loadCustomArmorFromDB(),
      loadCustomProgramsFromDB()
    ]);

    if (!shouldApply()) {
      return;
    }

    if (respectManualReset && didManualResetBeforeHydration.current) {
      const emptyContent = createEmptyCustomContent();
      dispatch(characterActions.resetDomainState(createDefaultCharacter()));
      dispatch(customContentActions.resetCustomContent(emptyContent));
      resetPersistedCustomIds(emptyContent);
      manualResetRequestedBeforeHydration = false;
      return;
    }

    const sanitizedCustomContent = {
      cyberware: sanitizeCustomCyberwareImport(implants),
      weapons: sanitizeCustomWeaponImport(weapons),
      armor: sanitizeCustomArmorImport(armor),
      programs: sanitizeCustomProgramImport(programs)
    };

    dispatch(characterActions.hydrateSuccess(
      savedChar ? sanitizeCharacterImport(savedChar, DEFAULT_CHARACTER) : createDefaultCharacter()
    ));
    dispatch(customContentActions.replaceCustomContent(sanitizedCustomContent));
    resetPersistedCustomIds(sanitizedCustomContent);
  }, [dispatch, resetPersistedCustomIds]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      dispatch(characterActions.hydrateStart());
      try {
        await initDB();
        if (isMounted) {
          await hydrateFromDB({ respectManualReset: true, shouldApply: () => isMounted });
          dispatch(characterActions.setError(null));
        }
      } catch (error) {
        if (isMounted) {
          console.error('DB load error:', error);
          dispatch(characterActions.hydrateFailure('Не удалось загрузить данные персонажа'));
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [dispatch, hydrateFromDB]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const saveTimeout = window.setTimeout(() => {
      saveCharacterToDB(character).catch((error) => {
        console.error('Failed to save character:', error);
        dispatch(characterActions.setError('Ошибка сохранения персонажа'));
      });
    }, 500);

    return () => {
      window.clearTimeout(saveTimeout);
    };
  }, [character, dispatch, isLoading]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    persistNewCustomItems(customContent.cyberware, persistedCustomIdsRef.current.cyberware, saveCustomImplantToDB, (_itemId, error) => console.error('Failed to save implant:', error));
    persistNewCustomItems(customContent.weapons, persistedCustomIdsRef.current.weapons, saveCustomWeaponToDB, (_itemId, error) => console.error('Failed to save weapon:', error));
    persistNewCustomItems(customContent.armor, persistedCustomIdsRef.current.armor, saveCustomArmorToDB, (_itemId, error) => console.error('Failed to save armor:', error));
    persistNewCustomItems(customContent.programs, persistedCustomIdsRef.current.programs, saveCustomProgramToDB, (_itemId, error) => console.error('Failed to save program:', error));
  }, [customContent, isLoading]);

  useEffect(() => {
    didManualResetBeforeHydration.current = manualResetRequestedBeforeHydration;
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) {
      didManualResetBeforeHydration.current = false;
      manualResetRequestedBeforeHydration = false;
    }
  }, [isLoading]);

  return <>{children}</>;
}
