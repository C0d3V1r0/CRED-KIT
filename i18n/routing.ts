import type { Language } from './translations';

export const supportedLanguages: readonly Language[] = ['ru', 'en'] as const;
export const defaultLanguage: Language = 'ru';

export function isSupportedLanguage(value: string): value is Language {
  return supportedLanguages.includes(value as Language);
}
