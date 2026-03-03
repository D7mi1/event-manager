import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/wallet-pass - توليد Wallet Pass للتذكرة
 * يرجع ملف .pkpass للـ Apple Wallet
 * أو رابط Google Wallet
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // ✅ Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ticketId, platform } = body;

    if (!ticketId || !platform) {
      return NextResponse.json(
        { error: 'ticketId and platform (apple/google) are required' },
        { status: 400 }
      );
    }

    // جلب بيانات التذكرة والفعالية مع التحقق من الملكية
    const { data: attendee } = await supabase
      .from('attendees')
      .select('*, events!inner(*)')
      .eq('id', ticketId)
      .single();

    if (!attendee || !attendee.events) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const event = attendee.events;

    // ✅ التحقق من ملكية الفعالية
    if (event.user_id !== user.id) {
      return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 });
    }

    const passData = {
      ticketId: attendee.id,
      guestName: attendee.name,
      eventName: event.name,
      eventDate: event.date
        ? new Date(event.date).toLocaleDateString('ar-SA', {
            dateStyle: 'long',
          })
        : '',
      eventLocation: event.location_name || '',
      category: attendee.category || 'عام',
      qrData: `${process.env.NEXT_PUBLIC_APP_URL || 'https://meras.app'}/t/${attendee.id}`,
    };

    if (platform === 'apple') {
      // التحقق من تكوين Apple Wallet
      if (!process.env.APPLE_PASS_CERT_PATH || !process.env.APPLE_TEAM_ID) {
        return NextResponse.json(
          { error: 'Apple Wallet not configured. Required: APPLE_PASS_CERT_PATH, APPLE_TEAM_ID, APPLE_PASS_TYPE_ID' },
          { status: 501 }
        );
      }

      const { generateApplePass } = await import('@/lib/wallet/types');
      const buffer = await generateApplePass(passData);

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.apple.pkpass',
          'Content-Disposition': `attachment; filename="${attendee.name}_ticket.pkpass"`,
        },
      });
    } else if (platform === 'google') {
      if (!process.env.GOOGLE_WALLET_ISSUER_ID) {
        return NextResponse.json(
          { error: 'Google Wallet not configured. Required: GOOGLE_WALLET_ISSUER_ID, GOOGLE_WALLET_CLASS_ID' },
          { status: 501 }
        );
      }

      const { generateGoogleWalletUrl } = await import('@/lib/wallet/types');
      const url = await generateGoogleWalletUrl(passData);

      return NextResponse.json({ success: true, walletUrl: url });
    }

    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
  } catch (error: any) {
    console.error('Wallet pass error:', error);
    return NextResponse.json(
      { error: 'Failed to generate wallet pass' },
      { status: 500 }
    );
  }
}
