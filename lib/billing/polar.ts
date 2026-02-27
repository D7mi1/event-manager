/**
 * Polar Integration - بوابة الدفع
 * ==================================
 * Polar = Merchant of Record مخصص لـ SaaS
 * - يتحمل مسؤولية VAT والفوترة
 * - لا يحتاج سجل تجاري
 * - يدعم Stripe (فيزا، ماستركارد، آبل باي)
 * - يوفر Customer Portal جاهز لإدارة الاشتراك
 * - SDK رسمي لـ Next.js
 *
 * التفعيل:
 * 1. أنشئ حساب في https://polar.sh
 * 2. أنشئ Organization وأضف Products تطابق خططنا (Starter, Pro)
 * 3. لكل Product أنشئ Price لـ monthly و yearly
 * 4. أضف المتغيرات في .env.local:
 *    - POLAR_ACCESS_TOKEN        (من Settings → API)
 *    - POLAR_WEBHOOK_SECRET      (من Settings → Webhooks)
 *    - POLAR_ORGANIZATION_ID     (من Organization Settings)
 *    - NEXT_PUBLIC_POLAR_STARTER_MONTHLY_PRICE_ID
 *    - NEXT_PUBLIC_POLAR_STARTER_YEARLY_PRICE_ID
 *    - NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRICE_ID
 *    - NEXT_PUBLIC_POLAR_PRO_YEARLY_PRICE_ID
 * 5. أنشئ Webhook في لوحة تحكم Polar يشير إلى:
 *    https://yourdomain.com/api/webhooks/polar
 *    Events: subscription.created, subscription.updated, subscription.canceled, subscription.revoked
 */

import { type PlanId, type BillingInterval, type EventPackageId } from './plans';

// ==========================================
// الأنواع
// ==========================================

export interface PolarCheckoutOptions {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl?: string;
}

export interface PolarSubscription {
  id: string;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing' | 'unpaid';
  productId: string;
  priceId: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  customerId: string;
}

/** أنواع أحداث Polar Webhooks */
export type PolarWebhookEventType =
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'subscription.revoked'
  | 'checkout.created'
  | 'checkout.updated';

export interface PolarWebhookPayload {
  type: PolarWebhookEventType;
  data: {
    id: string;
    product_id: string;
    price_id: string;
    status: string;
    customer_id: string;
    metadata: Record<string, string>;
    current_period_end?: string;
    cancel_at_period_end?: boolean;
    [key: string]: any;
  };
}

// ==========================================
// ربط الخطط بـ Polar Price IDs
// ==========================================

export const PLAN_PRICE_MAP: Partial<Record<PlanId, { monthly?: string; yearly?: string }>> = {
  starter: {
    monthly: process.env.NEXT_PUBLIC_POLAR_STARTER_MONTHLY_PRICE_ID || '',
    yearly: process.env.NEXT_PUBLIC_POLAR_STARTER_YEARLY_PRICE_ID || '',
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRICE_ID || '',
    yearly: process.env.NEXT_PUBLIC_POLAR_PRO_YEARLY_PRICE_ID || '',
  },
};

// باقات الفعالية الواحدة (one-time payments عبر Polar)
export const EVENT_PACKAGE_PRICE_MAP: Partial<Record<EventPackageId, string>> = {
  event_small: process.env.NEXT_PUBLIC_POLAR_EVENT_SMALL_PRICE_ID || '',
  event_medium: process.env.NEXT_PUBLIC_POLAR_EVENT_MEDIUM_PRICE_ID || '',
  event_large: process.env.NEXT_PUBLIC_POLAR_EVENT_LARGE_PRICE_ID || '',
};

/**
 * الحصول على Price ID لخطة ومدة معينة
 */
export function getPriceId(planId: PlanId, interval: BillingInterval): string | null {
  const planPrices = PLAN_PRICE_MAP[planId];
  if (!planPrices) return null;
  return planPrices[interval] || null;
}

/**
 * تحديد خطة مِراس من Price ID
 */
export function resolvePlanFromPriceId(priceId: string | undefined): PlanId {
  if (!priceId) return 'free';

  const starterMonthly = process.env.NEXT_PUBLIC_POLAR_STARTER_MONTHLY_PRICE_ID;
  const starterYearly = process.env.NEXT_PUBLIC_POLAR_STARTER_YEARLY_PRICE_ID;
  const proMonthly = process.env.NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRICE_ID;
  const proYearly = process.env.NEXT_PUBLIC_POLAR_PRO_YEARLY_PRICE_ID;

  if (priceId === starterMonthly || priceId === starterYearly) return 'starter';
  if (priceId === proMonthly || priceId === proYearly) return 'pro';

  return 'free';
}

// ==========================================
// Polar API
// ==========================================

const API_BASE = 'https://api.polar.sh/v1';

function getHeaders(): HeadersInit {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) throw new Error('POLAR_ACCESS_TOKEN is not configured');

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

/**
 * إنشاء Checkout Session لخطة معينة
 */
export async function createCheckout(options: PolarCheckoutOptions): Promise<string | null> {
  if (!isPaymentEnabled()) {
    console.warn('[Polar] Payment not configured');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/checkouts/custom`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        product_price_id: options.priceId,
        success_url: options.successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&success=true`,
        customer_email: options.userEmail,
        metadata: {
          user_id: options.userId,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Polar] Checkout creation failed:', errorText);
      return null;
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('[Polar] Error creating checkout:', error);
    return null;
  }
}

/**
 * جلب اشتراك مستخدم
 */
export async function getSubscription(subscriptionId: string): Promise<PolarSubscription | null> {
  if (!isPaymentEnabled()) return null;

  try {
    const response = await fetch(`${API_BASE}/subscriptions/${subscriptionId}`, {
      headers: getHeaders(),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      id: data.id,
      status: data.status,
      productId: data.product_id,
      priceId: data.price_id,
      currentPeriodEnd: data.current_period_end,
      cancelAtPeriodEnd: data.cancel_at_period_end,
      customerId: data.customer_id,
    };
  } catch {
    return null;
  }
}

/**
 * إلغاء اشتراك (يبقى فعال حتى نهاية الفترة)
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  if (!isPaymentEnabled()) return false;

  try {
    const response = await fetch(`${API_BASE}/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * الحصول على رابط Customer Portal
 * يتيح للمستخدم إدارة اشتراكه بنفسه
 */
export async function getCustomerPortalUrl(customerId: string): Promise<string | null> {
  if (!isPaymentEnabled()) return null;

  try {
    const response = await fetch(`${API_BASE}/customer-portal/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        customer_id: customerId,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.url;
  } catch {
    return null;
  }
}

/**
 * التحقق من توقيع Webhook
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) return false;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return expectedSignature === signature;
  } catch {
    return false;
  }
}

/**
 * التحقق مما إذا كانت بوابة الدفع مفعلة
 */
export function isPaymentEnabled(): boolean {
  return !!(process.env.POLAR_ACCESS_TOKEN && process.env.POLAR_ORGANIZATION_ID);
}
