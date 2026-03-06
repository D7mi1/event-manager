import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/surveys/respond - تسجيل رد على استبيان
 * لا يتطلب تسجيل دخول (للضيوف) لكن محمي بـ rate limiting
 */

// Simple in-memory rate limiter for survey responses
const responseTracker = new Map<string, { count: number; resetAt: number }>();

function checkSurveyRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000; // 1 minute
  const maxRequests = 10; // 10 responses per minute max

  const record = responseTracker.get(ip);
  if (!record || now > record.resetAt) {
    responseTracker.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) return false;
  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIP = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';

    if (!checkSurveyRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد الأقصى. يرجى المحاولة لاحقاً.' },
        { status: 429 }
      );
    }

    const supabase = await createClient();
    const body = await request.json();
    const { survey_id, attendee_id, attendee_name, answers } = body;

    if (!survey_id || !answers) {
      return NextResponse.json(
        { error: 'survey_id and answers are required' },
        { status: 400 }
      );
    }

    // التحقق من وجود الاستبيان وأنه نشط
    const { data: survey } = await supabase
      .from('surveys')
      .select('id, is_active')
      .eq('id', survey_id)
      .single();

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    if (!survey.is_active) {
      return NextResponse.json({ error: 'Survey is closed' }, { status: 400 });
    }

    // حفظ الرد
    const { data, error } = await supabase
      .from('survey_responses')
      .insert({
        survey_id,
        attendee_id: attendee_id || null,
        attendee_name: attendee_name || null,
        answers: JSON.stringify(answers),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { error: 'حدث خطأ في النظام' },
      { status: 500 }
    );
  }
}
