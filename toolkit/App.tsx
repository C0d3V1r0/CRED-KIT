'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AppProviders } from '../core/providers/AppProviders';
import { useAppDispatch, useAppSelector } from '../core/hooks';
import {
  appShellActions,
  selectActiveTab,
  selectHasUnreadWhatsNew,
  selectIsMobileMenuOpen,
  selectIsOffline,
  selectShowWelcomeAlert,
  selectShowWhatsNewAlert,
  type AppTabId
} from '../core/model/appShellSlice';
import { markWelcomeAlertSeen, markWhatsNewSeen } from '../core/providers/AppShellBridge';
import { AppShellChrome } from '../core/ui/AppShellChrome';
import { AppShellOverlays } from '../core/ui/AppShellOverlays';
import { ToastProvider } from '../components/common/Toast';
import { useLanguage } from '../features/settings/model/hooks';
import { SpinnerWithText } from '../components/common/Spinner';
import { Icons } from '../utils/icons';
import { APP_CONFIG } from '../config/appConfig';
import { initWebVitals } from '../utils/webVitals';
import { isSupportedLanguage } from '../i18n/routing';
import type { Language } from '../i18n/translations';

const CharacterSheet = dynamic(() => import('../components/CharacterSheet/CharacterSheet'));
const CyberwareModule = dynamic(() => import('../components/CyberwareModule/CyberwareModule'));
const NetrunningModule = dynamic(() => import('../components/NetrunningModule/NetrunningModule'));
const GearModule = dynamic(() => import('../components/GearModule/GearModule'));
const DevPatchnotesTab = dynamic(() => import('../components/DevPatchnotesTab/DevPatchnotesTab'));
const NewbieMapTab = dynamic(async () => (await import('../components/NewbieMapTab/NewbieMapTab')).NewbieMapTab);
const AboutTab = dynamic(() => import('../components/AboutTab/AboutTab'));

function AppContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = useAppSelector(selectActiveTab);
  const isMobileMenuOpen = useAppSelector(selectIsMobileMenuOpen);
  const showWelcomeAlert = useAppSelector(selectShowWelcomeAlert);
  const showWhatsNewAlert = useAppSelector(selectShowWhatsNewAlert);
  const hasUnreadWhatsNew = useAppSelector(selectHasUnreadWhatsNew);
  const isOffline = useAppSelector(selectIsOffline);
  const headerRef = useRef<HTMLElement | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const donateUrl = APP_CONFIG.donateUrl;
  const versionLabel = APP_CONFIG.versionLabel;
  const hasDonateUrl = donateUrl.length > 0;

  const navTabs = useMemo(() => [
    { id: 'character' as const, label: t('app.nav.character'), icon: Icons.character },
    { id: 'cyberware' as const, label: t('app.nav.cyberware'), icon: Icons.cyberware },
    { id: 'netrunner' as const, label: t('app.nav.netrunner'), icon: Icons.netrunner },
    { id: 'equipment' as const, label: t('app.nav.equipment'), icon: Icons.weapons },
    { id: 'patchnotesDev' as const, label: t('app.nav.patchnotesDev'), icon: Icons.about },
    { id: 'newbieMap' as const, label: t('app.nav.newbieMap'), icon: Icons.info },
    { id: 'about' as const, label: t('app.nav.about'), icon: Icons.about }
  ], [t]);

  const handleTabChange = (tabId: AppTabId) => {
    dispatch(appShellActions.setActiveTab(tabId));
  };

  const dismissWelcomeAlert = () => {
    markWelcomeAlertSeen();
    dispatch(appShellActions.dismissWelcomeAlert());
  };

  const startFromNewbieMap = () => {
    handleTabChange('newbieMap');
    dismissWelcomeAlert();
  };

  const markWhatsNewAsSeen = () => {
    markWhatsNewSeen();
    dispatch(appShellActions.markWhatsNewAsSeen());
  };

  const openWhatsNewAlert = () => {
    dispatch(appShellActions.showWhatsNewAlert());
  };

  const dismissWhatsNewAlert = () => {
    dispatch(appShellActions.dismissWhatsNewAlert());
  };

  const acknowledgeWhatsNew = () => {
    markWhatsNewAsSeen();
    dispatch(appShellActions.dismissWhatsNewAlert());
  };

  const whatsNewHighlights = useMemo(() => [
    t('whatsNew.item.ruleAccuracy'),
    t('whatsNew.item.skillsContract'),
    t('whatsNew.item.armorTracks'),
    t('whatsNew.item.languageFlow'),
    t('whatsNew.item.errorRecovery')
  ], [t]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof document === 'undefined') return;

    const headerElement = headerRef.current;
    if (!headerElement) return;

    const updateHeaderHeightVars = () => {
      const measuredHeight = Math.max(64, Math.round(headerElement.getBoundingClientRect().height));
      document.documentElement.style.setProperty('--app-header-height', `${measuredHeight}px`);
      document.documentElement.style.setProperty('--app-mobile-header-height', `${measuredHeight}px`);
    };

    updateHeaderHeightVars();
    window.addEventListener('resize', updateHeaderHeightVars);

    let resizeObserver: ResizeObserver | null = null;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => updateHeaderHeightVars());
      resizeObserver.observe(headerElement);
    }

    return () => {
      window.removeEventListener('resize', updateHeaderHeightVars);
      resizeObserver?.disconnect();
    };
  }, [language, hasDonateUrl]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      initWebVitals();
    }
  }, []);

  useEffect(() => {
    const routeLanguage = pathname.split('/')[1];

    if (!isSupportedLanguage(routeLanguage) || routeLanguage === language) {
      return;
    }

    setLanguage(routeLanguage);
  }, [language, pathname, setLanguage]);

  const setRouteLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);

    const segments = pathname.split('/');
    if (segments.length > 1 && isSupportedLanguage(segments[1])) {
      segments[1] = nextLanguage;
      router.push(segments.join('/') || `/${nextLanguage}/app`);
      return;
    }

    router.push(`/${nextLanguage}/app`);
  };

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-text app-shell">
      <a href="#main-content" className="skip-link">{t('app.skipNavigation')}</a>

      {isOffline && (
        <div
          className="fixed top-3 right-3 z-[90] px-3 py-2 rounded-lg border border-cyber-orange/45 bg-cyber-dark/90 text-cyber-orange text-xs shadow-lg"
          role="status"
          aria-live="polite"
          data-testid="offline-indicator"
        >
          {language === 'ru' ? 'Офлайн режим: часть функций недоступна' : 'Offline mode: some features are unavailable'}
        </div>
      )}

      <AppShellOverlays
        language={language}
        showWelcomeAlert={showWelcomeAlert}
        showWhatsNewAlert={showWhatsNewAlert}
        whatsNewHighlights={whatsNewHighlights}
        t={t}
        onDismissWelcome={dismissWelcomeAlert}
        onStartFromNewbieMap={startFromNewbieMap}
        onDismissWhatsNew={dismissWhatsNewAlert}
        onAcknowledgeWhatsNew={acknowledgeWhatsNew}
      />

      <AppShellChrome
        headerRef={headerRef}
        language={language}
        navTabs={navTabs}
        activeTab={activeTab}
        isMobileMenuOpen={isMobileMenuOpen}
        hasDonateUrl={hasDonateUrl}
        donateUrl={donateUrl}
        hasUnreadWhatsNew={hasUnreadWhatsNew}
        versionLabel={versionLabel}
        t={t}
        onToggleMobileMenu={() => dispatch(appShellActions.toggleMobileMenu())}
        onCloseMobileMenu={() => dispatch(appShellActions.closeMobileMenu())}
        onOpenWhatsNew={openWhatsNewAlert}
        onSetLanguage={setRouteLanguage}
        onTabChange={handleTabChange}
      />

      <main id="main-content" className="max-w-7xl mx-auto px-4 py-6">
        <div className="animate-fade-in">
          {/* Ленивая загрузка вкладок ускоряет первый рендер приложения */}
          <Suspense fallback={<SpinnerWithText text={language === 'ru' ? 'Загрузка модуля...' : 'Loading module...'} />}>
            {activeTab === 'character' && <CharacterSheet />}
            {activeTab === 'cyberware' && <CyberwareModule />}
            {activeTab === 'netrunner' && <NetrunningModule />}
            {activeTab === 'equipment' && <GearModule />}
            {activeTab === 'patchnotesDev' && <DevPatchnotesTab />}
            {activeTab === 'newbieMap' && <NewbieMapTab />}
            {activeTab === 'about' && <AboutTab />}
          </Suspense>
        </div>
      </main>

      <footer className="mt-8 app-footer">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-cyber-muted text-sm">
              <span className="text-gradient-accent font-semibold tracking-[0.14em]">CRED KIT</span>
              <span>•</span>
              <span>Night City, 2045</span>
            </div>
            <div className="text-cyber-muted text-xs">{t('app.footer.tagline')}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface AppProps {
  initialLanguage?: Language;
}

function AppRoot({ initialLanguage = 'ru' }: AppProps) {
  return (
    <AppProviders initialLanguage={initialLanguage}>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AppProviders>
  );
}

export default AppRoot;
