import type { MetadataRoute } from 'next';

/**
 * Sitemap - خريطة الموقع لمحركات البحث
 * تشمل الصفحات الثابتة + صفحات الفعاليات العامة
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://merasapp.com';

  // الصفحات الثابتة
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // جلب الفعاليات العامة من Supabase (اختياري - يعمل فقط لو في public events)
  let eventPages: MetadataRoute.Sitemap = [];

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: events } = await supabase
      .from('events')
      .select('id, updated_at')
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
      .limit(500);

    if (events) {
      eventPages = events.map((event) => ({
        url: `${baseUrl}/e/${event.id}`,
        lastModified: new Date(event.updated_at),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
    }
  } catch {
    // إذا فشل الاتصال بقاعدة البيانات نرجع الصفحات الثابتة فقط
  }

  return [...staticPages, ...eventPages];
}
