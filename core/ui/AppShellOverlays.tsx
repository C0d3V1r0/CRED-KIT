import { MayaAvatar } from '../../components/common/MayaAvatar';

interface AppShellOverlaysProps {
  language: 'ru' | 'en';
  showWhatsNewAlert: boolean;
  whatsNewHighlights: string[];
  t: (key: string) => string;
  onDismissWhatsNew: () => void;
  onAcknowledgeWhatsNew: () => void;
}

export function AppShellOverlays({
  language,
  showWhatsNewAlert,
  whatsNewHighlights,
  t,
  onDismissWhatsNew,
  onAcknowledgeWhatsNew
}: AppShellOverlaysProps) {
  return (
    <>
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
