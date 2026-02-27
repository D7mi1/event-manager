/**
 * Query Key Factory - مفاتيح TanStack Query المُنظّمة
 * ====================================================
 * تنظيم جميع مفاتيح الاستعلامات في مكان واحد
 * يسهّل الـ invalidation ويمنع تكرار المفاتيح النصية
 *
 * @example
 * ```ts
 * // استعلام
 * useQuery({ queryKey: queryKeys.events.detail(eventId), queryFn: ... })
 *
 * // إبطال كل الفعاليات
 * queryClient.invalidateQueries({ queryKey: queryKeys.events.all })
 *
 * // إبطال فعالية واحدة
 * queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) })
 *
 * // إبطال ضيوف فعالية معينة
 * queryClient.invalidateQueries({ queryKey: queryKeys.guests.byEvent(eventId) })
 * ```
 */
export const queryKeys = {
  // ——— الفعاليات ———
  events: {
    all: ['events'] as const,
    lists: () => [...queryKeys.events.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.events.lists(), filters] as const,
    details: () => [...queryKeys.events.all, 'detail'] as const,
    detail: (eventId: string) =>
      [...queryKeys.events.details(), eventId] as const,
  },

  // ——— الضيوف ———
  guests: {
    all: ['guests'] as const,
    byEvent: (eventId: string) =>
      [...queryKeys.guests.all, 'event', eventId] as const,
    detail: (guestId: string) =>
      [...queryKeys.guests.all, 'detail', guestId] as const,
    stats: (eventId: string) =>
      [...queryKeys.guests.all, 'stats', eventId] as const,
  },

  // ——— التذاكر ———
  tickets: {
    all: ['tickets'] as const,
    byEvent: (eventId: string) =>
      [...queryKeys.tickets.all, 'event', eventId] as const,
    detail: (ticketId: string) =>
      [...queryKeys.tickets.all, 'detail', ticketId] as const,
  },

  // ——— القوالب ———
  templates: {
    all: ['templates'] as const,
    byEvent: (eventId: string) =>
      [...queryKeys.templates.all, 'event', eventId] as const,
    presets: () => [...queryKeys.templates.all, 'presets'] as const,
  },

  // ——— المستخدم/الملف الشخصي ———
  profile: {
    all: ['profile'] as const,
    current: () => [...queryKeys.profile.all, 'current'] as const,
    subscription: () => [...queryKeys.profile.all, 'subscription'] as const,
  },

  // ——— الإشعارات ———
  notifications: {
    all: ['notifications'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
  },

  // ——— الروابط المختصرة ———
  shortLinks: {
    all: ['short-links'] as const,
    byEvent: (eventId: string) =>
      [...queryKeys.shortLinks.all, 'event', eventId] as const,
  },
} as const;
