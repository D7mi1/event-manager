/**
 * Guest List Text Parser
 * =======================
 * يحلل نص فوضوي (من واتساب، ملاحظات، إلخ) ويستخرج بيانات الضيوف
 * يدعم:
 * - أرقام عربية (هندية): ٠٥٥١٢٣٤٥٦٧
 * - صيغ متعددة: "اسم رقم" أو "رقم اسم" أو "اسم - رقم"
 * - كشف الفئة: VIP, عائلة, أهل العرس
 * - أكواد دول الخليج
 */

import { convertHindiNumerals, normalizePhone, isValidPhone, extractPhoneFromText } from './phone';

// ============================================
// الأنواع
// ============================================

export interface ParsedGuest {
  name: string;
  phone: string;
  category: 'GENERAL' | 'VIP' | 'FAMILY';
  confidence: 'high' | 'medium' | 'low';
  rawLine: string;
  warning?: string;
}

export interface ParseResult {
  guests: ParsedGuest[];
  totalLines: number;
  parsedCount: number;
  skippedCount: number;
  warnings: string[];
}

// ============================================
// كلمات مفتاحية للفئات
// ============================================

const VIP_KEYWORDS = [
  'vip', 'VIP', 'في اي بي', 'شخصية مهمة', 'كبار',
  'مهم', 'خاص', 'ضيف شرف',
];

const FAMILY_KEYWORDS = [
  'عائلة', 'أهل', 'اهل', 'عائله', 'family', 'FAMILY',
  'أهل العرس', 'اهل العرس', 'أقارب', 'اقارب',
  'عم', 'عمة', 'خال', 'خالة', 'جد', 'جدة',
];

// ============================================
// كلمات يجب تجاهلها (ليست أسماء ضيوف)
// ============================================

const SKIP_PATTERNS = [
  /^[\s\-_=*#]+$/, // أسطر فاصلة
  /^(قائمة|ملاحظة|تنبيه|ملحوظة|إجمالي|المجموع|العدد)/,
  /^(https?:\/\/|www\.)/i, // روابط
  /^\d{1,3}[.\-)\s]$/, // أرقام ترقيم فقط (1. أو 1) أو 1-)
];

// ============================================
// المحلل الرئيسي
// ============================================

/**
 * يحلل نص فوضوي ويستخرج قائمة ضيوف
 */
export function parseGuestText(rawText: string): ParseResult {
  const warnings: string[] = [];
  const guests: ParsedGuest[] = [];

  // تقسيم بالأسطر وتنظيف
  const lines = rawText
    .split(/\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const totalLines = lines.length;
  let skippedCount = 0;

  for (const line of lines) {
    // تحويل الأرقام الهندية
    const convertedLine = convertHindiNumerals(line);

    // تجاهل الأسطر غير المفيدة
    if (shouldSkipLine(convertedLine)) {
      skippedCount++;
      continue;
    }

    const parsed = parseLine(convertedLine, line);

    if (parsed) {
      // فحص التكرار بالرقم
      const isDuplicate = guests.some(g => g.phone === parsed.phone && parsed.phone !== '');
      if (isDuplicate) {
        warnings.push(`رقم مكرر في السطر: "${line}"`);
        skippedCount++;
        continue;
      }
      guests.push(parsed);
    } else {
      skippedCount++;
      warnings.push(`لم يتم التعرف على السطر: "${line}"`);
    }
  }

  return {
    guests,
    totalLines,
    parsedCount: guests.length,
    skippedCount,
    warnings,
  };
}

// ============================================
// تحليل سطر واحد
// ============================================

function parseLine(convertedLine: string, rawLine: string): ParsedGuest | null {
  // إزالة ترقيم بداية السطر (1. أو 1) أو 1- أو ١.)
  let cleaned = convertedLine.replace(/^\d{1,3}[\.\)\-\s]+/, '').trim();

  // إزالة إيموجي
  cleaned = cleaned.replace(/[\u{1F600}-\u{1F9FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F1E0}-\u{1F1FF}]/gu, '').trim();

  // استخراج الفئة
  const category = detectCategory(cleaned);

  // إزالة كلمات الفئة من النص
  let withoutCategory = removeCategoyKeywords(cleaned);

  // استخراج رقم الهاتف
  const phone = extractPhoneFromText(withoutCategory);

  if (phone) {
    // إزالة الرقم من النص = الاسم
    const name = extractName(withoutCategory, phone);
    const normalizedPhone = normalizePhone(phone);

    if (name.length >= 2) {
      return {
        name,
        phone: normalizedPhone,
        category,
        confidence: isValidPhone(normalizedPhone) ? 'high' : 'medium',
        rawLine,
      };
    } else if (normalizedPhone) {
      // رقم بدون اسم واضح
      return {
        name: name || 'بدون اسم',
        phone: normalizedPhone,
        category,
        confidence: 'low',
        rawLine,
        warning: 'لم يُعثر على اسم واضح',
      };
    }
  }

  // لا يوجد رقم — قد يكون اسم فقط
  const trimmedName = withoutCategory.replace(/[\-,،:;|\/\\]+/g, '').trim();
  if (trimmedName.length >= 2 && /[\u0600-\u06FFa-zA-Z]/.test(trimmedName)) {
    return {
      name: trimmedName,
      phone: '',
      category,
      confidence: 'low',
      rawLine,
      warning: 'لم يُعثر على رقم هاتف',
    };
  }

  return null;
}

// ============================================
// دوال مساعدة
// ============================================

function shouldSkipLine(line: string): boolean {
  if (line.length < 2) return true;
  return SKIP_PATTERNS.some(pattern => pattern.test(line));
}

function detectCategory(text: string): 'GENERAL' | 'VIP' | 'FAMILY' {
  const lower = text.toLowerCase();

  if (VIP_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()))) {
    return 'VIP';
  }

  if (FAMILY_KEYWORDS.some(kw => text.includes(kw))) {
    return 'FAMILY';
  }

  return 'GENERAL';
}

function removeCategoyKeywords(text: string): string {
  let result = text;
  [...VIP_KEYWORDS, ...FAMILY_KEYWORDS].forEach(kw => {
    result = result.replace(new RegExp(kw, 'gi'), '');
  });
  return result.trim();
}

function extractName(text: string, phone: string): string {
  // إزالة رقم الهاتف من النص
  let name = text;

  // إزالة الرقم (مع/بدون كود الدولة والمسافات)
  const phonePattern = phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  name = name.replace(new RegExp(phonePattern), '');

  // إزالة أنماط أرقام هاتف أخرى قد تبقى
  name = name.replace(/\+?\d[\d\s\-]{6,14}/g, '');

  // تنظيف الفواصل والرموز المتبقية
  name = name.replace(/[\-,،:;|\/\\()]+/g, ' ');
  name = name.replace(/\s+/g, ' ').trim();

  return name;
}
