import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

/**
 * POST /api/surveys/respond - تسجيل رد على استبيان
 * لا يتطلب تسجيل دخول (للضيوف)
 */

export async function POST(request: NextRequest) {
  try {
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
