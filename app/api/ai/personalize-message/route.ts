/**
 * Personalize WhatsApp Message API Route
 * =======================================
 * يولد رسالة واتساب مخصصة حسب فئة الضيف
 *
 * POST /api/ai/personalize-message
 * Body: { guestName, guestCategory, eventType, eventName, eventDate, location? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePersonalizedMessage } from '@/lib/services/ai-service';
import { aiLimiter, getClientIP, checkRateLimit } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const PersonalizeSchema = z.object({
  guestName: z.string().min(1, 'اسم الضيف مطلوب'),
  guestCategory: z.enum(['GENERAL', 'VIP', 'FAMILY']),
  eventType: z.string().min(1),
  eventName: z.string().min(1),
  eventDate: z.string().min(1),
  location: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting (AI = صارم)
    const ip = getClientIP(request);
    const { allowed, headers: rateLimitHeaders } = checkRateLimit(aiLimiter, `personalize-${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد الأقصى لطلبات AI. يرجى المحاولة لاحقاً.' },
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
    const validated = PersonalizeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    // 4. توليد الرسالة
    const message = await generatePersonalizedMessage(validated.data);

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    return handleApiError(error, 'personalize-message');
  }
}
