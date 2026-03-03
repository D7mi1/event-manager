'use client';

/**
 * PostHog Analytics Provider
 * ==========================
 * تحليلات متقدمة + A/B Testing + Session Replay
 * يعمل فقط في الإنتاج مع وجود مفتاح PostHog
 */

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// تتبع تغيير الصفحات
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname;
      const search = searchParams?.toString();
      if (search) {
        url += '?' + search;
      }
      ph.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams, ph]);

  return null;
}

// تغليف في Suspense عشان useSearchParams
function SuspendedPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  useEffect(() => {
    if (posthogKey && typeof window !== 'undefined') {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only',
        capture_pageview: false, // نتتبع يدوياً عبر PostHogPageView
        capture_pageleave: true,
        // خيارات الخصوصية
        respect_dnt: true,
        // Session Replay
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: '[data-sensitive]',
        },
      });
    }
  }, [posthogKey, posthogHost]);

  // لا تحمّل PostHog إذا ما في مفتاح (development أو غير مضبوط)
  if (!posthogKey) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <SuspendedPageView />
      {children}
    </PHProvider>
  );
}

/**
 * Helper: تتبع أحداث مخصصة
 * @example trackEvent('purchase_started', { packageId: 'event_small', price: 149 })
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture(eventName, properties);
  }
}

/**
 * Helper: تعريف المستخدم بعد تسجيل الدخول
 * @example identifyUser(user.id, { email: user.email, name: user.name })
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.identify(userId, properties);
  }
}

/**
 * Helper: إعادة تعيين المستخدم بعد تسجيل الخروج
 */
export function resetUser() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.reset();
  }
}
