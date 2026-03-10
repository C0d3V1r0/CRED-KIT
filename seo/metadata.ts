import type { Metadata } from 'next';
import { APP_CONFIG } from '../config/appConfig';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { defaultLanguage, supportedLanguages } from '../i18n/routing';

const FALLBACK_SITE_URL = 'http://localhost:3000';

export function getSiteUrl(): string {
  return APP_CONFIG.siteUrl || FALLBACK_SITE_URL;
}

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}

function getTranslation(language: Language, key: string): string {
  return translations[language][key] ?? translations[defaultLanguage][key] ?? key;
}

export function getLanguageAlternates(pathname: '' | '/app', language: Language) {
  const languages = Object.fromEntries(
    supportedLanguages.map((value) => [value, `/${value}${pathname}`])
  );

  return {
    canonical: `/${language}${pathname}`,
    languages,
  };
}

export function getLandingMetadata(language: Language): Metadata {
  const title = language === 'ru'
    ? 'CRED KIT — цифровой набор для Cyberpunk RED'
    : 'CRED KIT — Cyberpunk RED digital toolkit';

  const description = getTranslation(language, 'about.heroSubtitle');

  return {
    title,
    description,
    alternates: getLanguageAlternates('', language),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: language === 'ru' ? 'ru_RU' : 'en_US',
      url: `/${language}`,
      siteName: 'CRED KIT',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export function getToolkitMetadata(language: Language): Metadata {
  const title = language === 'ru'
    ? 'CRED KIT App — персонаж, хром, нетраннинг и снаряжение'
    : 'CRED KIT App — character, cyberware, netrunning and gear';

  const description = language === 'ru'
    ? 'Рабочий toolkit для Cyberpunk RED: персонаж, хром, нетраннинг и снаряжение в одном интерфейсе.'
    : 'A working Cyberpunk RED toolkit with character sheet, cyberware, netrunning, and gear in one interface.';

  return {
    title,
    description,
    alternates: getLanguageAlternates('/app', language),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: language === 'ru' ? 'ru_RU' : 'en_US',
      url: `/${language}/app`,
      siteName: 'CRED KIT',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
