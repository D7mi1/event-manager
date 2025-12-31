import { supabase } from '@/app/utils/supabase/client'

export async function checkEventLimit() {
  
  // 1. مين المستخدم؟
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { allowed: false, message: 'يجب تسجيل الدخول' }

  // 2. وش باقته؟
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, packages(*)') // نجيب تفاصيل الباقة المربوطة
    .eq('id', user.id)
    .single()

  // حالة نادرة: لو المستخدم قديم وما عنده بروفايل، نمشيه مؤقتاً أو نرجعه خطأ
  if (!profile) return { allowed: true } 

  // 3. كم حفلة ساوى حتى الآن؟
  const { count } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true }) // head: true يعني عد فقط بدون تحميل البيانات
    .eq('user_id', user.id)

  const limit = profile.packages.max_events

  // 4. لحظة الحقيقة: هل تجاوز الحد؟
  if (count !== null && count >= limit) {
    return { 
        allowed: false, 
        message: `عذراً 🛑، باقتك الحالية (${profile.packages.name}) تسمح بـ ${limit} مناسبات فقط.` 
    }
  }

  return { allowed: true }
}