'use server';

/**
 * Billing Server Actions
 * =======================
 * إجراءات الاشتراك والدفع عبر Polar
 */

import { createCheckout, cancelSubscription, getCustomerPortalUrl, getPriceId, isPaymentEnabled, EVENT_PACKAGE_PRICE_MAP } from '@/lib/billing/polar';
import { type PlanId, type BillingInterval, type EventPackageId } from '@/lib/billing/plans';
import { withAuthAction, actionError, actionSuccess, type ActionResult } from '@/lib/actions/action-result';

/**
 * إنشاء Checkout Session للاشتراك
 */
export async function createSubscriptionCheckout(
  planId: PlanId,
  interval: BillingInterval
): Promise<ActionResult<{ checkoutUrl: string }>> {
  return withAuthAction(async (userId) => {
    if (!isPaymentEnabled()) {
      throw new Error('بوابة الدفع غير مفعلة حالياً. يرجى المحاولة لاحقاً.');
    }

    if (planId === 'free' || planId === 'enterprise') {
      throw new Error('هذه الخطة لا تدعم الاشتراك المباشر');
    }

    const priceId = getPriceId(planId, interval);
    if (!priceId) {
      throw new Error('لم يتم العثور على سعر لهذه الخطة');
    }

    // جلب بريد المستخدم
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      throw new Error('لم يتم العثور على البريد الإلكتروني');
    }

    const checkoutUrl = await createCheckout({
      priceId,
      userId,
      userEmail: user.email,
    });

    if (!checkoutUrl) {
      throw new Error('فشل إنشاء جلسة الدفع. حاول مرة أخرى.');
    }

    return { checkoutUrl };
  });
}

/**
 * إلغاء الاشتراك الحالي
 */
export async function cancelCurrentSubscription(): Promise<ActionResult<void>> {
  return withAuthAction(async (userId) => {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // جلب subscription من جدول subscriptions (وليس profiles)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!subscription?.stripe_subscription_id) {
      throw new Error('لا يوجد اشتراك نشط لإلغائه');
    }

    const success = await cancelSubscription(subscription.stripe_subscription_id);
    if (!success) {
      throw new Error('فشل إلغاء الاشتراك. حاول مرة أخرى.');
    }
  });
}

/**
 * الحصول على رابط بوابة العميل لإدارة الاشتراك
 */
export async function getCustomerPortal(): Promise<ActionResult<{ portalUrl: string }>> {
  return withAuthAction(async (userId) => {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // stripe_customer_id موجود في profiles (الاسم الفعلي في DB)
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!profile?.stripe_customer_id) {
      throw new Error('لا يوجد حساب دفع مرتبط. اشترك في خطة أولاً.');
    }

    const portalUrl = await getCustomerPortalUrl(profile.stripe_customer_id);
    if (!portalUrl) {
      throw new Error('فشل فتح بوابة إدارة الاشتراك');
    }

    return { portalUrl };
  });
}

/**
 * شراء باقة فعالية واحدة (دفعة واحدة)
 * للزواجات، التخرج، المؤتمرات
 */
export async function createEventPackageCheckout(
  packageId: EventPackageId
): Promise<ActionResult<{ checkoutUrl: string }>> {
  return withAuthAction(async (userId) => {
    if (!isPaymentEnabled()) {
      throw new Error('بوابة الدفع غير مفعلة حالياً. يرجى المحاولة لاحقاً.');
    }

    const priceId = EVENT_PACKAGE_PRICE_MAP[packageId];
    if (!priceId) {
      throw new Error('لم يتم العثور على سعر لهذه الباقة');
    }

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      throw new Error('لم يتم العثور على البريد الإلكتروني');
    }

    const checkoutUrl = await createCheckout({
      priceId,
      userId,
      userEmail: user.email,
    });

    if (!checkoutUrl) {
      throw new Error('فشل إنشاء جلسة الدفع. حاول مرة أخرى.');
    }

    return { checkoutUrl };
  });
}
