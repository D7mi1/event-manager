'use server';

import { createClient } from '@supabase/supabase-js';

// تهيئة عميل Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function verifyEventPin(eventId: string, inputPin: string) {
  try {
    // 1. جلب الـ PIN من قاعدة البيانات
    const { data, error } = await supabase
      .from('events')
      .select('pin')
      .eq('id', eventId)
      .single();

    // التحقق من وجود البيانات
    if (error || !data) {
      return { success: false, error: 'Event not found' };
    }

    // 2. معالجة النصوص للمقارنة (إزالة المسافات والتعامل مع القيم الفارغة)
    const dbPin = String(data.pin || '').trim();
    const enteredPin = String(inputPin || '').trim();

    // 3. المقارنة النهائية
    if (dbPin === enteredPin) {
      return { success: true };
    } else {
      return { success: false, error: 'Incorrect PIN' };
    }

  } catch (err) {
    console.error("System Error verifying PIN:", err);
    return { success: false, error: 'Server Error' };
  }
}