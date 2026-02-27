/**
 * Polar Webhook Handler
 * ======================
 * يستقبل أحداث الاشتراك من Polar ويحدث قاعدة البيانات
 *
 * الأحداث المدعومة:
 * - subscription.created → ترقية الخطة
 * - subscription.updated → تحديث الخطة (ترقية/تنزيل/تجديد)
 * - subscription.canceled → إلغاء (يبقى فعال حتى نهاية الفترة)
 * - subscription.revoked → إلغاء فوري → رجوع للمجانية
 *
 * إعداد Webhook في Polar:
 * URL: https://yourdomain.com/api/webhooks/polar
 * Secret: قيمة POLAR_WEBHOOK_SECRET
 * Events: subscription.created, subscription.updated, subscription.canceled, subscription.revoked
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  resolvePlanFromPriceId,
  type PolarWebhookPayload,
  type PolarWebhookEventType,
} from '@/lib/billing/polar';
import { createClient } from '@supabase/supabase-js';

// Supabase Admin Client (يتجاوز RLS)
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }

  return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('webhook-signature') || request.headers.get('x-polar-signature') || '';

    // التحقق من التوقيع
    const isValid = await verifyWebhookSignature(payload, signature);
    if (!isValid) {
      console.error('[Polar Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event: PolarWebhookPayload = JSON.parse(payload);
    const eventType = event.type as PolarWebhookEventType;
    const subscriptionData = event.data;
    const userId = subscriptionData.metadata?.user_id;

    if (!userId) {
      console.error('[Polar Webhook] No user_id in metadata');
      return NextResponse.json({ error: 'Missing user_id in metadata' }, { status: 400 });
    }

    const supabase = getAdminClient();

    switch (eventType) {
      // ==========================================
      // اشتراك جديد أو تحديث
      // ==========================================
      case 'subscription.created':
      case 'subscription.updated': {
        const priceId = subscriptionData.price_id;
        const planId = resolvePlanFromPriceId(priceId);
        const status = subscriptionData.status;

        // تحديث الملف الشخصي
        const updateData: Record<string, any> = {
          plan_id: planId,
          subscription_id: subscriptionData.id,
          subscription_status: status,
          polar_customer_id: subscriptionData.customer_id,
          updated_at: new Date().toISOString(),
        };

        // إضافة تاريخ نهاية الفترة
        if (subscriptionData.current_period_end) {
          updateData.subscription_period_end = subscriptionData.current_period_end;
        }

        await supabase.from('profiles').update(updateData).eq('id', userId);

        console.log(`[Polar Webhook] ${eventType}: User ${userId} → Plan ${planId} (${status})`);
        break;
      }

      // ==========================================
      // إلغاء (يبقى فعال حتى نهاية الفترة)
      // ==========================================
      case 'subscription.canceled': {
        await supabase.from('profiles').update({
          subscription_status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('id', userId);

        console.log(`[Polar Webhook] subscription.canceled: User ${userId} (active until period end)`);
        break;
      }

      // ==========================================
      // إلغاء فوري → رجوع للمجانية
      // ==========================================
      case 'subscription.revoked': {
        await supabase.from('profiles').update({
          plan_id: 'free',
          subscription_id: null,
          subscription_status: 'revoked',
          polar_customer_id: null,
          subscription_period_end: null,
          updated_at: new Date().toISOString(),
        }).eq('id', userId);

        console.log(`[Polar Webhook] subscription.revoked: User ${userId} → Free plan`);
        break;
      }

      default:
        console.log(`[Polar Webhook] Unhandled event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Polar Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
