'use server';

import { createClient } from '@supabase/supabase-js';
import { ERROR_MESSAGES, getSafeErrorMessage } from '@/lib/utils/error-messages';
import { VerifyPinSchema } from '@/lib/schemas';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function verifyEventPin(eventId: string, inputPin: string) {
  try {
    // 0. التحقق من المدخلات
    const validatedFields = VerifyPinSchema.safeParse({ eventId, inputPin });
    if (!validatedFields.success) {
      return { success: false, error: validatedFields.error.issues[0].message };
    }

    // 1. جلب PIN من الفعالية (العمود في DB اسمه pin_hash)
    const { data, error } = await supabase
      .from('events')
      .select('pin_hash')
      .eq('id', eventId)
      .single();

    if (error || !data) {
      // ✅ رسالة آمنة - لا تكشف ما إذا كانت الفعالية موجودة
      const message = getSafeErrorMessage(error, ERROR_MESSAGES.INVALID_INPUT);
      return { success: false, error: message };
    }

    // 2. مقارنة PIN
    // ملاحظة: pin_hash يُخزن كنص عادي حالياً (4 أرقام فقط)
    // في المستقبل يمكن الترقية إلى bcrypt hash
    const isValid = inputPin === data.pin_hash;

    if (isValid) {
      return { success: true };
    } else {
      // ✅ رسالة عامة - لا تكشف أن الـ PIN غير صحيح
      return { success: false, error: ERROR_MESSAGES.INVALID_INPUT };
    }
  } catch (err) {
    // ✅ رسالة عامة في Production
    const message = getSafeErrorMessage(err, ERROR_MESSAGES.SERVER_ERROR);
    return { success: false, error: message };
  }
}

// ✅ دالة مساعدة لتوليد PIN عشوائي
export async function generatePin(): Promise<string> {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
