/**
 * Push Notifications عبر Web Push API
 * ========================================
 * يدعم إشعارات المتصفح عبر Service Worker
 * تذكيرات الفعاليات + إشعارات الحضور
 */

// ========================================
// أنواع البيانات
// ========================================

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  url?: string;
  /** بيانات إضافية */
  data?: Record<string, string>;
}

// ========================================
// Client-Side: طلب الإذن والاشتراك
// ========================================

/**
 * التحقق من دعم Push Notifications
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * حالة إذن الإشعارات
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * طلب إذن الإشعارات والاشتراك
 * يرجع بيانات الاشتراك لحفظها في السيرفر
 */
export async function subscribeToPush(): Promise<PushSubscriptionData | null> {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return null;
  }

  // طلب الإذن
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('Push notification permission denied');
    return null;
  }

  try {
    // الحصول على Service Worker
    const registration = await navigator.serviceWorker.ready;

    // VAPID public key
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('VAPID public key not configured');
      return null;
    }

    // تحويل VAPID key
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // الاشتراك
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
    });

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys) {
      throw new Error('Invalid subscription data');
    }

    return {
      endpoint: json.endpoint,
      keys: {
        p256dh: json.keys.p256dh as string,
        auth: json.keys.auth as string,
      },
    };
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
}

/**
 * إلغاء الاشتراك
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      return await subscription.unsubscribe();
    }
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return false;
  }
}

/**
 * التحقق من وجود اشتراك حالي
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

// ========================================
// Server-Side: إرسال الإشعارات
// ========================================

/**
 * إرسال إشعار push
 * يستخدم web-push library (server-side only)
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    const webPush = await import('web-push');

    webPush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:hello@merasapp.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || ''
    );

    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload),
      {
        TTL: 86400, // صلاحية 24 ساعة
        urgency: 'normal',
      }
    );

    return true;
  } catch (error: any) {
    // 410 = الاشتراك منتهي
    if (error?.statusCode === 410) {
      console.warn('Push subscription expired, should remove from DB');
    }
    console.error('Failed to send push notification:', error);
    return false;
  }
}

/**
 * إرسال تذكير بالفعالية لجميع المشتركين
 */
export async function sendEventReminder(
  subscriptions: PushSubscriptionData[],
  eventName: string,
  eventDate: string,
  eventId: string
): Promise<{ sent: number; failed: number }> {
  const payload: PushNotificationPayload = {
    title: `⏰ تذكير: ${eventName}`,
    body: `فعاليتك غداً ${eventDate}. لا تنسَ الحضور!`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `event-reminder-${eventId}`,
    url: `/e/${eventId}`,
    data: { eventId, type: 'reminder' },
  };

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    const success = await sendPushNotification(sub, payload);
    if (success) sent++;
    else failed++;
  }

  return { sent, failed };
}

// ========================================
// Utilities
// ========================================

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ========================================
// قوالب إشعارات جاهزة
// ========================================

export const NOTIFICATION_TEMPLATES = {
  eventReminder: (eventName: string, time: string): PushNotificationPayload => ({
    title: `⏰ تذكير: ${eventName}`,
    body: `الفعالية تبدأ ${time}`,
    icon: '/icons/icon-192x192.png',
    tag: 'event-reminder',
  }),

  guestCheckedIn: (guestName: string): PushNotificationPayload => ({
    title: '✅ حضور جديد',
    body: `${guestName} سجّل حضوره`,
    icon: '/icons/icon-192x192.png',
    tag: 'guest-checkin',
  }),

  rsvpConfirmed: (guestName: string): PushNotificationPayload => ({
    title: '🎉 تأكيد جديد',
    body: `${guestName} أكّد حضوره`,
    icon: '/icons/icon-192x192.png',
    tag: 'rsvp-confirmed',
  }),

  rsvpDeclined: (guestName: string): PushNotificationPayload => ({
    title: '😔 اعتذار',
    body: `${guestName} اعتذر عن الحضور`,
    icon: '/icons/icon-192x192.png',
    tag: 'rsvp-declined',
  }),

  milestoneReached: (count: number): PushNotificationPayload => ({
    title: '🎯 إنجاز!',
    body: `وصل عدد المؤكدين إلى ${count} ضيف!`,
    icon: '/icons/icon-192x192.png',
    tag: 'milestone',
  }),
} as const;
