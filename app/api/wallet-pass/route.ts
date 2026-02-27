import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

/**
 * POST /api/wallet-pass - توليد Wallet Pass للتذكرة
 * يرجع ملف .pkpass للـ Apple Wallet
 * أو رابط Google Wallet
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { ticketId, platform } = body;

    if (!ticketId || !platform) {
      return NextResponse.json(
        { error: 'ticketId and platform (apple/google) are required' },
        { status: 400 }
      );
    }

    // جلب بيانات التذكرة والفعالية
    const { data: attendee } = await supabase
      .from('attendees')
      .select('*, events(*)')
      .eq('id', ticketId)
      .single();

    if (!attendee || !attendee.events) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const event = attendee.events;

    const passData = {
      ticketId: attendee.id,
      guestName: attendee.name,
      eventName: event.name,
      eventDate: event.event_date
        ? new Date(event.event_date).toLocaleDateString('ar-SA', {
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
      { error: error.message || 'Failed to generate wallet pass' },
      { status: 500 }
    );
  }
}
