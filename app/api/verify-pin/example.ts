/**
 * 🔐 Example API Route with Rate Limiting
 * مثال على كيفية استخدام Rate Limiting في API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { pinVerifyLimiter, getClientIP, checkRateLimit } from '@/lib/rate-limit';
import { getCorsHeaders, isOriginAllowed } from '@/lib/cors';
import { safeParsePINVerification } from '@/lib/schemas';

/**
 * POST /api/verify-pin
 * التحقق من PIN مع Rate Limiting
 */
export async function POST(request: NextRequest) {
  try {
    // 🔐 التحقق من الـ CORS
    const origin = request.headers.get('origin');
    if (origin && !isOriginAllowed(origin)) {
      return new NextResponse('CORS not allowed', { status: 403 });
    }

    // 📦 قراءة البيانات
    const body = await request.json();

    // ✅ Validation
    const validation = await safeParsePINVerification(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'بيانات غير صحيحة',
          details: validation.errors,
        },
        {
          status: 400,
          headers: getCorsHeaders(origin),
        }
      );
    }

    // 🚦 Rate Limiting
    const ip = getClientIP(request);
    const key = `pin-verify-${body.eventId}-${ip}`;
    const result = checkRateLimit(pinVerifyLimiter, key);

    if (!result.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'تم تجاوز عدد المحاولات المسموحة. حاول مجدداً لاحقاً.',
        },
        {
          status: 429,
          headers: {
            ...Object.fromEntries(
              Object.entries(getCorsHeaders(origin)).map(([k, v]) => [k, v])
            ),
            'Retry-After': '600', // 10 دقائق
          },
        }
      );
    }

    // 🔍 التحقق من PIN (مثال)
    const { eventId, pin } = validation.data!;

    // ⚠️ في التطبيق الفعلي، تحقق من PIN من قاعدة البيانات
    // const isValid = await verifyEventPin(eventId, pin);

    // مثال مؤقت:
    const isValid = pin === '1234'; // استبدل بـ الدالة الفعلية

    if (isValid) {
      return NextResponse.json(
        { success: true, message: 'PIN صحيح' },
        {
          status: 200,
          headers: getCorsHeaders(origin),
        }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'البيانات المدخلة غير صحيحة',
          remaining: result.remaining,
        },
        {
          status: 401,
          headers: getCorsHeaders(origin),
        }
      );
    }
  } catch (error) {
    console.error('Error in verify-pin:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في النظام',
      },
      {
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin')),
      }
    );
  }
}

/**
 * معالجة OPTIONS request (CORS preflight)
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');

  if (!origin || !isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

/**
 * ملاحظات مهمة:
 * 
 * 1. جميع API routes يجب أن تستخدم هذا الـ pattern
 * 2. استخدم Rate Limiters المختلفة حسب الحاجة
 * 3. دائماً تحقق من الـ CORS
 * 4. دائماً validate الـ input
 * 5. دائماً أرجع CORS headers في الـ response
 */
