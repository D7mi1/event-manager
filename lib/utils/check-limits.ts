import { createClient } from '@/lib/supabase/server';
import { PLANS, type PlanId } from '@/lib/billing/plans';

interface LimitCheck {
  allowed: boolean;
  remaining: number;
  limit: number;
  message?: string;
}

/**
 * التحقق من حد الضيوف للمستخدم
 * الاستراتيجية:
 * 1. أولاً: نحاول جلب الحدود من جدول subscriptions (المصدر الرئيسي)
 * 2. احتياطياً: نستخدم خطة PLANS.free كقيمة افتراضية
 * 3. نحسب الاستهلاك الفعلي من attendees عبر events
 */
export async function checkGuestsLimit(userId: string): Promise<LimitCheck> {
  const supabase = await createClient();

  // 1. محاولة جلب الاشتراك من subscriptions table (DB الفعلي)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('guests_limit, guests_used, plan_tier, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  let guestsLimit: number;

  if (subscription?.guests_limit) {
    // ✅ الاشتراك موجود - نستخدم حدود DB مباشرة
    guestsLimit = subscription.guests_limit;
  } else {
    // 🆓 لا يوجد اشتراك نشط - نستخدم الخطة المجانية
    guestsLimit = PLANS.free.limits.maxGuestsPerEvent;
  }

  // 2. حساب الاستهلاك الفعلي من attendees
  const { data: userEvents } = await supabase
    .from('events')
    .select('id')
    .eq('user_id', userId);

  const eventIds = userEvents?.map(e => e.id) || [];

  let guestsUsed = 0;
  if (eventIds.length > 0) {
    const { count } = await supabase
      .from('attendees')
      .select('*', { count: 'exact', head: true })
      .in('event_id', eventIds);
    guestsUsed = count ?? 0;
  }

  const remaining = guestsLimit - guestsUsed;

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      limit: guestsLimit,
      message: `لقد وصلت للحد الأقصى (${guestsLimit} ضيف). يرجى الترقية للباقة الأعلى.`
    };
  }

  return {
    allowed: true,
    remaining,
    limit: guestsLimit
  };
}

/**
 * زيادة عداد الضيوف المستخدمين
 * لم يعد مطلوباً - العدد يُحسب ديناميكياً من attendees
 */
export async function incrementGuestsUsed(
  _userId: string,
  _count: number = 1
): Promise<boolean> {
  return true;
}

/**
 * تقليل عداد الضيوف (عند الحذف)
 * لم يعد مطلوباً - العدد يُحسب ديناميكياً من attendees
 */
export async function decrementGuestsUsed(
  _userId: string,
  _count: number = 1
): Promise<boolean> {
  return true;
}
