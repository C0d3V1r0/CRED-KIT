import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { APP_CONFIG } from '../../config/appConfig';
import {
  appShellActions,
  selectHasUnreadWhatsNew,
  selectIsMobileMenuOpen,
  selectShowWelcomeAlert,
  selectShowWhatsNewAlert
} from '../model/appShellSlice';

const WELCOME_ALERT_SEEN_KEY = 'credkit-welcome-alert-seen-v1';
const WHATS_NEW_SEEN_VERSION_KEY = 'credkit-whats-new-seen-version';
const WHATS_NEW_VERSION = APP_CONFIG.versionLabel;

function hasSeenWelcomeAlert(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.localStorage.getItem(WELCOME_ALERT_SEEN_KEY) === '1';
}

function hasUnreadWhatsNewFlag(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(WHATS_NEW_SEEN_VERSION_KEY) !== WHATS_NEW_VERSION;
}

export function markWelcomeAlertSeen() {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(WELCOME_ALERT_SEEN_KEY, '1');
  }
}

export function markWhatsNewSeen() {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(WHATS_NEW_SEEN_VERSION_KEY, WHATS_NEW_VERSION);
  }
}

export function AppShellBridge({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const showWelcomeAlert = useAppSelector(selectShowWelcomeAlert);
  const showWhatsNewAlert = useAppSelector(selectShowWhatsNewAlert);
  const isMobileMenuOpen = useAppSelector(selectIsMobileMenuOpen);
  const hasUnreadWhatsNew = useAppSelector(selectHasUnreadWhatsNew);

  useEffect(() => {
    dispatch(appShellActions.hydrateShellState({
      isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
      showWelcomeAlert: !hasSeenWelcomeAlert(),
      hasUnreadWhatsNew: hasUnreadWhatsNewFlag()
    }));
  }, [dispatch]);

  useEffect(() => {
    const handleOffline = () => dispatch(appShellActions.setOfflineState(true));
    const handleOnline = () => dispatch(appShellActions.setOfflineState(false));

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [dispatch]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    if (showWelcomeAlert || showWhatsNewAlert || isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen, showWelcomeAlert, showWhatsNewAlert]);

  useEffect(() => {
    const onEscapePress = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (showWelcomeAlert) {
        markWelcomeAlertSeen();
        dispatch(appShellActions.dismissWelcomeAlert());
        return;
      }

      if (showWhatsNewAlert) {
        dispatch(appShellActions.dismissWhatsNewAlert());
        return;
      }

      if (isMobileMenuOpen) {
        dispatch(appShellActions.closeMobileMenu());
      }
    };

    window.addEventListener('keydown', onEscapePress);
    return () => window.removeEventListener('keydown', onEscapePress);
  }, [dispatch, isMobileMenuOpen, showWelcomeAlert, showWhatsNewAlert]);

  useEffect(() => {
    if (!hasUnreadWhatsNew) {
      markWhatsNewSeen();
    }
  }, [hasUnreadWhatsNew]);

  return <>{children}</>;
}
