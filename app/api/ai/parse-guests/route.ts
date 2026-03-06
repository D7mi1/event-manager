/**
 * Parse Guests API Route
 * =======================
 * يحلل نص فوضوي (من واتساب أو ملاحظات) ويستخرج بيانات الضيوف
 *
 * الوضع السريع (regex فقط — مجاني): mode = 'fast'
 * الوضع الذكي (AI + regex — يستهلك رصيد): mode = 'smart'
 *
 * POST /api/ai/parse-guests
 * Body: { rawText: string, eventId: string, mode?: 'fast' | 'smart' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SmartPasteSchema } from '@/lib/schemas';
import { parseGuestText } from '@/lib/utils/guest-parser';
import { apiLimiter, getClientIP, checkRateLimit } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/utils/api-error-handler';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = getClientIP(request);
    const { allowed, headers: rateLimitHeaders } = checkRateLimit(apiLimiter, `parse-guests-${ip}`);
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
        { error: 'يرجى تسجيل الدخول' },
        { status: 401 }
      );
    }

    // 3. التحقق من البيانات
    const body = await request.json();
    const validated = SmartPasteSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { rawText, eventId } = validated.data;

    // 4. التحقق من ملكية الفعالية
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, user_id')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'الفعالية غير موجودة أو ليس لديك صلاحية' },
        { status: 403 }
      );
    }

    // 5. التحليل (الوضع السريع — regex فقط)
    const result = parseGuestText(rawText);

    return NextResponse.json({
      success: true,
      guests: result.guests,
      totalLines: result.totalLines,
      parsedCount: result.parsedCount,
      skippedCount: result.skippedCount,
      warnings: result.warnings,
    });
  } catch (error) {
    return handleApiError(error, 'parse-guests');
  }
}
