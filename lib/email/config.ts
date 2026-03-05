/**
 * Email Configuration
 * ===================
 * تكوين مركزي لإعدادات الإيميل في منصة مِراس
 * جميع عناوين المُرسل والإعدادات المشتركة في مكان واحد
 */

export const EMAIL_CONFIG = {
  /** المُرسل الافتراضي لجميع الإيميلات (تذاكر، ترحيب، تذكير) */
  from: 'مِراس <noreply@merasapp.com>',

  /** البريد الذي يستقبل رسائل نموذج التواصل */
  adminEmail: process.env.CONTACT_FORM_EMAIL || 'hello@merasapp.com',

  /** الرابط الأساسي للتطبيق */
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://merasapp.com',

  /** رابط لوحة التحكم */
  get dashboardUrl() {
    return `${this.appUrl}/dashboard`;
  },

  /** رابط صفحة الفوترة */
  get billingUrl() {
    return `${this.appUrl}/dashboard/settings?tab=billing`;
  },
} as const;
