import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { welcomeEmailTemplate } from '@/lib/email/templates';
import { EMAIL_CONFIG } from '@/lib/email/config';

/**
 * Auth Callback Handler
 * يعالج redirects من Supabase Auth (Google OAuth, Password Reset, Email Verify, etc.)
 *
 * Supabase يرسل المستخدم هنا بعد:
 * - تسجيل الدخول عبر Google
 * - النقر على رابط إعادة تعيين كلمة المرور
 * - تأكيد البريد الإلكتروني
 *
 * الإضافات:
 * - إرسال إيميل ترحيب للمستخدمين الجدد (Google OAuth)
 * - إنشاء profile تلقائي إذا لم يكن موجوداً
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

      // ✅ معالجة المستخدمين الجدد (Google OAuth): إنشاء profile + إيميل ترحيب
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // إنشاء profile إذا لم يكن موجوداً (خاصة لمستخدمي Google OAuth)
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (!existingProfile) {
            await supabase.from('profiles').insert({
              id: user.id,
              full_name: user.user_metadata?.full_name
                || user.user_metadata?.name  // Google يوفر 'name'
                || '',
              package_id: 'free',
            });
          }

          // إرسال إيميل ترحيب للمستخدمين الجدد (مرة واحدة فقط)
          if (!user.user_metadata?.welcome_email_sent && user.email && process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const name = user.user_metadata?.full_name
              || user.user_metadata?.name
              || user.email.split('@')[0]
              || 'مستخدم';

            await resend.emails.send({
              from: EMAIL_CONFIG.from,
              to: [user.email],
              subject: 'أهلاً بك في مِراس! 🚀',
              html: welcomeEmailTemplate({
                name,
                dashboardUrl: EMAIL_CONFIG.dashboardUrl,
              }),
            });

            // تحديث metadata لمنع الإرسال المكرر
            await supabase.auth.updateUser({
              data: { welcome_email_sent: true },
            });

            console.log(`[Auth Callback] Welcome email sent to ${user.email}`);
          }
        }
      } catch (callbackError) {
        // لا نوقف التوجيه بسبب خطأ في الإيميل أو البروفايل
        console.error('[Auth Callback] Post-auth processing error:', callbackError);
      }

      // وإلا نوجّه للوجهة المطلوبة
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // في حال الفشل - نوجّه لصفحة تسجيل الدخول مع رسالة خطأ
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
