import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { generateInvitationText } from '@/app/utils/ai-service';
import { handleApiError } from '@/app/utils/api-error-handler';
import { apiLimiter, getClientIP, checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = getClientIP(request);
    const { allowed, headers: rateLimitHeaders } = checkRateLimit(apiLimiter, `ai-text-${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً.' },
        { status: 429, headers: rateLimitHeaders }
      );
    }

    // 2. التحقق من المصادقة
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - يرجى تسجيل الدخول' },
        { status: 401 }
      );
    }

    // 3. Validation
    const body = await request.json();

    if (!body.date || !body.location) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة ناقصة: التاريخ والموقع مطلوبان' },
        { status: 400 }
      );
    }

    // 4. توليد النص
    const text = await generateInvitationText({
      eventType: body.eventType || 'business',
      eventName: body.eventName,
      organizerName: body.organizerName,
      date: body.date,
      location: body.location,
      tone: body.tone || 'formal',
      language: body.language || 'ar'
    });

    return NextResponse.json({ text });
  } catch (error) {
    return handleApiError(error, 'generate-text');
  }
}
