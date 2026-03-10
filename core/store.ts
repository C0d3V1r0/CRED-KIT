import { configureStore } from '@reduxjs/toolkit';
import { appShellReducer } from './model/appShellSlice';
import { characterReducer } from '../entities/character/model/characterSlice';
import { customContentReducer } from '../entities/character/model/customContentSlice';
import { settingsReducer } from '../features/settings/model/settingsSlice';

export function createAppStore() {
  return configureStore({
    reducer: {
      appShell: appShellReducer,
      characterDomain: characterReducer,
      customContentDomain: customContentReducer,
      settings: settingsReducer
    }
  });
}

export const appStore = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
