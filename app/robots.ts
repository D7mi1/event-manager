import type { MetadataRoute } from 'next';

/**
 * robots.txt - توجيهات محركات البحث
 * يسمح بفهرسة الصفحات العامة ويمنع الوصول لصفحات الإدارة
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://merasapp.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/terms', '/privacy', '/pricing', '/register/*', '/e/*'],
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/api/*',
          '/auth/*',
          '/scan/*',
          '/staff/*',
          '/login',
          '/forgot-password',
          '/reset-password',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
