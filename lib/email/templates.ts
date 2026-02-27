/**
 * Email Templates System
 * ======================
 * قوالب إيميل احترافية لمنصة مِراس
 * جميع القوالب تدعم RTL والعربية
 */

// ============================================
// الألوان والثيم المشترك
// ============================================
const BRAND = {
  primary: '#2563eb',
  primaryDark: '#1e40af',
  gold: '#C19D65',
  dark: '#0F0F12',
  text: '#374151',
  textLight: '#6b7280',
  bg: '#f3f4f6',
  cardBg: '#ffffff',
  border: '#e5e7eb',
  success: '#10b981',
  error: '#ef4444',
};

// ============================================
// Layout المشترك لجميع الإيميلات
// ============================================
function emailWrapper(content: string, options?: { preheader?: string }) {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>مِراس</title>
  ${options?.preheader ? `<span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${options.preheader}</span>` : ''}
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; background-color: ${BRAND.bg}; }

    /* Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    * { font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .email-body { background-color: #1a1a2e !important; }
      .email-card { background-color: #16213e !important; border-color: #2a2a4a !important; }
      .email-text { color: #e2e8f0 !important; }
      .email-text-light { color: #94a3b8 !important; }
    }

    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 8px !important; }
      .email-card { border-radius: 12px !important; }
      .email-header { padding: 24px 16px !important; }
      .email-content { padding: 20px 16px !important; }
      .email-btn { display: block !important; width: 100% !important; text-align: center !important; }
    }
  </style>
</head>
<body class="email-body" style="background-color: ${BRAND.bg}; margin: 0; padding: 0;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND.bg};">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto;">
          ${content}
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 13px; color: ${BRAND.textLight};">
                مِراس - منصة إدارة الفعاليات والمؤتمرات
              </p>
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                &copy; ${new Date().getFullYear()} مِراس. جميع الحقوق محفوظة.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================
// قالب تذكرة الفعالية (محسّن)
// ============================================
export interface TicketEmailData {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  ticketLink: string;
  heroImage?: string;
  qrData: string;
  noKids?: boolean;
  noPhoto?: boolean;
  seatInfo?: string;
  ticketNumber?: string;
}

export function ticketEmailTemplate(data: TicketEmailData): string {
  const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(data.qrData)}&size=300&margin=1&ecLevel=H&format=png`;

  const tags: string[] = [];
  if (data.noKids) tags.push('<span style="display:inline-block;font-size:11px;padding:4px 12px;border-radius:20px;font-weight:bold;background:#fee2e2;color:#991b1b;border:1px solid #fecaca;margin:0 4px;">ممنوع اصطحاب الأطفال</span>');
  if (data.noPhoto) tags.push('<span style="display:inline-block;font-size:11px;padding:4px 12px;border-radius:20px;font-weight:bold;background:#fee2e2;color:#991b1b;border:1px solid #fecaca;margin:0 4px;">ممنوع التصوير</span>');

  const content = `
    <!-- Header مع صورة الغلاف -->
    <tr>
      <td class="email-card" style="background: ${BRAND.cardBg}; border-radius: 20px 20px 0 0; overflow: hidden; border: 1px solid ${BRAND.border}; border-bottom: none;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td class="email-header" style="background: linear-gradient(135deg, ${BRAND.primaryDark}, ${BRAND.primary}); padding: 40px 32px; text-align: center; color: white;${data.heroImage ? ` background-image: url('${data.heroImage}'); background-size: cover; background-position: center;` : ''}">
              ${data.heroImage ? '<div style="background: rgba(30, 64, 175, 0.85); margin: -40px -32px; padding: 40px 32px;">' : ''}
              <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 16px; margin: 0 auto 16px; line-height: 56px; font-size: 28px;">🎫</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${data.eventTitle}</h1>
              <p style="margin: 10px 0 0; opacity: 0.9; font-size: 14px;">تم تأكيد تسجيلك بنجاح</p>
              ${data.heroImage ? '</div>' : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- المحتوى الرئيسي -->
    <tr>
      <td class="email-card" style="background: ${BRAND.cardBg}; border: 1px solid ${BRAND.border}; border-top: none; border-bottom: none;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td class="email-content" style="padding: 32px;">
              <!-- الترحيب -->
              <h2 class="email-text" style="margin: 0 0 20px; font-size: 20px; font-weight: 700; color: ${BRAND.dark};">
                مرحباً ${data.name}! 👋
              </h2>

              <!-- تفاصيل الفعالية -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0;">
                          <span style="color: ${BRAND.textLight}; font-size: 12px; font-weight: 600;">التاريخ</span><br/>
                          <span class="email-text" style="color: ${BRAND.dark}; font-size: 15px; font-weight: 700;">📅 ${data.eventDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0;">
                          <span style="color: ${BRAND.textLight}; font-size: 12px; font-weight: 600;">الوقت</span><br/>
                          <span class="email-text" style="color: ${BRAND.dark}; font-size: 15px; font-weight: 700;">⏰ ${data.eventTime}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;${data.seatInfo ? ' border-bottom: 1px dashed #e2e8f0;' : ''}">
                          <span style="color: ${BRAND.textLight}; font-size: 12px; font-weight: 600;">الموقع</span><br/>
                          <span class="email-text" style="color: ${BRAND.dark}; font-size: 15px; font-weight: 700;">📍 ${data.location}</span>
                        </td>
                      </tr>
                      ${data.seatInfo ? `
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="color: ${BRAND.textLight}; font-size: 12px; font-weight: 600;">المقعد</span><br/>
                          <span class="email-text" style="color: ${BRAND.dark}; font-size: 15px; font-weight: 700;">💺 ${data.seatInfo}</span>
                        </td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              ${data.ticketNumber ? `
              <p style="text-align: center; margin: 0 0 16px;">
                <span style="display: inline-block; background: ${BRAND.primary}10; border: 1px solid ${BRAND.primary}30; padding: 6px 16px; border-radius: 8px; font-size: 12px; color: ${BRAND.primary}; font-weight: 700;">
                  رقم التذكرة: ${data.ticketNumber}
                </span>
              </p>` : ''}

              <!-- QR Code -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; padding: 16px; border: 2px dashed #cbd5e1; border-radius: 20px; background: white;">
                      <img src="${qrImageUrl}" alt="QR Code" width="200" height="200" style="display: block; border-radius: 8px;" />
                      <p style="margin: 10px 0 0; font-size: 11px; color: #94a3b8; text-align: center; font-weight: 600;">امسح الرمز عند البوابة للدخول</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- زر عرض التذكرة -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${data.ticketLink}" class="email-btn" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primaryDark}, ${BRAND.primary}); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">
                      عرض التذكرة الكاملة
                    </a>
                  </td>
                </tr>
              </table>

              ${tags.length > 0 ? `
              <!-- التنبيهات -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    ${tags.join(' ')}
                  </td>
                </tr>
              </table>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- تذييل البطاقة -->
    <tr>
      <td class="email-card" style="background: #f9fafb; border-radius: 0 0 20px 20px; border: 1px solid ${BRAND.border}; border-top: none;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: ${BRAND.textLight};">
                💡 يمكنك إضافة الفعالية لتقويمك من خلال رابط التذكرة
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  return emailWrapper(content, {
    preheader: `تذكرة دخولك لفعالية ${data.eventTitle} جاهزة!`,
  });
}

// ============================================
// قالب تأكيد الحضور
// ============================================
export interface AttendanceConfirmationData {
  name: string;
  eventTitle: string;
  checkedInAt: string;
}

export function attendanceConfirmationTemplate(data: AttendanceConfirmationData): string {
  const content = `
    <tr>
      <td class="email-card" style="background: ${BRAND.cardBg}; border-radius: 20px; border: 1px solid ${BRAND.border}; overflow: hidden;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669, ${BRAND.success}); padding: 36px 32px; text-align: center; color: white;">
              <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px; line-height: 64px; font-size: 32px;">✅</div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800;">تم تسجيل حضورك!</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td class="email-content" style="padding: 32px; text-align: center;">
              <p class="email-text" style="color: ${BRAND.text}; font-size: 16px; margin: 0 0 16px;">
                مرحباً <strong>${data.name}</strong>، تم تسجيل حضورك في:
              </p>
              <h2 style="color: ${BRAND.primary}; margin: 0 0 16px; font-size: 20px;">${data.eventTitle}</h2>
              <p class="email-text-light" style="color: ${BRAND.textLight}; font-size: 14px; margin: 0;">
                وقت الحضور: ${data.checkedInAt}
              </p>
              <p style="margin: 24px 0 0; font-size: 14px; color: ${BRAND.textLight};">
                نتمنى لك وقتاً ممتعاً! 🎉
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  return emailWrapper(content, {
    preheader: `تم تسجيل حضورك في ${data.eventTitle}`,
  });
}

// ============================================
// قالب تذكير بالفعالية
// ============================================
export interface EventReminderData {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  ticketLink: string;
  hoursUntil: number;
}

export function eventReminderTemplate(data: EventReminderData): string {
  const content = `
    <tr>
      <td class="email-card" style="background: ${BRAND.cardBg}; border-radius: 20px; border: 1px solid ${BRAND.border}; overflow: hidden;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #d97706, #f59e0b); padding: 36px 32px; text-align: center; color: white;">
              <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 16px; margin: 0 auto 16px; line-height: 56px; font-size: 28px;">⏰</div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800;">تذكير بالفعالية</h1>
              <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">باقي ${data.hoursUntil} ساعة على البدء</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td class="email-content" style="padding: 32px;">
              <p class="email-text" style="color: ${BRAND.text}; font-size: 16px; margin: 0 0 20px;">
                مرحباً <strong>${data.name}</strong>، نذكرك بفعالية:
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 12px; color: ${BRAND.dark}; font-size: 18px;">${data.eventTitle}</h3>
                    <p style="margin: 0 0 6px; font-size: 14px; color: ${BRAND.text};">📅 ${data.eventDate}</p>
                    <p style="margin: 0 0 6px; font-size: 14px; color: ${BRAND.text};">⏰ ${data.eventTime}</p>
                    <p style="margin: 0; font-size: 14px; color: ${BRAND.text};">📍 ${data.location}</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${data.ticketLink}" class="email-btn" style="display: inline-block; background: linear-gradient(135deg, #d97706, #f59e0b); color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 14px;">
                      عرض التذكرة
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  return emailWrapper(content, {
    preheader: `تذكير: ${data.eventTitle} بعد ${data.hoursUntil} ساعة`,
  });
}

// ============================================
// قالب ترحيب مستخدم جديد
// ============================================
export interface WelcomeEmailData {
  name: string;
  dashboardUrl: string;
}

export function welcomeEmailTemplate(data: WelcomeEmailData): string {
  const content = `
    <tr>
      <td class="email-card" style="background: ${BRAND.cardBg}; border-radius: 20px; border: 1px solid ${BRAND.border}; overflow: hidden;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.primaryDark}, ${BRAND.primary}); padding: 48px 32px; text-align: center; color: white;">
              <div style="width: 72px; height: 72px; background: rgba(255,255,255,0.15); border-radius: 20px; margin: 0 auto 20px; line-height: 72px; font-size: 36px;">🚀</div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 800;">أهلاً بك في مِراس!</h1>
              <p style="margin: 12px 0 0; opacity: 0.9; font-size: 15px;">منصتك لتنظيم فعاليات استثنائية</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td class="email-content" style="padding: 32px;">
              <p class="email-text" style="color: ${BRAND.text}; font-size: 16px; line-height: 1.8; margin: 0 0 24px;">
                مرحباً <strong>${data.name}</strong>، يسعدنا انضمامك! مِراس يساعدك في تنظيم فعالياتك بسهولة تامة.
              </p>

              <!-- الخطوات -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td style="padding: 14px 16px; background: #f0f9ff; border-radius: 12px; margin-bottom: 8px; border-right: 3px solid ${BRAND.primary};">
                    <span style="color: ${BRAND.primary}; font-weight: 800; font-size: 18px; margin-left: 10px;">1</span>
                    <span class="email-text" style="color: ${BRAND.text}; font-weight: 600;">أنشئ فعاليتك الأولى</span>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 14px 16px; background: #f0f9ff; border-radius: 12px; margin-bottom: 8px; border-right: 3px solid ${BRAND.primary};">
                    <span style="color: ${BRAND.primary}; font-weight: 800; font-size: 18px; margin-left: 10px;">2</span>
                    <span class="email-text" style="color: ${BRAND.text}; font-weight: 600;">أضف الضيوف وأرسل الدعوات</span>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 14px 16px; background: #f0f9ff; border-radius: 12px; border-right: 3px solid ${BRAND.primary};">
                    <span style="color: ${BRAND.primary}; font-weight: 800; font-size: 18px; margin-left: 10px;">3</span>
                    <span class="email-text" style="color: ${BRAND.text}; font-weight: 600;">امسح التذاكر عند البوابة</span>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${data.dashboardUrl}" class="email-btn" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primaryDark}, ${BRAND.primary}); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">
                      ابدأ الآن
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  return emailWrapper(content, {
    preheader: 'مرحباً بك في مِراس! ابدأ بإنشاء فعاليتك الأولى',
  });
}
