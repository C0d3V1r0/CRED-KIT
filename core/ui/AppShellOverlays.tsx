import { MayaAvatar } from '../../components/common/MayaAvatar';

interface AppShellOverlaysProps {
  language: 'ru' | 'en';
  showWelcomeAlert: boolean;
  showWhatsNewAlert: boolean;
  whatsNewHighlights: string[];
  t: (key: string) => string;
  onDismissWelcome: () => void;
  onStartFromNewbieMap: () => void;
  onDismissWhatsNew: () => void;
  onAcknowledgeWhatsNew: () => void;
}

export function AppShellOverlays({
  language,
  showWelcomeAlert,
  showWhatsNewAlert,
  whatsNewHighlights,
  t,
  onDismissWelcome,
  onStartFromNewbieMap,
  onDismissWhatsNew,
  onAcknowledgeWhatsNew
}: AppShellOverlaysProps) {
  return (
    <>
      {showWelcomeAlert && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={language === 'ru' ? 'Закрыть приветственное окно' : 'Close welcome modal'}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onDismissWelcome}
          />
          <div
            className="welcome-modal relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-cyber-accent/25 bg-cyber-dark p-0 shadow-2xl glass-strong"
            data-testid="welcome-alert"
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
            aria-describedby="welcome-subtitle"
          >
            <div className="welcome-modal__glow" aria-hidden="true" />
            <div className="flex items-start justify-between gap-3 border-b border-cyber-gray/20 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <div className="welcome-modal__kicker">{t('welcome.kicker')}</div>
                <h2 id="welcome-title" className="mt-2 text-xl font-bold text-cyber-text sm:text-2xl">{t('welcome.title')}</h2>
                <p id="welcome-subtitle" className="mt-2 max-w-2xl text-sm text-cyber-muted sm:text-base">{t('welcome.subtitle')}</p>
              </div>
              <button
                type="button"
                onClick={onDismissWelcome}
                className="w-9 h-9 rounded-xl bg-cyber-dark/70 border border-cyber-gray/30 text-cyber-muted hover:text-cyber-text shrink-0"
                aria-label={language === 'ru' ? 'Закрыть' : 'Close'}
              >
                ✕
              </button>
            </div>

            <div className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_300px] lg:items-start">
              <div className="space-y-4">
                <div className="welcome-modal__lead">
                  <div className="welcome-modal__lead-title">{t('welcome.panelTitle')}</div>
                  <p className="mt-2 text-sm text-cyber-text/90 sm:text-base">{t('welcome.panelLead')}</p>
                  <p className="mt-3 text-sm text-cyber-muted">{t('welcome.hint')}</p>
                </div>

                <div className="grid gap-3">
                  {[
                    { title: t('welcome.point1.title'), desc: t('welcome.point1.desc') },
                    { title: t('welcome.point2.title'), desc: t('welcome.point2.desc') },
                    { title: t('welcome.point3.title'), desc: t('welcome.point3.desc') }
                  ].map((item, index) => (
                    <div key={item.title} className="welcome-modal__point">
                      <div className="welcome-modal__point-index">0{index + 1}</div>
                      <div className="min-w-0">
                        <div className="welcome-modal__point-title">{item.title}</div>
                        <p className="welcome-modal__point-desc">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="welcome-guide">
                <div className="welcome-guide__portrait">
                  <MayaAvatar size={156} />
                </div>
                <div className="welcome-guide__card">
                  <div className="welcome-guide__name">{t('whatsNew.guideName')}</div>
                  <p className="welcome-guide__status">{t('welcome.status')}</p>
                </div>
                <div className="welcome-guide__signal" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-cyber-gray/20 px-5 py-4 sm:flex-row sm:px-6">
              <button type="button" data-testid="welcome-open-map" onClick={onStartFromNewbieMap} className="btn flex-1">
                {t('welcome.start')}
              </button>
              <button
                type="button"
                data-testid="welcome-later"
                onClick={onDismissWelcome}
                className="px-4 py-2 rounded-xl border border-cyber-gray/30 bg-cyber-dark/60 text-cyber-muted hover:text-cyber-text sm:min-w-[170px]"
              >
                {t('welcome.later')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showWhatsNewAlert && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={language === 'ru' ? 'Закрыть окно нового' : 'Close what is new modal'}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onDismissWhatsNew}
          />
          <div
            className="relative w-full max-w-xl rounded-2xl border border-cyber-accent/35 bg-cyber-dark p-5 shadow-2xl glass-strong"
            data-testid="whats-new-alert"
            role="dialog"
            aria-modal="true"
            aria-labelledby="whats-new-title"
            aria-describedby="whats-new-subtitle"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="whats-new-title" className="text-lg font-bold text-cyber-text">{t('whatsNew.title')}</h2>
                <p id="whats-new-subtitle" className="mt-1 text-cyber-muted text-sm">{t('whatsNew.subtitle')}</p>
              </div>
              <button
                type="button"
                onClick={onDismissWhatsNew}
                className="w-8 h-8 rounded-lg bg-cyber-dark/70 border border-cyber-gray/40 text-cyber-muted hover:text-cyber-text"
                aria-label={language === 'ru' ? 'Закрыть' : 'Close'}
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[120px_1fr] sm:items-start">
              <div className="whats-new-guide" aria-hidden="true">
                <div className="whats-new-guide-avatar">
                  <MayaAvatar size={92} />
                </div>
                <p className="whats-new-guide-name">{t('whatsNew.guideName')}</p>
              </div>

              <div className="rounded-xl border border-cyber-gray/45 bg-cyber-panel/65 p-4">
                <p className="text-sm text-cyber-text">{t('whatsNew.intro')}</p>
                <ul className="mt-3 list-disc pl-5 space-y-1.5 text-sm text-cyber-muted">
                  {whatsNewHighlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 flex items-center">
              <button type="button" data-testid="whats-new-mark-read" onClick={onAcknowledgeWhatsNew} className="btn w-full">
                {t('whatsNew.markRead')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
