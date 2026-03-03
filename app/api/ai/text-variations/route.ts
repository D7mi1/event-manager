import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateTextVariations } from '@/lib/services/ai-service';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { aiLimiter, getClientIP, checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = getClientIP(request);
    const { allowed, headers: rateLimitHeaders } = checkRateLimit(aiLimiter, `ai-variations-${ip}`);
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Validation
    const body = await request.json();
    const { text, count = 3 } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'النص مطلوب ويجب أن يكون نصاً صالحاً' },
        { status: 400 }
      );
    }

    // حد أقصى لعدد الاختلافات
    const safeCount = Math.min(Math.max(1, count), 5);

    // 4. توليد الاختلافات
    const variations = await generateTextVariations({ text: text.trim(), count: safeCount });

    return NextResponse.json({
      success: true,
      variations
    });

  } catch (error) {
    return handleApiError(error, 'ai_text_variations');
  }
}
