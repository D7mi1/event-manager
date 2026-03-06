import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/surveys - إنشاء استبيان جديد
 * GET /api/surveys?event_id=xxx - جلب استبيانات الفعالية
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event_id, title, description, questions } = body;

    if (!event_id || !title || !questions?.length) {
      return NextResponse.json(
        { error: 'event_id, title, and questions are required' },
        { status: 400 }
      );
    }

    // التحقق من ملكية الفعالية
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('id', event_id)
      .eq('user_id', user.id)
      .single();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('surveys')
      .insert({
        event_id,
        user_id: user.id,
        title,
        description: description || null,
        questions: JSON.stringify(questions),
        is_active: true,
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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = request.nextUrl.searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
    }

    // التحقق من ملكية الفعالية
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch {
    return NextResponse.json(
      { error: 'حدث خطأ في النظام' },
      { status: 500 }
    );
  }
}
