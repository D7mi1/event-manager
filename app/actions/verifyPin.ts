'use server';

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/app/utils/supabase/server'; // Import server client for auth
import bcrypt from 'bcryptjs';
import { ERROR_MESSAGES, getSafeErrorMessage } from '@/app/utils/error-messages';
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

    // 1. جلب PIN المشفر
    const { data, error } = await supabase
      .from('events')
      .select('pin_hash') // ⚠️ غيّر اسم العمود من pin إلى pin_hash
      .eq('id', eventId)
      .single();

    if (error || !data) {
      // ✅ رسالة آمنة - لا تكشف ما إذا كانت الفعالية موجودة
      const message = getSafeErrorMessage(error, ERROR_MESSAGES.INVALID_INPUT);
      return { success: false, error: message };
    }

    // 2. مقارنة مشفرة
    const isValid = await bcrypt.compare(inputPin, data.pin_hash);

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

// ✅ دالة جديدة لإنشاء PIN مشفر (تستخدمها عند إنشاء Event)
export async function hashPin(pin: string): Promise<string> {
  // 🔒 حماية: التحقق من المصادقة (يجب أن يكون المستخدم مسجلاً للدخول لإنشاء PIN)
  const supabaseServer = await createServerClient();
  const { data: { user }, error } = await supabaseServer.auth.getUser();

  if (!user || error) {
    throw new Error('Unauthorized: Must be logged in to generate PIN hash');
  }

  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pin, salt);
}
