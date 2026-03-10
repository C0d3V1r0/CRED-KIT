import type { MetadataRoute } from 'next';
import { supportedLanguages } from '../i18n/routing';
import { getSiteUrl } from '../seo/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const rootEntries = supportedLanguages.flatMap((language) => ([
    {
      url: `${siteUrl}/${language}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/${language}/app`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]));

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...rootEntries,
  ];
}
