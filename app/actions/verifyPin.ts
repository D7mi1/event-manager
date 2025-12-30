'use server'

import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'

export async function verifyEventPin(eventId: string, pin: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // 1. جلب الرمز المخزن في السيرفر فقط
  const { data: event, error } = await supabase
    .from('events')
    .select('pin_code')
    .eq('id', eventId)
    .single()

  if (error || !event) {
    return { success: false, message: 'الفعالية غير موجودة' }
  }

  // 2. التحقق من الرمز
  if (event.pin_code === pin) {
    // 3. إنشاء "كوكي" آمن للمشرف (جلسة مؤقتة)
    // هذا الكوكي سيسمح للمشرف بالدخول لصفحة الماسح دون طلب الرمز مجدداً
    cookies().set(`scanner_session_${eventId}`, 'authorized', { 
      httpOnly: true, // يمنع الوصول إليه عبر جافاسكربت (حماية XSS)
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 12 // صلاحية 12 ساعة فقط
    })
    
    return { success: true }
  }

  return { success: false, message: 'رمز الدخول غير صحيح' }
}