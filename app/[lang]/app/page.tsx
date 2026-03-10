import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AppClient } from '../../AppClient';
import { isSupportedLanguage } from '../../../i18n/routing';
import { getToolkitMetadata } from '../../../seo/metadata';

export default async function ToolkitPage({
  params
}: {
  params: Promise<Record<string, string | string[] | undefined>>;
}) {
  const lang = (await params).lang;

  if (typeof lang !== 'string' || !isSupportedLanguage(lang)) {
    notFound();
  }

  return <AppClient language={lang} />;
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

  return getToolkitMetadata(lang);
}
