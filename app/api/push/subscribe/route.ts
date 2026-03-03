import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/push/subscribe - تسجيل اشتراك push notification
 * يحفظ بيانات الاشتراك في Supabase
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscription, event_id } = body;

    if (!subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json(
        { error: 'Valid push subscription data required' },
        { status: 400 }
      );
    }

    // حفظ أو تحديث الاشتراك
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          event_id: event_id || null,
          endpoint: subscription.endpoint,
          keys_p256dh: subscription.keys.p256dh,
          keys_auth: subscription.keys.auth,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'endpoint',
        }
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/push/subscribe - إلغاء اشتراك push
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'endpoint required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}
