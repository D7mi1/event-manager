import { createClient } from '@/app/utils/supabase/server';

interface LimitCheck {
  allowed: boolean;
  remaining: number;
  limit: number;
  message?: string;
}

/**
 * التحقق من حد الضيوف للمستخدم
 */
export async function checkGuestsLimit(userId: string): Promise<LimitCheck> {
  const supabase = await createClient();

  // جلب Subscription
  const { data: sub, error } = await supabase
    .from('subscriptions')
    .select('guests_limit, guests_used')
    .eq('user_id', userId)
    .single();

  if (error || !sub) {
    // المستخدم بدون subscription = Free Plan
    return {
      allowed: false,
      remaining: 0,
      limit: 50,
      message: 'يرجى الاشتراك في باقة مدفوعة لإضافة المزيد من الضيوف'
    };
  }

  const remaining = sub.guests_limit - sub.guests_used;

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      limit: sub.guests_limit,
      message: `لقد وصلت للحد الأقصى (${sub.guests_limit} ضيف). يرجى الترقية للباقة الأعلى.`
    };
  }

  return {
    allowed: true,
    remaining,
    limit: sub.guests_limit
  };
}

/**
 * زيادة عداد الضيوف المستخدمين
 */
export async function incrementGuestsUsed(
  userId: string,
  count: number = 1
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_guests_used', {
    p_user_id: userId,
    p_count: count
  });

  return !error;
}

/**
 * تقليل عداد الضيوف (عند الحذف)
 */
export async function decrementGuestsUsed(
  userId: string,
  count: number = 1
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('decrement_guests_used', {
    p_user_id: userId,
    p_count: count
  });

  return !error;
}
