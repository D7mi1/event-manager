import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { checkGuestsLimit, incrementGuestsUsed, decrementGuestsUsed } from '@/app/utils/check-limits-v2';
import { handleApiError } from '@/app/utils/api-error-handler';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ التحقق من الحدود
    const limitCheck = await checkGuestsLimit(user.id);
    
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: limitCheck.message,
          upgrade_required: true,
          current_usage: limitCheck.limit - limitCheck.remaining,
          limit: limitCheck.limit
        },
        { status: 403 }
      );
    }

    // جلب البيانات من Request
    const body = await request.json();
    const { name, email, phone, event_id, status = 'pending' } = body;

    // Validation
    if (!name || !event_id) {
      return NextResponse.json(
        { error: 'الاسم ومعرف الحدث مطلوبان' },
        { status: 400 }
      );
    }

    // إضافة الضيف
    const { data, error } = await supabase
      .from('attendees')
      .insert([{
        name,
        email,
        phone,
        event_id,
        status
      }])
      .select()
      .single();

    if (error) throw error;

    // ✅ زيادة العداد فقط إذا نجحت الإضافة
    if (data) {
      await incrementGuestsUsed(user.id);
    }

    return NextResponse.json({ 
      success: true,
      data,
      remaining: limitCheck.remaining - 1
    });

  } catch (error) {
    return handleApiError(error, 'guests_post');
  }
}

// ✅ DELETE - مع تقليل العداد
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('id');

    if (!guestId) {
      return NextResponse.json({ error: 'معرف الضيف مطلوب' }, { status: 400 });
    }

    // حذف الضيف
    const { error } = await supabase
      .from('attendees')
      .delete()
      .eq('id', guestId);

    if (error) throw error;

    // ✅ تقليل العداد
    await decrementGuestsUsed(user.id);

    return NextResponse.json({ success: true });

  } catch (error) {
    return handleApiError(error, 'guests_delete');
  }
}
