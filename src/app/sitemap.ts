import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://elpaso-rp.com';

  // All public page paths (without locale prefix)
  const publicPages: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }[] = [
      { path: '/', changeFrequency: 'daily', priority: 1.0 },
      { path: '/news', changeFrequency: 'daily', priority: 0.9 },
      { path: '/team', changeFrequency: 'weekly', priority: 0.7 },
      { path: '/wiki', changeFrequency: 'weekly', priority: 0.7 },
      { path: '/support', changeFrequency: 'weekly', priority: 0.7 },
      { path: '/ticket-status', changeFrequency: 'weekly', priority: 0.5 },
    ];

  const locales = ['', '/es'] as const;
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const page of publicPages) {
    for (const localePrefix of locales) {
      const url =
        page.path === '/'
          ? `${baseUrl}${localePrefix || '/'}`
          : `${baseUrl}${localePrefix}${page.path}`;

      entries.push({
        url,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: {
            'x-default': `${baseUrl}${page.path}`,
            en: `${baseUrl}${page.path}`,
            es: `${baseUrl}/es${page.path === '/' ? '' : page.path}`,
          },
        },
      });
    }
  }

  return entries;
}
