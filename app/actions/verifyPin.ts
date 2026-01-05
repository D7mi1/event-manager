'use server';

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function verifyEventPin(eventId: string, inputPin: string) {
  try {
    // 1. جلب PIN المشفر
    const { data, error } = await supabase
      .from('events')
      .select('pin_hash') // ⚠️ غيّر اسم العمود من pin إلى pin_hash
      .eq('id', eventId)
      .single();

    if (error || !data) {
      return { success: false, error: 'Event not found' };
    }

    // 2. مقارنة مشفرة
    const isValid = await bcrypt.compare(inputPin, data.pin_hash);

    if (isValid) {
      return { success: true };
    } else {
      return { success: false, error: 'Incorrect PIN' };
    }
  } catch (err) {
    console.error('System Error verifying PIN:', err);
    return { success: false, error: 'Server Error' };
  }
}

// ✅ دالة جديدة لإنشاء PIN مشفر (تستخدمها عند إنشاء Event)
export async function hashPin(pin: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pin, salt);
}
