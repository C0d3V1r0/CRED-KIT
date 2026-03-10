import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { APP_CONFIG } from '../../config/appConfig';
import {
  appShellActions,
  selectHasUnreadWhatsNew,
  selectIsMobileMenuOpen,
  selectShowWhatsNewAlert
} from '../model/appShellSlice';

const WHATS_NEW_SEEN_VERSION_KEY = 'credkit-whats-new-seen-version';
const WHATS_NEW_VERSION = APP_CONFIG.versionLabel;

function hasUnreadWhatsNewFlag(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(WHATS_NEW_SEEN_VERSION_KEY) !== WHATS_NEW_VERSION;
}

export function markWhatsNewSeen() {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(WHATS_NEW_SEEN_VERSION_KEY, WHATS_NEW_VERSION);
  }
}

export function AppShellBridge({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const showWhatsNewAlert = useAppSelector(selectShowWhatsNewAlert);
  const isMobileMenuOpen = useAppSelector(selectIsMobileMenuOpen);
  const hasUnreadWhatsNew = useAppSelector(selectHasUnreadWhatsNew);

  useEffect(() => {
    dispatch(appShellActions.hydrateShellState({
      isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
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
    if (showWhatsNewAlert || isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen, showWhatsNewAlert]);

  useEffect(() => {
    const onEscapePress = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
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
  }, [dispatch, isMobileMenuOpen, showWhatsNewAlert]);

  useEffect(() => {
    if (!hasUnreadWhatsNew) {
      markWhatsNewSeen();
    }
  }, [hasUnreadWhatsNew]);

  return <>{children}</>;
}
