import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectLanguage, settingsActions } from '../../features/settings/model/settingsSlice';
import type { Language } from '../../i18n/translations';

const STORAGE_KEY = 'credkit-language';

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'ru';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'ru' || stored === 'en') {
    return stored;
  }

  return 'ru';
}

function resolveBridgeLanguage(initialLanguage?: Language): Language {
  if (initialLanguage === 'ru' || initialLanguage === 'en') {
    return initialLanguage;
  }

  return getInitialLanguage();
}

interface LanguageBridgeProps {
  children: React.ReactNode;
  initialLanguage?: Language;
}

export function LanguageBridge({ children, initialLanguage }: LanguageBridgeProps) {
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);

  useEffect(() => {
    dispatch(settingsActions.setLanguage(resolveBridgeLanguage(initialLanguage)));
  }, [dispatch, initialLanguage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  return <>{children}</>;
}
