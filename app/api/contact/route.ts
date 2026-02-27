/**
 * Contact Form API Route
 * ======================
 * يستقبل رسائل التواصل ويرسلها عبر Resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders, isOriginAllowed } from '@/lib/cors';
import { emailLimiter, checkRateLimit } from '@/lib/rate-limit';

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0'
  ).split(',')[0].trim();
}

const SUBJECTS: Record<string, string> = {
  general: 'استفسار عام',
  sales: 'المبيعات والاشتراكات',
  support: 'الدعم الفني',
  enterprise: 'باقة المؤسسات',
  partnership: 'شراكات وتعاون',
};

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const origin = request.headers.get('origin');

  try {
    // Rate Limiting
    const { allowed, headers: rateLimitHeaders } = checkRateLimit(emailLimiter, `contact-${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد الأقصى للإرسال. يرجى المحاولة لاحقاً.' },
        { status: 429, headers: { ...rateLimitHeaders, ...getCorsHeaders(origin || '') } }
      );
    }

    // CORS
    if (origin && !isOriginAllowed(origin)) {
      return new NextResponse('CORS not allowed', { status: 403 });
    }

    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'يرجى تعبئة جميع الحقول المطلوبة' },
        { status: 400, headers: getCorsHeaders(origin || '') }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير صحيح' },
        { status: 400, headers: getCorsHeaders(origin || '') }
      );
    }

    const subjectLabel = SUBJECTS[subject] || 'استفسار عام';

    // إرسال الإيميل عبر Resend (إذا كان مفعل)
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const adminEmail = process.env.CONTACT_FORM_EMAIL || 'hello@meras.sa';

      // إيميل للإدارة
      await resend.emails.send({
        from: 'Meras Contact <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `[مِراس] ${subjectLabel} - من ${name}`,
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <style>
              body { background: #f3f4f6; font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; margin: 0; }
              .card { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; }
              .header { background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px 24px; color: white; }
              .body { padding: 24px; color: #374151; }
              .field { margin-bottom: 16px; padding: 12px; background: #f9fafb; border-radius: 8px; border-right: 3px solid #3b82f6; }
              .label { font-size: 12px; color: #6b7280; font-weight: bold; margin-bottom: 4px; }
              .value { font-size: 14px; color: #111827; }
              .message-box { background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-top: 16px; white-space: pre-wrap; line-height: 1.8; }
              .footer { padding: 16px 24px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <h1 style="margin:0; font-size: 20px;">📩 رسالة جديدة من نموذج التواصل</h1>
                <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">${subjectLabel}</p>
              </div>
              <div class="body">
                <div class="field">
                  <div class="label">الاسم</div>
                  <div class="value">${name}</div>
                </div>
                <div class="field">
                  <div class="label">البريد الإلكتروني</div>
                  <div class="value" style="direction: ltr; text-align: left;">${email}</div>
                </div>
                <div class="field">
                  <div class="label">الموضوع</div>
                  <div class="value">${subjectLabel}</div>
                </div>
                <div class="label" style="margin-top: 16px;">الرسالة:</div>
                <div class="message-box">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
              </div>
              <div class="footer">
                مِراس - منصة إدارة الفعاليات | ${new Date().toLocaleDateString('ar-SA')}
              </div>
            </div>
          </body>
          </html>
        `,
      });

      // إيميل تأكيد للمرسل
      await resend.emails.send({
        from: 'Meras <onboarding@resend.dev>',
        to: [email],
        subject: 'شكراً لتواصلك مع مِراس ✉️',
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <style>
              body { background: #f3f4f6; font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; margin: 0; }
              .card { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; }
              .header { background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px 24px; color: white; text-align: center; }
              .body { padding: 24px; color: #374151; line-height: 1.8; }
              .footer { padding: 16px 24px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <h1 style="margin:0; font-size: 22px;">شكراً لتواصلك معنا! 💙</h1>
              </div>
              <div class="body">
                <p>أهلاً <strong>${name}</strong>،</p>
                <p>تم استلام رسالتك بنجاح. سيقوم فريقنا بالرد عليك خلال <strong>24 ساعة عمل</strong>.</p>
                <p style="color: #6b7280; font-size: 14px;">إذا كان استفسارك عاجلاً، يمكنك التواصل معنا مباشرة عبر واتساب.</p>
                <p style="margin-top: 24px;">مع أطيب التحيات،<br/><strong>فريق مِراس</strong></p>
              </div>
              <div class="footer">
                © ${new Date().getFullYear()} مِراس - منصة إدارة الفعاليات
              </div>
            </div>
          </body>
          </html>
        `,
      });
    }

    return NextResponse.json(
      { success: true },
      { headers: getCorsHeaders(origin || '') }
    );
  } catch (error) {
    console.error('[Contact API] Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في النظام. حاول مرة أخرى.' },
      { status: 500, headers: getCorsHeaders(origin || '') }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin || !isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin || ''),
  });
}
