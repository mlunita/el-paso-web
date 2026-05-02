import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://elpaso-rp.com';

  const publicPages = [
    { path: '/', changeFrequency: 'daily', priority: 1.0 },
    { path: '/news', changeFrequency: 'daily', priority: 0.9 },
    { path: '/team', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/wiki', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/support', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/ticket-status', changeFrequency: 'weekly', priority: 0.5 },
  ];

  const locales = ['', '/es'] as const;
  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  for (const page of publicPages) {
    for (const localePrefix of locales) {
      const url =
        page.path === '/'
          ? `${baseUrl}${localePrefix || '/'}`
          : `${baseUrl}${localePrefix}${page.path}`;

      const enUrl = `${baseUrl}${page.path}`;
      const esUrl = `${baseUrl}/es${page.path === '/' ? '' : page.path}`;
      const xDefaultUrl = enUrl;

      xml += `  <url>\n`;
      xml += `    <loc>${url}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${page.changeFrequency}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="es" href="${esUrl}" />\n`;
      xml += `  </url>\n`;
    }
  }

  xml += `</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
