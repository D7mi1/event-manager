import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('events')
    .select('name, date, location_name, image_url, description')
    .eq('id', id)
    .single();

  if (!event) {
    return {
      title: 'فعالية غير موجودة',
      description: 'عذرا، الفعالية المطلوبة غير موجودة.',
    };
  }

  const description = `سجّل حضورك في ${event.name}${event.date ? ` - ${event.date}` : ''}${event.location_name ? ` في ${event.location_name}` : ''}`;

  return {
    title: event.name,
    description,
    openGraph: {
      title: event.name,
      description,
      type: 'website',
      locale: 'ar_SA',
      siteName: 'مِراس',
      ...(event.image_url
        ? {
            images: [
              {
                url: event.image_url,
                width: 1200,
                height: 630,
                alt: event.name,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: event.name,
      description,
      ...(event.image_url ? { images: [event.image_url] } : {}),
    },
  };
}

export default async function EventLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('events')
    .select('name, date, location_name, image_url, description')
    .eq('id', id)
    .single();

  const jsonLd = event
    ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.name,
        ...(event.description ? { description: event.description } : {}),
        ...(event.date ? { startDate: event.date } : {}),
        ...(event.location_name
          ? {
              location: {
                '@type': 'Place',
                name: event.location_name,
              },
            }
          : {}),
        ...(event.image_url ? { image: event.image_url } : {}),
        organizer: {
          '@type': 'Organization',
          name: 'مِراس',
          url: 'https://meras.sa',
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
