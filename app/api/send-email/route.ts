import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { auditLogger } from '@/lib/audit-logger';
import { metricsCollector } from '@/lib/metrics';
import { getCorsHeaders, isOriginAllowed } from '@/lib/cors';
import { emailLimiter, checkRateLimit } from '@/lib/rate-limit';
import { ticketEmailTemplate } from '@/lib/email/templates';

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper to get client IP
function getClientIP(request: Request | NextRequest): string {
  const headersList = request.headers;
  return (headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '0.0.0.0').split(',')[0].trim();
}

// Helper to get user agent
function getUserAgent(request: Request | NextRequest): string {
  return request.headers.get('user-agent') || 'Unknown';
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  const userAgent = getUserAgent(request);
  const origin = request.headers.get('origin');

  try {
    // Rate Limiting (منع سبام الإيميلات)
    const { allowed, headers: rateLimitHeaders } = checkRateLimit(emailLimiter, `email-${ip}`);
    if (!allowed) {
      await auditLogger.logSuspicious('send_email', {
        ipAddress: ip,
        userAgent,
        reason: 'Rate limit exceeded for email sending',
      });
      return NextResponse.json(
        { error: 'تم تجاوز الحد الأقصى للإرسال. يرجى المحاولة لاحقاً.' },
        { status: 429, headers: { ...rateLimitHeaders, ...getCorsHeaders(origin || "") } }
      );
    }

    // CORS Check
    if (origin && !isOriginAllowed(origin)) {
      await auditLogger.logSuspicious('send_email', {
        ipAddress: ip,
        userAgent,
        reason: 'CORS origin not allowed',
      });
      return new NextResponse('CORS not allowed', { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      email,
      eventTitle,
      eventDate,
      eventTime,
      location,
      ticketLink,
      heroImage,
      qrData,
      noKids,
      noPhoto,
      seatInfo,
      ticketNumber,
    } = body;

    // Basic validation
    if (!name || !email || !eventTitle) {
      await auditLogger.logFailure('send_email', 'Missing required fields: name, email, or eventTitle', {
        ipAddress: ip,
        userAgent,
      });
      return NextResponse.json(
        { error: 'البيانات المطلوبة غير كاملة' },
        { status: 400, headers: getCorsHeaders(origin || "") }
      );
    }

    // استخدام القالب الاحترافي الجديد
    const htmlContent = ticketEmailTemplate({
      name,
      eventTitle,
      eventDate,
      eventTime,
      location,
      ticketLink,
      heroImage,
      qrData,
      noKids,
      noPhoto,
      seatInfo,
      ticketNumber,
    });

    const data = await resend.emails.send({
      from: 'Meras <onboarding@resend.dev>',
      to: [email],
      subject: `تذكرة دخول: ${eventTitle} 🎫`,
      html: htmlContent,
    });

    if (data.error) {
      await auditLogger.logFailure('send_email', `Resend API error: ${data.error.message}`, {
        ipAddress: ip,
        userAgent,
        details: { recipientEmail: email },
      });

      metricsCollector.incrementCounter('api_errors', 1, { route: '/api/send-email', reason: 'resend_api' });

      return NextResponse.json(
        { error: 'فشل إرسال البريد الإلكتروني' },
        { status: 500, headers: getCorsHeaders(origin || "") }
      );
    }

    // Log success
    await auditLogger.logSuccess('send_email', {
      ipAddress: ip,
      userAgent,
      details: { recipientEmail: email, eventTitle },
    });

    // Track metrics
    metricsCollector.incrementCounter('api_emails_sent', 1, {});

    // Track request duration
    const duration = Date.now() - startTime;
    metricsCollector.recordHistogram('api_request_duration_ms', duration, { route: '/api/send-email', method: 'POST' });

    return NextResponse.json(
      { success: true, data },
      { headers: getCorsHeaders(origin || "") }
    );
  } catch (error) {
    // Log error
    await auditLogger.logFailure('send_email', error instanceof Error ? error.message : 'Unknown error', {
      ipAddress: ip,
      userAgent,
    });

    // Track error
    metricsCollector.incrementCounter('api_errors', 1, { route: '/api/send-email', method: 'POST' });

    console.error('Error in send-email:', error);

    return NextResponse.json(
      { error: 'حدث خطأ في النظام' },
      { status: 500, headers: getCorsHeaders(origin || "") }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');

  if (!origin || !isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin || ""),
  });
}
