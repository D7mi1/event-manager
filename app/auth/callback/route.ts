import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth Callback Handler
 * يعالج redirects من Supabase Auth (Google OAuth, Password Reset, Email Verify, etc.)
 *
 * Supabase يرسل المستخدم هنا بعد:
 * - تسجيل الدخول عبر Google
 * - النقر على رابط إعادة تعيين كلمة المرور
 * - تأكيد البريد الإلكتروني
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get('code');
  const nextParam = searchParams.get('next') || '/dashboard';
  const type = searchParams.get('type'); // recovery, signup, etc.

  // ✅ حماية من Open Redirect - التأكد أن next يبدأ بـ / وليس //
  const next = (nextParam.startsWith('/') && !nextParam.startsWith('//'))
    ? nextParam
    : '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // إذا كان الطلب لاستعادة كلمة المرور، نوجّه لصفحة إعادة التعيين
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      // وإلا نوجّه للوجهة المطلوبة
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // في حال الفشل - نوجّه لصفحة تسجيل الدخول مع رسالة خطأ
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
