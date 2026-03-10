import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { isSupportedLanguage, supportedLanguages } from '../../i18n/routing';

type RouteParams = Promise<Record<string, string | string[] | undefined>>;

export function generateStaticParams() {
  return supportedLanguages.map((lang) => ({ lang }));
}

export default async function LanguageLayout({
  children,
  params
}: {
  children: ReactNode;
  params: RouteParams;
}) {
  const lang = (await params).lang;

  if (typeof lang !== 'string' || !isSupportedLanguage(lang)) {
    notFound();
  }

  return children;
}
