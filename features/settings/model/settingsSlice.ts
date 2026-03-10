import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Language } from '../../../i18n/translations';

export interface SettingsState {
  language: Language;
}

const initialState: SettingsState = {
  language: 'ru'
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    toggleLanguage(state) {
      state.language = state.language === 'ru' ? 'en' : 'ru';
    }
  }
});

export const settingsReducer = settingsSlice.reducer;
export const settingsActions = settingsSlice.actions;

type SettingsRootState = {
  settings: SettingsState;
};

export const selectSettings = (state: SettingsRootState): SettingsState => state.settings;
export const selectLanguage = createSelector(selectSettings, (state) => state.language);
