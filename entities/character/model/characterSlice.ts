import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { calculateDerivedStats } from '../../../logic/character/statsCalculator';
import { createDefaultCharacter } from './characterState';
import type {
  Armor,
  Character,
  CustomCombatSkill,
  Cyberware,
  DerivedStats,
  Gear,
  ResourceTrack,
  StatKey,
  Weapon
} from '@/types';

export interface CharacterDomainState {
  character: Character;
  isLoading: boolean;
  error: string | null;
}

const initialState: CharacterDomainState = {
  character: createDefaultCharacter(),
  isLoading: true,
  error: null
};

const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    hydrateStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    hydrateSuccess(state, action: PayloadAction<Character>) {
      state.character = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    hydrateFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    replaceCharacter(state, action: PayloadAction<Character>) {
      state.character = action.payload;
    },
    resetDomainState(state, action: PayloadAction<Character>) {
      state.character = action.payload;
      state.error = null;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    updateStat(state, action: PayloadAction<{ stat: StatKey; value: number }>) {
      const parsed = parseInt(String(action.payload.value), 10);
      if (Number.isNaN(parsed)) {
        return;
      }

      state.character.stats[action.payload.stat] = parsed;
    },
    updateBasicInfo(
      state,
      action: PayloadAction<Partial<Pick<Character, 'name' | 'role' | 'level' | 'roleAbilityRank'>>>
    ) {
      Object.assign(state.character, action.payload);
    },
    updateSkills(state, action: PayloadAction<Record<string, number>>) {
      state.character.skills = action.payload;
    },
    updateCustomCombatSkills(state, action: PayloadAction<CustomCombatSkill[]>) {
      state.character.customCombatSkills = action.payload;
    },
    updateResource(
      state,
      action: PayloadAction<{
        resource: 'health' | 'humanity' | 'armorHead' | 'armorBody';
        value: Partial<ResourceTrack>;
      }>
    ) {
      const { resource, value } = action.payload;
      const previousTrack = resource === 'armorHead'
        ? state.character.armorState.head
        : resource === 'armorBody'
          ? state.character.armorState.body
          : state.character[resource];
      const nextMax = value.max !== undefined ? Math.max(0, value.max) : previousTrack.max;
      const rawCurrent = value.current !== undefined ? Math.max(0, value.current) : previousTrack.current;
      const nextTrack = {
        current: Math.min(rawCurrent, nextMax),
        max: nextMax
      };
      if (resource === 'armorHead') {
        state.character.armorState.head = nextTrack;
      } else if (resource === 'armorBody') {
        state.character.armorState.body = nextTrack;
      } else {
        state.character[resource] = nextTrack;
      }
    },
    updateMoney(state, action: PayloadAction<number>) {
      state.character.money = Math.max(0, action.payload);
    },
    addCyberware(state, action: PayloadAction<Cyberware>) {
      state.character.cyberware.push({ ...action.payload, installedAt: Date.now() });
    },
    removeCyberware(state, action: PayloadAction<number>) {
      state.character.cyberware = state.character.cyberware.filter((_, index) => index !== action.payload);
    },
    addWeapon(state, action: PayloadAction<Weapon>) {
      state.character.weapons = [...(state.character.weapons ?? []), action.payload];
    },
    removeWeapon(state, action: PayloadAction<number>) {
      state.character.weapons = (state.character.weapons ?? []).filter((_, index) => index !== action.payload);
    },
    addArmor(state, action: PayloadAction<Armor>) {
      state.character.armor = [...(state.character.armor ?? []), action.payload];
    },
    removeArmor(state, action: PayloadAction<number>) {
      state.character.armor = (state.character.armor ?? []).filter((_, index) => index !== action.payload);
    },
    addGear(state, action: PayloadAction<Gear>) {
      state.character.gear = [...(state.character.gear ?? []), action.payload];
    },
    removeGear(state, action: PayloadAction<number>) {
      state.character.gear = (state.character.gear ?? []).filter((_, index) => index !== action.payload);
    }
  }
});

export const characterReducer = characterSlice.reducer;
export const characterActions = characterSlice.actions;

type CharacterRootState = {
  characterDomain: CharacterDomainState;
};

export const selectCharacterDomain = (state: CharacterRootState): CharacterDomainState => state.characterDomain;
export const selectCharacter = createSelector(selectCharacterDomain, (state) => state.character);
export const selectCharacterError = createSelector(selectCharacterDomain, (state) => state.error);
export const selectCharacterLoading = createSelector(selectCharacterDomain, (state) => state.isLoading);
export const selectDerivedStats = createSelector(selectCharacter, (character): DerivedStats => (
      calculateDerivedStats(
        character.stats,
        character.cyberware,
        character.money,
        character.role === 'Netrunner' ? character.roleAbilityRank : 1,
        {
          health: character.health,
          humanity: character.humanity,
          armor: character.armorState
        }
      )
));
