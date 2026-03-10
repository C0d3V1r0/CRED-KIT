import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../core/hooks';
import type { Language } from '../../../i18n/translations';
import { translations } from '../../../i18n/translations';
import { selectLanguage, settingsActions } from './settingsSlice';

export interface LanguageApi {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

export function useLanguage(): LanguageApi {
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);

  const setLanguage = useCallback((nextLanguage: Language) => {
    dispatch(settingsActions.setLanguage(nextLanguage));
  }, [dispatch]);

  const toggleLanguage = useCallback(() => {
    dispatch(settingsActions.toggleLanguage());
  }, [dispatch]);

  const t = useCallback((key: string): string => {
    const value = translations[language][key];
    if (value) {
      return value;
    }

    const fallback = translations.ru[key];
    if (fallback) {
      return fallback;
    }

    return key;
  }, [language]);

  return {
    language,
    setLanguage,
    toggleLanguage,
    t
  };
}
