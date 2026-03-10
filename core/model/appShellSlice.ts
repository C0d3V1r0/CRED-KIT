import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AppTabId =
  | 'character'
  | 'cyberware'
  | 'netrunner'
  | 'equipment'
  | 'patchnotesDev'
  | 'newbieMap'
  | 'about';

export interface AppShellState {
  activeTab: AppTabId;
  isMobileMenuOpen: boolean;
  showWhatsNewAlert: boolean;
  hasUnreadWhatsNew: boolean;
  isOffline: boolean;
}

const initialState: AppShellState = {
  activeTab: 'character',
  isMobileMenuOpen: false,
  showWhatsNewAlert: false,
  hasUnreadWhatsNew: false,
  isOffline: false
};

const appShellSlice = createSlice({
  name: 'appShell',
  initialState,
  reducers: {
    hydrateShellState(state, action: PayloadAction<Partial<AppShellState>>) {
      Object.assign(state, action.payload);
    },
    setActiveTab(state, action: PayloadAction<AppTabId>) {
      state.activeTab = action.payload;
      state.isMobileMenuOpen = false;
    },
    toggleMobileMenu(state) {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeMobileMenu(state) {
      state.isMobileMenuOpen = false;
    },
    showWhatsNewAlert(state) {
      state.showWhatsNewAlert = true;
    },
    dismissWhatsNewAlert(state) {
      state.showWhatsNewAlert = false;
    },
    setHasUnreadWhatsNew(state, action: PayloadAction<boolean>) {
      state.hasUnreadWhatsNew = action.payload;
    },
    markWhatsNewAsSeen(state) {
      state.hasUnreadWhatsNew = false;
    },
    setOfflineState(state, action: PayloadAction<boolean>) {
      state.isOffline = action.payload;
    }
  }
});

export const appShellReducer = appShellSlice.reducer;
export const appShellActions = appShellSlice.actions;

type AppShellRootState = {
  appShell: AppShellState;
};

export const selectAppShell = (state: AppShellRootState): AppShellState => state.appShell;
export const selectActiveTab = createSelector(selectAppShell, (state) => state.activeTab);
export const selectIsMobileMenuOpen = createSelector(selectAppShell, (state) => state.isMobileMenuOpen);
export const selectShowWhatsNewAlert = createSelector(selectAppShell, (state) => state.showWhatsNewAlert);
export const selectHasUnreadWhatsNew = createSelector(selectAppShell, (state) => state.hasUnreadWhatsNew);
export const selectIsOffline = createSelector(selectAppShell, (state) => state.isOffline);
