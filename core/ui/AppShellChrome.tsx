import type { ReactNode, RefObject } from 'react';
import type { AppTabId } from '../model/appShellSlice';

interface NavTab {
  id: AppTabId;
  label: string;
  icon: ReactNode;
}

interface AppShellChromeProps {
  headerRef: RefObject<HTMLElement | null>;
  language: 'ru' | 'en';
  navTabs: NavTab[];
  activeTab: AppTabId;
  isMobileMenuOpen: boolean;
  hasDonateUrl: boolean;
  donateUrl: string;
  hasUnreadWhatsNew: boolean;
  versionLabel: string;
  t: (key: string) => string;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
  onOpenWhatsNew: () => void;
  onSetLanguage: (language: 'ru' | 'en') => void;
  onTabChange: (tabId: AppTabId) => void;
}

export function AppShellChrome({
  headerRef,
  language,
  navTabs,
  activeTab,
  isMobileMenuOpen,
  hasDonateUrl,
  donateUrl,
  hasUnreadWhatsNew,
  versionLabel,
  t,
  onToggleMobileMenu,
  onCloseMobileMenu,
  onOpenWhatsNew,
  onSetLanguage,
  onTabChange
}: AppShellChromeProps) {
  return (
    <>
      <header ref={headerRef} className="sticky top-0 z-50 app-header">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-accent/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 py-4 app-header-inner">
          <div className="flex items-center justify-between app-header-row">
            <div className="flex items-center gap-4 app-brand">
              <div className="app-brand-mark" aria-hidden="true">
                <div className="app-brand-mark-inner">
                  <span className="text-cyber-accent font-bold text-lg">CK</span>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-[0.14em] font-orbitron sm:text-xl">
                  <span className="text-gradient-accent">CRED KIT</span>
                </h1>
                <p className="text-cyber-muted text-xs app-brand-subtitle">Cyberpunk RED Digital Kit</p>
              </div>
            </div>

            <div className="flex items-center gap-2 app-header-controls">
              <button
                type="button"
                className="app-burger-btn"
                data-testid="mobile-menu-toggle"
                onClick={onToggleMobileMenu}
                aria-label={language === 'ru' ? 'Открыть меню навигации' : 'Open navigation menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav-panel"
              >
                <span className="sr-only">{language === 'ru' ? 'Меню' : 'Menu'}</span>
                {isMobileMenuOpen ? '✕' : '☰'}
              </button>
              {hasDonateUrl && (
                <a
                  href={donateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-cyber-green/15 border border-cyber-green/40 text-cyber-green text-[11px] font-medium hover:bg-cyber-green/25 transition-colors"
                >
                  {t('app.supportProject')}
                </a>
              )}
              <button
                type="button"
                className={`whats-new-btn ${hasUnreadWhatsNew ? 'is-unread' : ''}`}
                data-testid="whats-new-open"
                onClick={onOpenWhatsNew}
              >
                <span className="whats-new-glyph" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span className="whats-new-copy-title">{t('whatsNew.button')}</span>
                {hasUnreadWhatsNew && <span className="whats-new-dot" data-testid="whats-new-unread-dot" />}
              </button>
              <div className="flex items-center rounded-full bg-cyber-dark/70 border border-cyber-gray/40 p-1">
                <button
                  onClick={() => onSetLanguage('ru')}
                  data-testid="lang-ru"
                    className={`px-2 py-1 rounded-full text-[11px] transition-colors ${
                    language === 'ru' ? 'bg-cyber-accent/20 text-cyber-accent' : 'text-cyber-muted hover:text-cyber-text'
                  }`}
                >
                  {t('app.lang.ru')}
                </button>
                <button
                  onClick={() => onSetLanguage('en')}
                  data-testid="lang-en"
                    className={`px-2 py-1 rounded-full text-[11px] transition-colors ${
                    language === 'en' ? 'bg-cyber-accent/20 text-cyber-accent' : 'text-cyber-muted hover:text-cyber-text'
                  }`}
                >
                  {t('app.lang.en')}
                </button>
              </div>
              <span className="version-badge app-version-pill">{versionLabel}</span>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <button
          type="button"
          className="app-mobile-menu-backdrop"
          aria-label={language === 'ru' ? 'Закрыть меню' : 'Close menu'}
          onClick={onCloseMobileMenu}
        />
      )}

      <nav
        id="mobile-nav-panel"
        className={`app-mobile-nav ${isMobileMenuOpen ? 'is-open' : ''}`}
        aria-label={language === 'ru' ? 'Мобильная навигация' : 'Mobile navigation'}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="app-mobile-nav-inner">
          {navTabs.map((tab) => (
            <button
              key={`mobile-${tab.id}`}
              type="button"
              data-testid={`mobile-nav-${tab.id}`}
              className={`app-mobile-nav-btn ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="app-mobile-nav-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <nav className="sticky z-40 app-nav app-nav--sticky">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide app-nav-row">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                data-testid={`nav-${tab.id}`}
                className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-300 app-nav-btn ${activeTab === tab.id ? 'is-active' : ''} ${
                  activeTab === tab.id ? 'text-cyber-text' : 'text-cyber-muted hover:text-cyber-text'
                }`}
                title={tab.label}
              >
                {activeTab === tab.id && (
                  <div className="absolute inset-0 rounded-lg bg-cyber-accent/10 border border-cyber-accent/30" />
                )}
                <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id ? 'bg-cyber-accent/5' : 'opacity-0 group-hover:opacity-100 bg-cyber-gray/20'
                }`} />
                <span className={`relative z-10 transition-colors ${activeTab === tab.id ? 'text-cyber-accent' : ''}`}>{tab.icon}</span>
                <span className="relative z-10 app-nav-label">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-cyber-accent shadow-glow" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
