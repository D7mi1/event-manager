/**
 * WhatsApp Service
 * ================
 * يدعم طريقتين:
 * 1. روابط واتساب (wa.me) — للمستخدم يفتح ويرسل بنفسه
 * 2. WhatsApp Cloud API — إرسال تلقائي من السيرفر
 *
 * متطلبات Cloud API:
 * - WHATSAPP_PHONE_NUMBER_ID: معرف رقم الهاتف
 * - WHATSAPP_ACCESS_TOKEN: توكن الوصول
 * - WHATSAPP_BUSINESS_ID: معرف حساب الأعمال
 */

// ============================================
// أنواع البيانات
// ============================================

export interface WhatsAppMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WhatsAppTemplateMessage {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: WhatsAppTemplateComponent[];
}

export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters: WhatsAppTemplateParameter[];
}

export interface WhatsAppTemplateParameter {
  type: 'text' | 'image' | 'document';
  text?: string;
  image?: { link: string };
  document?: { link: string; filename: string };
}

export interface WhatsAppTextMessage {
  to: string;
  body: string;
  previewUrl?: boolean;
}

// ============================================
// تنسيق رقم الهاتف
// ============================================

export function normalizePhone(phone: string): string {
  let clean = phone.replace(/[^0-9]/g, '');
  // تحويل الأرقام السعودية
  if (clean.startsWith('05')) clean = '966' + clean.substring(1);
  else if (clean.startsWith('5') && clean.length === 9) clean = '966' + clean;
  // إزالة 00 أو + من البداية
  if (clean.startsWith('00')) clean = clean.substring(2);
  return clean;
}

// ============================================
// الطريقة 1: روابط واتساب (بدون API)
// ============================================

export function generateWhatsAppLink(
  phone: string,
  guestName: string,
  eventName: string,
  ticketId: string,
  tableName?: string
): string {
  const cleanPhone = normalizePhone(phone);
  const domain = typeof window !== 'undefined' ? window.location.origin : '';
  const ticketUrl = `${domain}/t/${ticketId}`;

  let message = `مرحباً ${guestName} 👋،\n\nيسعدنا دعوتك لحضور حفل *${eventName}* ✨\n\nتذكرتك جاهزة، نرجو إبرازها عند الدخول 🎟️:\n${ticketUrl}`;

  if (tableName) {
    message += `\n\n📍 مكان الجلوس: *${tableName}*`;
  }

  message += `\n\nننتظركم بشوق! 🌹`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// ============================================
// رسالة دعوة زفاف
// ============================================

export function generateWeddingInviteLink(
  phone: string,
  guestName: string,
  groomName: string,
  brideName: string,
  eventDate: string,
  eventTime: string,
  location: string,
  ticketId: string,
  tableName?: string
): string {
  const cleanPhone = normalizePhone(phone);
  const domain = typeof window !== 'undefined' ? window.location.origin : '';
  const ticketUrl = `${domain}/t/${ticketId}`;

  let message = `بسم الله الرحمن الرحيم\n\n`;
  message += `السلام عليكم ورحمة الله وبركاته\n\n`;
  message += `*${guestName}* حفظكم الله\n\n`;
  message += `يسرنا دعوتكم لحضور حفل زفاف\n`;
  message += `*${groomName}* و *${brideName}* ✨\n\n`;
  message += `📅 *التاريخ:* ${eventDate}\n`;
  message += `🕗 *الوقت:* ${eventTime}\n`;
  message += `📍 *الموقع:* ${location}\n`;

  if (tableName) {
    message += `💺 *المقعد:* ${tableName}\n`;
  }

  message += `\n🎟️ *تذكرتك الإلكترونية:*\n${ticketUrl}\n`;
  message += `\nيرجى إبراز التذكرة (الباركود) عند الباب\n`;
  message += `\nنتشرف بحضوركم 🌹`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// ============================================
// الطريقة 2: WhatsApp Cloud API (إرسال تلقائي)
// ============================================

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';

function getWhatsAppConfig() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    return null;
  }

  return { phoneNumberId, accessToken };
}

/**
 * هل WhatsApp Cloud API مضبوط؟
 */
export function isWhatsAppApiEnabled(): boolean {
  return getWhatsAppConfig() !== null;
}

/**
 * إرسال رسالة نصية عبر WhatsApp Cloud API
 */
export async function sendTextMessage(
  message: WhatsAppTextMessage
): Promise<WhatsAppMessageResult> {
  const config = getWhatsAppConfig();
  if (!config) {
    return { success: false, error: 'WhatsApp Cloud API غير مضبوط' };
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizePhone(message.to),
          type: 'text',
          text: {
            preview_url: message.previewUrl ?? true,
            body: message.body,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp API Error]', data);
      return {
        success: false,
        error: data?.error?.message || 'فشل إرسال الرسالة',
      };
    }

    return {
      success: true,
      messageId: data?.messages?.[0]?.id,
    };
  } catch (err) {
    console.error('[WhatsApp API Error]', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'خطأ في الاتصال',
    };
  }
}

/**
 * إرسال رسالة قالب (Template) عبر WhatsApp Cloud API
 * مناسب للدعوات الرسمية — تحتاج تسجيل القالب في Meta أولاً
 */
export async function sendTemplateMessage(
  message: WhatsAppTemplateMessage
): Promise<WhatsAppMessageResult> {
  const config = getWhatsAppConfig();
  if (!config) {
    return { success: false, error: 'WhatsApp Cloud API غير مضبوط' };
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizePhone(message.to),
          type: 'template',
          template: {
            name: message.templateName,
            language: { code: message.languageCode || 'ar' },
            components: message.components,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp Template Error]', data);
      return {
        success: false,
        error: data?.error?.message || 'فشل إرسال القالب',
      };
    }

    return {
      success: true,
      messageId: data?.messages?.[0]?.id,
    };
  } catch (err) {
    console.error('[WhatsApp Template Error]', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'خطأ في الاتصال',
    };
  }
}

/**
 * إرسال دعوة فعالية عبر Cloud API (رسالة نصية)
 * يستخدم كـ fallback لو ما عندك Template معتمد من Meta
 */
export async function sendEventInvitation(
  phone: string,
  guestName: string,
  eventName: string,
  ticketUrl: string,
  tableName?: string
): Promise<WhatsAppMessageResult> {
  let body = `مرحباً ${guestName} 👋\n\nيسعدنا دعوتك لحضور حفل *${eventName}* ✨\n\nتذكرتك جاهزة:\n${ticketUrl}`;

  if (tableName) {
    body += `\n\n📍 مكان الجلوس: *${tableName}*`;
  }

  body += `\n\nننتظركم بشوق! 🌹`;

  return sendTextMessage({ to: phone, body, previewUrl: true });
}

/**
 * إرسال دعوة زفاف عبر Cloud API
 */
export async function sendWeddingInvitation(
  phone: string,
  guestName: string,
  groomName: string,
  brideName: string,
  eventDate: string,
  eventTime: string,
  location: string,
  ticketUrl: string,
  tableName?: string
): Promise<WhatsAppMessageResult> {
  let body = `بسم الله الرحمن الرحيم\n\n`;
  body += `السلام عليكم ورحمة الله وبركاته\n\n`;
  body += `*${guestName}* حفظكم الله\n\n`;
  body += `يسرنا دعوتكم لحضور حفل زفاف\n`;
  body += `*${groomName}* و *${brideName}* ✨\n\n`;
  body += `📅 ${eventDate}\n🕗 ${eventTime}\n📍 ${location}\n`;

  if (tableName) {
    body += `💺 ${tableName}\n`;
  }

  body += `\n🎟️ تذكرتك:\n${ticketUrl}\n`;
  body += `\nنتشرف بحضوركم 🌹`;

  return sendTextMessage({ to: phone, body, previewUrl: true });
}

/**
 * إرسال رسائل جماعية (Batch)
 * يرسل مع تأخير بين كل رسالة لتجنب Rate Limiting
 */
export async function sendBulkMessages(
  messages: Array<{ phone: string; body: string }>,
  delayMs = 1000
): Promise<{ sent: number; failed: number; results: WhatsAppMessageResult[] }> {
  const results: WhatsAppMessageResult[] = [];
  let sent = 0;
  let failed = 0;

  for (const msg of messages) {
    const result = await sendTextMessage({ to: msg.phone, body: msg.body });
    results.push(result);

    if (result.success) sent++;
    else failed++;

    // تأخير بين الرسائل
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { sent, failed, results };
}
