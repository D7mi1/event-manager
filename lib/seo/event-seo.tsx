/**
 * Event SEO - بيانات منظمة للفعاليات
 * ====================================
 * يضيف JSON-LD schema لصفحات الفعاليات
 * يساعد في ظهور الفعاليات كـ Rich Results في قوقل
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/event
 */

export interface EventSeoProps {
  name: string;
  description?: string;
  startDate: string;        // ISO 8601: "2026-04-15T20:00:00+03:00"
  endDate?: string;
  locationName: string;
  locationAddress?: string;
  locationUrl?: string;
  imageUrl?: string;
  organizerName?: string;
  organizerUrl?: string;
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed' | 'EventRescheduled';
  eventAttendanceMode?: 'OfflineEventAttendanceMode' | 'OnlineEventAttendanceMode' | 'MixedEventAttendanceMode';
  price?: number;
  priceCurrency?: string;
  ticketUrl?: string;
  availability?: 'InStock' | 'SoldOut' | 'PreOrder';
}

/**
 * يولّد JSON-LD schema للفعالية
 *
 * @example
 * // في Server Component أو generateMetadata:
 * const jsonLd = generateEventJsonLd({
 *   name: "حفل زفاف محمد وسارة",
 *   startDate: "2026-04-15T20:00:00+03:00",
 *   locationName: "قاعة الريتز كارلتون",
 *   price: 149,
 * });
 *
 * // في الصفحة:
 * <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
 */
export function generateEventJsonLd(props: EventSeoProps) {
  const {
    name,
    description,
    startDate,
    endDate,
    locationName,
    locationAddress,
    locationUrl,
    imageUrl,
    organizerName = 'مِراس',
    organizerUrl = 'https://merasapp.com',
    eventStatus = 'EventScheduled',
    eventAttendanceMode = 'OfflineEventAttendanceMode',
    price,
    priceCurrency = 'SAR',
    ticketUrl,
    availability = 'InStock',
  } = props;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description: description || `${name} - تنظيم عبر منصة مِراس`,
    startDate,
    endDate: endDate || startDate,
    eventStatus: `https://schema.org/${eventStatus}`,
    eventAttendanceMode: `https://schema.org/${eventAttendanceMode}`,
    location: {
      '@type': 'Place',
      name: locationName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: locationAddress || locationName,
        addressCountry: 'SA',
      },
      ...(locationUrl ? { sameAs: locationUrl } : {}),
    },
    image: imageUrl ? [imageUrl] : ['https://merasapp.com/og-image.png'],
    organizer: {
      '@type': 'Organization',
      name: organizerName,
      url: organizerUrl,
    },
  };

  if (ticketUrl) {
    jsonLd.url = ticketUrl;
  }

  if (price) {
    jsonLd.offers = {
      '@type': 'Offer',
      price,
      priceCurrency,
      url: ticketUrl || 'https://merasapp.com/pricing',
      availability: `https://schema.org/${availability}`,
      validFrom: new Date().toISOString(),
    };
  }

  return jsonLd;
}

/**
 * مكون React لإدراج JSON-LD في الصفحة
 *
 * @example
 * <EventJsonLdScript
 *   name="حفل زفاف"
 *   startDate="2026-04-15T20:00:00+03:00"
 *   locationName="الرياض"
 * />
 */
export function EventJsonLdScript(props: EventSeoProps) {
  const jsonLd = generateEventJsonLd(props);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
