/**
 * Welcome Email API Route
 * ========================
 * يُرسل إيميل ترحيب للمستخدم الجديد بعد تأكيد حسابه
 *
 * الاستدعاء: POST /api/send-welcome-email
 * - يتطلب مصادقة (المستخدم مسجل دخوله)
 * - يتحقق من عدم إرسال إيميل ترحيب سابقاً (idempotent)
 * - يُستدعى من صفحة التحقق (/auth/verify) وAuth Callback (Google OAuth)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { welcomeEmailTemplate } from '@/lib/email/templates';
import { EMAIL_CONFIG } from '@/lib/email/config';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // التحقق من عدم إرسال إيميل ترحيب سابقاً
    if (user.user_metadata?.welcome_email_sent) {
      return NextResponse.json({ success: true, alreadySent: true });
    }

    // بيانات المستخدم
    const name = user.user_metadata?.full_name
      || user.user_metadata?.name  // Google OAuth يوفر 'name'
      || user.email?.split('@')[0]
      || 'مستخدم';

    const email = user.email;
    if (!email) {
      return NextResponse.json(
        { error: 'لا يوجد بريد إلكتروني' },
        { status: 400 }
      );
    }

    // إرسال إيميل الترحيب
    const { error: emailError } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [email],
      subject: 'أهلاً بك في مِراس! 🚀',
      html: welcomeEmailTemplate({
        name,
        dashboardUrl: EMAIL_CONFIG.dashboardUrl,
      }),
    });

    if (emailError) {
      console.error('[Welcome Email] Error:', emailError);
      return NextResponse.json(
        { error: 'فشل إرسال إيميل الترحيب' },
        { status: 500 }
      );
    }

    // تحديث metadata لمنع الإرسال المكرر
    await supabase.auth.updateUser({
      data: { welcome_email_sent: true },
    });

    console.log(`[Welcome Email] Sent to ${email}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Welcome Email] Unexpected error:', error);
    return NextResponse.json(
      { error: 'خطأ داخلي' },
      { status: 500 }
    );
  }
}
