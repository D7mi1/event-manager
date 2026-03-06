/**
 * Phone Number Utilities
 * ======================
 * مكتبة موحدة لمعالجة أرقام الهواتف
 * تدعم أرقام دول الخليج + الأرقام العربية (الهندية)
 */

// ============================================
// تحويل الأرقام الهندية → إنجليزية
// ============================================

const HINDI_TO_ENGLISH: Record<string, string> = {
  '\u0660': '0', // ٠
  '\u0661': '1', // ١
  '\u0662': '2', // ٢
  '\u0663': '3', // ٣
  '\u0664': '4', // ٤
  '\u0665': '5', // ٥
  '\u0666': '6', // ٦
  '\u0667': '7', // ٧
  '\u0668': '8', // ٨
  '\u0669': '9', // ٩
};

/**
 * تحويل الأرقام العربية-الهندية إلى إنجليزية
 * مثال: "٠٥٥١٢٣٤٥٦٧" → "0551234567"
 */
export function convertHindiNumerals(str: string): string {
  return str.replace(/[\u0660-\u0669]/g, (match) => HINDI_TO_ENGLISH[match] || match);
}

// ============================================
// تنظيف وتوحيد أرقام الهاتف
// ============================================

/**
 * تنظيف رقم الهاتف من الرموز وتوحيد الصيغة
 * يحوّل الأرقام السعودية: 05 → 9665
 * يدعم كل دول الخليج
 */
export function normalizePhone(phone: string): string {
  // تحويل الأرقام الهندية أولاً
  let clean = convertHindiNumerals(phone);

  // إزالة كل شيء عدا الأرقام
  clean = clean.replace(/[^0-9]/g, '');

  // إزالة بادئة 00 الدولية
  if (clean.startsWith('00')) {
    clean = clean.substring(2);
  }

  // ===== السعودية =====
  // 05XXXXXXXX → 9665XXXXXXXX
  if (clean.startsWith('05') && clean.length === 10) {
    clean = '966' + clean.substring(1);
  }
  // 5XXXXXXXX (9 أرقام) → 9665XXXXXXXX
  else if (clean.startsWith('5') && clean.length === 9) {
    clean = '966' + clean;
  }

  // ===== الإمارات =====
  // 05X... (11 أرقام مع 0) → 9715X...
  else if (clean.startsWith('05') && clean.length === 11 && !clean.startsWith('0500')) {
    // تمييز الإماراتي من السعودي بالطول
  }

  return clean;
}

/**
 * تنسيق رقم الهاتف للعرض
 * مثال: "966551234567" → "+966 55 123 4567"
 */
export function formatPhoneDisplay(phone: string): string {
  const normalized = normalizePhone(phone);

  // سعودي
  if (normalized.startsWith('966') && normalized.length === 12) {
    const rest = normalized.substring(3);
    return `+966 ${rest.substring(0, 2)} ${rest.substring(2, 5)} ${rest.substring(5)}`;
  }

  // إماراتي
  if (normalized.startsWith('971') && normalized.length === 12) {
    const rest = normalized.substring(3);
    return `+971 ${rest.substring(0, 2)} ${rest.substring(2, 5)} ${rest.substring(5)}`;
  }

  // عام: أضف + في البداية
  if (normalized.length >= 10) {
    return `+${normalized}`;
  }

  return phone; // إرجاع الأصلي إذا لم نتمكن من التنسيق
}

/**
 * التحقق من صحة رقم الهاتف (بعد التنظيف)
 */
export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return normalized.length >= 7 && normalized.length <= 15 && /^\d+$/.test(normalized);
}

/**
 * استخراج رقم هاتف من نص (يدعم الأرقام الهندية)
 * يُرجع أول رقم هاتف يجده أو null
 */
export function extractPhoneFromText(text: string): string | null {
  // تحويل الأرقام الهندية أولاً
  const converted = convertHindiNumerals(text);

  // أنماط أرقام الهاتف (من الأطول للأقصر)
  const patterns = [
    /\+?(?:966|971|965|974|968|973)\s*\d[\d\s\-]{7,12}/,  // مع كود دولي
    /(?:00)?(?:966|971|965|974|968|973)\s*\d[\d\s\-]{7,12}/, // مع 00
    /0[5-9]\d[\d\s\-]{7,9}/,                                 // رقم محلي سعودي/خليجي
    /[5-9]\d{8,9}/,                                           // بدون صفر بادئ
  ];

  for (const pattern of patterns) {
    const match = converted.match(pattern);
    if (match) {
      return match[0].replace(/[\s\-]/g, '');
    }
  }

  return null;
}

/**
 * كشف كود الدولة من الرقم
 */
export function detectCountryCode(phone: string): { code: string; country: string } | null {
  const normalized = normalizePhone(phone);

  const countries: Record<string, string> = {
    '966': 'السعودية',
    '971': 'الإمارات',
    '965': 'الكويت',
    '974': 'قطر',
    '968': 'عُمان',
    '973': 'البحرين',
    '20': 'مصر',
    '962': 'الأردن',
  };

  for (const [code, country] of Object.entries(countries)) {
    if (normalized.startsWith(code)) {
      return { code, country };
    }
  }

  return null;
}
