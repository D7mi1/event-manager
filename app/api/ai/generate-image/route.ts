import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateInvitationImage } from '@/lib/services/ai-service';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { aiLimiter, getClientIP, checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 0. Rate Limiting (توليد الصور مكلف)
    const ip = getClientIP(request);
    const { allowed, headers: rateLimitHeaders } = checkRateLimit(aiLimiter, `ai-image-${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً.', retryAfter: 60 },
        { status: 429, headers: rateLimitHeaders }
      );
    }

    // 1. التحقق من المصادقة
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - يرجى تسجيل الدخول' }, 
        { status: 401 }
      );
    }

    // 2. استلام البيانات من الطلب
    const body = await request.json();
    const { eventType, theme, colors, style, organizerName } = body;

    // 3. Validation
    if (!eventType || !theme) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType and theme are required' },
        { status: 400 }
      );
    }

    // 4. توليد الصورة باستخدام Hugging Face
    const imageDataUrl = await generateInvitationImage({
      eventType,
      organizerName,
      themeColor: theme,
      style: style || 'modern',
    });

    // 5. رفع الصورة إلى Supabase Storage (إذا كانت Base64)
    let publicUrl = imageDataUrl;
    let storagePath = null;

    if (imageDataUrl.startsWith('data:')) {
      // استخراج البيانات من Base64
      const matches = imageDataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      
      if (matches && matches.length === 3) {
        const contentType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        // رفع الملف
        const fileName = `ai-generated/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, buffer, {
            contentType: contentType || 'image/png',
            upsert: false,
            cacheControl: '3600',
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          // نستمر مع الـ Base64 URL كـ fallback
        } else {
          // الحصول على URL العام
          const { data: urlData } = supabase.storage
            .from('event-images')
            .getPublicUrl(fileName);
          
          publicUrl = urlData.publicUrl;
          storagePath = fileName;
        }
      }
    }

    // 6. حفظ سجل الاستخدام (اختياري)
    try {
      await supabase.from('ai_usage_logs').insert({
        user_id: user.id,
        type: 'image_generation',
        metadata: {
          eventType,
          theme,
          style,
          storage_path: storagePath,
        },
        cost: 0, // مجاني مع Hugging Face!
      });
    } catch (logError) {
      // لا نريد أن يفشل الطلب بسبب Log
      console.error('Failed to log usage:', logError);
    }

    // 7. إرجاع النتيجة
    return NextResponse.json({ 
      success: true,
      imageUrl: publicUrl,
      storagePath: storagePath,
      provider: 'huggingface',
      message: 'تم توليد الصورة بنجاح ✨'
    });

  } catch (error: any) {
    console.error('Image generation error:', error?.message || 'Unknown error');
    
    // معالجة أخطاء محددة
    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { 
          error: 'تم الوصول للحد الأقصى من الطلبات. يرجى المحاولة بعد قليل.',
          retryAfter: 60
        },
        { status: 429 }
      );
    }

    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'خطأ في إعدادات الذكاء الاصطناعي. يرجى التواصل مع الدعم.' },
        { status: 500 }
      );
    }

    return handleApiError(error, 'ai_generate_image');
  }
}

// معلومات عن الـ Route (اختياري)
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 ثانية - توليد الصور قد يأخذ وقت
