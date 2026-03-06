/**
 * vCard Parser — محلل ملفات جهات الاتصال
 * =========================================
 * يحلل ملفات .vcf (vCard 2.1/3.0/4.0) ويستخرج الأسماء والأرقام
 * يدعم: ملفات تصدير iOS، Android، Google Contacts
 */

import { normalizePhone, isValidPhone } from './phone';

// ============================================
// الأنواع
// ============================================

export interface ParsedContact {
  name: string;
  phones: string[];          // أرقام متعددة ممكنة لنفس الشخص
  primaryPhone: string;      // الرقم الأول بعد التنظيف
  email?: string;
  organization?: string;
  selected: boolean;
}

export interface VCardParseResult {
  contacts: ParsedContact[];
  totalCards: number;
  validCount: number;
  skippedCount: number;
  warnings: string[];
}

// ============================================
// المحلل الرئيسي
// ============================================

/**
 * يحلل محتوى ملف .vcf ويستخرج جهات الاتصال
 */
export function parseVCardFile(vcfContent: string): VCardParseResult {
  const warnings: string[] = [];
  const contacts: ParsedContact[] = [];

  // تقسيم الملف إلى بطاقات فردية
  const cards = splitVCards(vcfContent);
  const totalCards = cards.length;
  let skippedCount = 0;

  for (const card of cards) {
    const parsed = parseOneVCard(card);

    if (parsed) {
      // فحص التكرار
      const isDuplicate = contacts.some(
        (c) => c.primaryPhone && c.primaryPhone === parsed.primaryPhone
      );

      if (isDuplicate) {
        warnings.push(`رقم مكرر: ${parsed.name} (${parsed.primaryPhone})`);
        skippedCount++;
        continue;
      }

      contacts.push(parsed);
    } else {
      skippedCount++;
    }
  }

  return {
    contacts,
    totalCards,
    validCount: contacts.length,
    skippedCount,
    warnings,
  };
}

// ============================================
// تقسيم الملف إلى بطاقات
// ============================================

function splitVCards(content: string): string[] {
  const cards: string[] = [];

  // تنظيف الأسطر المتتابعة (line folding في vCard)
  // vCard يتبع RFC 6350: الأسطر الطويلة تُقسم بـ \n + space/tab
  const unfolded = content.replace(/\r\n[\t ]/g, '').replace(/\n[\t ]/g, '');

  // تقسيم بـ BEGIN:VCARD / END:VCARD
  const regex = /BEGIN:VCARD[\s\S]*?END:VCARD/gi;
  let match;

  while ((match = regex.exec(unfolded)) !== null) {
    cards.push(match[0]);
  }

  return cards;
}

// ============================================
// تحليل بطاقة واحدة
// ============================================

function parseOneVCard(card: string): ParsedContact | null {
  const lines = card.split(/\r?\n/).filter((l) => l.trim());

  let name = '';
  const phones: string[] = [];
  let email = '';
  let organization = '';

  for (const line of lines) {
    // استخراج الاسم (FN = Full Name)
    if (/^FN[;:]/.test(line)) {
      name = extractValue(line);
    }

    // استخراج الاسم المنظم (N = Name) كـ fallback
    if (/^N[;:]/.test(line) && !name) {
      const parts = extractValue(line).split(';');
      // N format: LastName;FirstName;MiddleName;Prefix;Suffix
      const lastName = parts[0] || '';
      const firstName = parts[1] || '';
      name = `${firstName} ${lastName}`.trim();
    }

    // استخراج أرقام الهاتف (TEL)
    if (/^TEL[;:]/.test(line)) {
      const phone = extractPhone(line);
      if (phone) {
        phones.push(phone);
      }
    }

    // استخراج البريد الإلكتروني
    if (/^EMAIL[;:]/.test(line)) {
      email = extractValue(line);
    }

    // استخراج المنظمة
    if (/^ORG[;:]/.test(line)) {
      organization = extractValue(line).replace(/;/g, ' - ').trim();
    }
  }

  // تجاهل البطاقات بدون اسم
  if (!name || name.length < 2) return null;

  // تنظيف الأرقام
  const normalizedPhones = phones
    .map((p) => normalizePhone(p))
    .filter((p) => p.length >= 7);

  // إزالة الأرقام المكررة لنفس الشخص
  const uniquePhones = [...new Set(normalizedPhones)];

  const primaryPhone = uniquePhones[0] || '';

  return {
    name: cleanVCardName(name),
    phones: uniquePhones,
    primaryPhone,
    email: email || undefined,
    organization: organization || undefined,
    selected: primaryPhone !== '' && isValidPhone(primaryPhone),
  };
}

// ============================================
// دوال مساعدة
// ============================================

/**
 * يستخرج القيمة من سطر vCard
 * مثال: "FN;CHARSET=UTF-8:محمد أحمد" → "محمد أحمد"
 */
function extractValue(line: string): string {
  // البحث عن أول : ليست جزء من معامل
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return '';

  let value = line.substring(colonIndex + 1).trim();

  // فك ترميز Quoted-Printable
  if (/ENCODING=QUOTED-PRINTABLE/i.test(line)) {
    value = decodeQuotedPrintable(value);
  }

  // فك ترميز Base64 (نادر للأسماء)
  if (/ENCODING=BASE64/i.test(line) || /ENCODING=b/i.test(line)) {
    try {
      value = atob(value);
    } catch {
      // تجاهل أخطاء base64
    }
  }

  return value.replace(/\\n/g, ' ').replace(/\\,/g, ',').replace(/\\;/g, ';').trim();
}

/**
 * يستخرج رقم الهاتف من سطر TEL
 */
function extractPhone(line: string): string {
  const value = extractValue(line);

  // إزالة tel: scheme
  let phone = value.replace(/^tel:/i, '');

  // إزالة كل شيء ما عدا الأرقام و +
  phone = phone.replace(/[^\d+٠-٩]/g, '');

  return phone;
}

/**
 * ينظف اسم vCard من رموز زائدة
 */
function cleanVCardName(name: string): string {
  return name
    .replace(/\\n/g, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * يفك ترميز Quoted-Printable
 * (يُستخدم في vCard 2.1 للأسماء العربية)
 */
function decodeQuotedPrintable(str: string): string {
  // إزالة = في نهاية الأسطر (soft line break)
  let result = str.replace(/=\r?\n/g, '');

  // فك ترميز =XX (hex)
  result = result.replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  // محاولة فك ترميز UTF-8 يدوياً
  try {
    const bytes = new Uint8Array(
      result.split('').map((c) => c.charCodeAt(0))
    );
    result = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch {
    // إذا فشل، نرجع النص كما هو
  }

  return result;
}
