import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createEmptyCustomContent } from './characterState';
import type { Armor, CustomContent, Cyberware, NetProgram, Weapon } from '@/types';

export interface CustomContentState {
  customContent: CustomContent;
}

const initialState: CustomContentState = {
  customContent: createEmptyCustomContent()
};

const customContentSlice = createSlice({
  name: 'customContent',
  initialState,
  reducers: {
    replaceCustomContent(state, action: PayloadAction<CustomContent>) {
      state.customContent = action.payload;
    },
    resetCustomContent(state, action: PayloadAction<CustomContent | undefined>) {
      state.customContent = action.payload ?? createEmptyCustomContent();
    },
    addCustomCyberware(state, action: PayloadAction<Cyberware>) {
      state.customContent.cyberware.push(action.payload);
    },
    addCustomProgram(state, action: PayloadAction<NetProgram>) {
      state.customContent.programs.push(action.payload);
    },
    addCustomWeapon(state, action: PayloadAction<Weapon>) {
      state.customContent.weapons.push(action.payload);
    },
    addCustomArmor(state, action: PayloadAction<Armor>) {
      state.customContent.armor.push(action.payload);
    }
  }
});

export const customContentReducer = customContentSlice.reducer;
export const customContentActions = customContentSlice.actions;

type CustomContentRootState = {
  customContentDomain: CustomContentState;
};

export const selectCustomContentDomain = (state: CustomContentRootState): CustomContentState => state.customContentDomain;
export const selectCustomContent = createSelector(selectCustomContentDomain, (state) => state.customContent);
