import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Language } from '../../i18n/translations';
import { translations } from '../../i18n/translations';
import { APP_CONFIG } from '../../config/appConfig';
import { isSupportedLanguage } from '../../i18n/routing';
import { getLandingMetadata } from '../../seo/metadata';

function getLandingCopy(language: Language) {
  const t = (key: string) => translations[language][key] ?? translations.ru[key] ?? key;

  return {
    heroTitle: t('about.heroTitle'),
    heroSubtitle: t('about.heroSubtitle'),
    valueTitle: t('about.valueTitle'),
    values: [
      { title: t('about.value.fast.title'), desc: t('about.value.fast.desc') },
      { title: t('about.value.clear.title'), desc: t('about.value.clear.desc') },
      { title: t('about.value.safe.title'), desc: t('about.value.safe.desc') },
      { title: t('about.value.time.title'), desc: t('about.value.time.desc') },
      { title: t('about.value.control.title'), desc: t('about.value.control.desc') },
    ],
    startCta: language === 'ru' ? 'Открыть toolkit' : 'Open toolkit',
    secondaryCta: language === 'ru' ? 'Переключить язык' : 'Switch language',
    quickStartTitle: t('about.quickStartTitle'),
    quickSteps: [
      { title: t('about.quickStart.character.title'), desc: t('about.quickStart.character.desc') },
      { title: t('about.quickStart.cyberware.title'), desc: t('about.quickStart.cyberware.desc') },
      { title: t('about.quickStart.netrunner.title'), desc: t('about.quickStart.netrunner.desc') },
    ],
    supportTitle: t('about.support.title'),
    supportDesc: t('about.support.desc'),
    versionLabel: APP_CONFIG.versionLabel,
  };
}

export default async function LandingPage({
  params
}: {
  params: Promise<Record<string, string | string[] | undefined>>;
}) {
  const lang = (await params).lang;

  if (typeof lang !== 'string' || !isSupportedLanguage(lang)) {
    notFound();
  }

  const copy = getLandingCopy(lang);
  const otherLanguage = lang === 'ru' ? 'en' : 'ru';

  return (
    <main className="min-h-screen bg-cyber-black text-cyber-text">
      <section className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
        <div className="rounded-3xl border border-cyber-gray/35 bg-cyber-dark/65 p-5 shadow-2xl shadow-black/30 sm:p-8">
          <div className="flex flex-col gap-6 sm:gap-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-bold tracking-[0.18em] font-orbitron text-gradient-accent">
                    CRED KIT
                  </span>
                  <span className="version-badge">{copy.versionLabel}</span>
                </div>
                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
                  {copy.heroTitle}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-cyber-muted sm:text-lg">
                  {copy.heroSubtitle}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={`/${lang}/app`} className="btn btn-primary">
                  {copy.startCta}
                </Link>
                <Link href={`/${otherLanguage}`} className="btn btn-secondary">
                  {copy.secondaryCta}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div className="rounded-2xl border border-cyber-cyan/20 bg-cyber-black/40 p-5">
                <h2 className="text-xl font-semibold text-cyber-text sm:text-2xl">{copy.valueTitle}</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {copy.values.map((item) => (
                    <article key={item.title} className="rounded-2xl border border-cyber-gray/25 bg-cyber-black/55 p-4">
                      <h3 className="text-lg font-semibold text-cyber-text">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-cyber-muted">{item.desc}</p>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="rounded-2xl border border-cyber-accent/20 bg-cyber-black/40 p-5">
                <h2 className="text-xl font-semibold text-cyber-text">{copy.quickStartTitle}</h2>
                <div className="mt-5 space-y-4">
                  {copy.quickSteps.map((step, index) => (
                    <div key={step.title} className="rounded-2xl border border-cyber-gray/25 bg-cyber-black/55 p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-cyber-accent">
                        {lang === 'ru' ? `Шаг ${index + 1}` : `Step ${index + 1}`}
                      </div>
                      <div className="mt-2 text-lg font-semibold text-cyber-text">{step.title}</div>
                      <p className="mt-2 text-sm leading-6 text-cyber-muted">{step.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-cyber-green/25 bg-cyber-black/55 p-4">
                  <div className="text-lg font-semibold text-cyber-text">{copy.supportTitle}</div>
                  <p className="mt-2 text-sm leading-6 text-cyber-muted">{copy.supportDesc}</p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const lang = (await params).lang;

  if (typeof lang !== 'string' || !isSupportedLanguage(lang)) {
    return {};
  }

  return getLandingMetadata(lang);
}
