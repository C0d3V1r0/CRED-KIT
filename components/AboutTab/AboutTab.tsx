import { useState } from 'react';
import { Icons } from '../../utils/icons';
import { useLanguage } from '../../features/settings/model/hooks';
import { APP_CONFIG } from '../../config/appConfig';
import { Modal } from '../common/Modal';
import { BugReportTab } from '../BugReportTab/BugReportTab';

const valueCards = [
  {
    key: 'fast',
    icon: Icons.dice,
    iconClass: 'text-cyber-accent',
    iconBgClass: 'bg-cyber-accent/15'
  },
  
  {
    key: 'clear',
    icon: Icons.check,
    iconClass: 'text-cyber-cyan',
    iconBgClass: 'bg-cyber-cyan/15'
  },
  {
    key: 'safe',
    icon: Icons.shield,
    iconClass: 'text-cyber-green',
    iconBgClass: 'bg-cyber-green/15'
  },
  {
    key: 'time',
    icon: Icons.clock,
    iconClass: 'text-cyber-orange',
    iconBgClass: 'bg-cyber-orange/15'
  },
  {
    key: 'control',
    icon: Icons.save,
    iconClass: 'text-cyber-purple',
    iconBgClass: 'bg-cyber-purple/15'
  }
] as const;

export function AboutTab() {
  const { t } = useLanguage();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const donateUrl = APP_CONFIG.donateUrl;
  const versionLabel = APP_CONFIG.versionLabel;
  const hasDonateUrl = donateUrl.length > 0;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-cyber-gray/40 bg-cyber-dark">
        <div className="relative p-7 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold font-orbitron tracking-[0.12em] md:text-[1.7rem]">
              <span className="text-gradient-accent">CRED KIT</span>
            </span>
            <span className="version-badge">{versionLabel}</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-cyber-text leading-tight">
            {t('about.heroTitle')}
          </h2>
          <p className="ui-body-sm mt-3 max-w-2xl">
            {t('about.heroSubtitle')}
          </p>
        </div>
      </section>

      <section className="card-cyber">
        <h3 className="text-lg font-bold text-cyber-text mb-4">{t('about.valueTitle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {valueCards.map(card => (
            <div key={card.key} className="rounded-xl border border-cyber-gray/30 bg-cyber-dark/60 p-4 hover-lift">
              <div className={`mb-3 inline-flex items-center justify-center w-10 h-10 rounded-lg ${card.iconBgClass} ${card.iconClass}`}>
                {card.icon}
              </div>
              <h4 className="ui-card-title mb-1">{t(`about.value.${card.key}.title`)}</h4>
              <p className="ui-body-sm">{t(`about.value.${card.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card-cyber">
        <h3 className="text-lg font-bold text-cyber-text mb-2">{t('about.support.title')}</h3>
        <p className="ui-body-sm">{t('about.support.desc')}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            data-testid="about-report-open"
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-cyber-accent/28 bg-cyber-accent/10 px-4 py-2.5 text-sm font-semibold text-cyber-accent transition-colors hover:bg-cyber-accent/16 hover:border-cyber-accent/44"
          >
            {Icons.bug}
            {t('about.support.reportButton')}
          </button>
        </div>
        <div className="mt-4 rounded-xl border border-cyber-green/30 bg-cyber-green/10 p-4">
          <h4 className="text-cyber-text font-semibold">{t('about.support.donateTitle')}</h4>
          <p className="ui-body-sm mt-1">{t('about.support.donateDesc')}</p>
          {hasDonateUrl ? (
            <a
              href={donateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-3 inline-flex px-4 py-2"
            >
              {t('about.support.donateButton')}
            </a>
          ) : (
            <button type="button" disabled className="btn mt-3 inline-flex px-4 py-2 opacity-50 cursor-not-allowed">
              {t('about.support.donateDisabled')}
            </button>
          )}
        </div>
      </section>

      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={t('about.support.reportModalTitle')}
        size="xl"
      >
        <p className="mb-4 text-sm text-cyber-muted">{t('about.support.reportModalSubtitle')}</p>
        <BugReportTab embedded />
      </Modal>
    </div>
  );
}

export default AboutTab;
