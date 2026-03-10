import { useRef } from 'react';
import { Provider } from 'react-redux';
import { createAppStore } from '../store';
import { AppShellBridge } from './AppShellBridge';
import { CharacterPersistenceBridge } from './CharacterPersistenceBridge';
import { LanguageBridge } from './LanguageBridge';
import type { Language } from '../../i18n/translations';

interface AppProvidersProps {
  children: React.ReactNode;
  initialLanguage?: Language;
}

export function AppProviders({ children, initialLanguage }: AppProvidersProps) {
  const storeRef = useRef(createAppStore());

  return (
    <Provider store={storeRef.current}>
      <LanguageBridge initialLanguage={initialLanguage}>
        <AppShellBridge>
          <CharacterPersistenceBridge>{children}</CharacterPersistenceBridge>
        </AppShellBridge>
      </LanguageBridge>
    </Provider>
  );
}
