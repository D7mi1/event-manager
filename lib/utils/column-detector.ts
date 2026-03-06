/**
 * Column Detector — كاشف الأعمدة التلقائي
 * ==========================================
 * يكتشف تلقائياً أعمدة ملفات Excel/CSV بناءً على الكلمات المفتاحية
 * يدعم عناوين عربية وإنجليزية
 */

// ============================================
// الأنواع
// ============================================

export type ColumnType = 'name' | 'phone' | 'category' | 'email' | 'notes';

export interface ColumnMapping {
  name: number | null;
  phone: number | null;
  category: number | null;
  email: number | null;
  notes: number | null;
}

export interface DetectionResult {
  mapping: ColumnMapping;
  confidence: 'high' | 'medium' | 'low';
  unmappedColumns: number[];
  suggestions: string[];
}

// ============================================
// كلمات مفتاحية لكل نوع عمود
// ============================================

const COLUMN_KEYWORDS: Record<ColumnType, string[]> = {
  name: [
    // عربي
    'الاسم', 'اسم', 'الإسم', 'إسم', 'اسم الضيف', 'اسم المدعو',
    'الاسم الكامل', 'اسم كامل', 'المدعو', 'الضيف',
    // إنجليزي
    'name', 'full name', 'fullname', 'guest name', 'guest',
    'first name', 'firstname', 'الأسم',
  ],
  phone: [
    // عربي
    'الجوال', 'جوال', 'الهاتف', 'هاتف', 'رقم', 'رقم الجوال',
    'رقم الهاتف', 'موبايل', 'الموبايل', 'تلفون', 'التلفون',
    'رقم التواصل', 'جوّال', 'الجوّال',
    // إنجليزي
    'phone', 'mobile', 'cell', 'telephone', 'tel',
    'phone number', 'mobile number', 'contact',
  ],
  category: [
    // عربي
    'الفئة', 'فئة', 'النوع', 'نوع', 'التصنيف', 'تصنيف',
    'المجموعة', 'مجموعة', 'القسم',
    // إنجليزي
    'category', 'type', 'group', 'class', 'tier', 'level',
  ],
  email: [
    // عربي
    'البريد', 'بريد', 'إيميل', 'ايميل', 'البريد الإلكتروني',
    // إنجليزي
    'email', 'e-mail', 'mail',
  ],
  notes: [
    // عربي
    'ملاحظات', 'ملاحظة', 'تعليق', 'تعليقات', 'مذكرة',
    // إنجليزي
    'notes', 'note', 'comment', 'comments', 'remarks',
  ],
};

// ============================================
// الدالة الرئيسية
// ============================================

/**
 * يكتشف تلقائياً أعمدة الملف بناءً على عناوين الأعمدة
 * @param headers - عناوين الأعمدة (الصف الأول من الملف)
 * @returns نتيجة الكشف مع درجة الثقة
 */
export function detectColumns(headers: string[]): DetectionResult {
  const mapping: ColumnMapping = {
    name: null,
    phone: null,
    category: null,
    email: null,
    notes: null,
  };

  const usedIndices = new Set<number>();
  const suggestions: string[] = [];

  // تنظيف العناوين
  const cleanHeaders = headers.map((h) =>
    (h || '').toString().trim().toLowerCase()
  );

  // البحث عن تطابق لكل نوع عمود
  const columnTypes: ColumnType[] = ['name', 'phone', 'category', 'email', 'notes'];

  for (const type of columnTypes) {
    const keywords = COLUMN_KEYWORDS[type];
    let bestMatch = -1;
    let bestScore = 0;

    for (let i = 0; i < cleanHeaders.length; i++) {
      if (usedIndices.has(i)) continue;

      const header = cleanHeaders[i];
      if (!header) continue;

      for (const keyword of keywords) {
        const lowerKeyword = keyword.toLowerCase();

        // تطابق تام
        if (header === lowerKeyword) {
          if (bestScore < 3) {
            bestScore = 3;
            bestMatch = i;
          }
          break;
        }

        // يحتوي على الكلمة المفتاحية
        if (header.includes(lowerKeyword) || lowerKeyword.includes(header)) {
          if (bestScore < 2) {
            bestScore = 2;
            bestMatch = i;
          }
        }
      }
    }

    if (bestMatch >= 0) {
      mapping[type] = bestMatch;
      usedIndices.add(bestMatch);
    }
  }

  // حساب درجة الثقة
  const hasName = mapping.name !== null;
  const hasPhone = mapping.phone !== null;

  let confidence: 'high' | 'medium' | 'low';

  if (hasName && hasPhone) {
    confidence = 'high';
  } else if (hasName || hasPhone) {
    confidence = 'medium';
    if (!hasName) suggestions.push('لم يتم التعرف على عمود الاسم — حدده يدوياً');
    if (!hasPhone) suggestions.push('لم يتم التعرف على عمود الجوال — حدده يدوياً');
  } else {
    confidence = 'low';
    suggestions.push('لم يتم التعرف على الأعمدة — يرجى تحديدها يدوياً');
  }

  // الأعمدة غير المربوطة
  const unmappedColumns = cleanHeaders
    .map((_, i) => i)
    .filter((i) => !usedIndices.has(i) && cleanHeaders[i]);

  return {
    mapping,
    confidence,
    unmappedColumns,
    suggestions,
  };
}

/**
 * يحاول تخمين نوع العمود من البيانات (لا العناوين)
 * يُستخدم كـ fallback عندما يفشل الكشف بالعناوين
 */
export function guessColumnFromData(
  columnData: string[]
): ColumnType | null {
  if (columnData.length === 0) return null;

  // أخذ عينة (أول 10 قيم غير فارغة)
  const sample = columnData
    .filter((v) => v && v.trim())
    .slice(0, 10);

  if (sample.length === 0) return null;

  // فحص إذا كانت أرقام هاتف
  const phonePattern = /^[\+]?[\d\s\-\(\)٠-٩]{7,15}$/;
  const phoneCount = sample.filter((v) => phonePattern.test(v.trim())).length;
  if (phoneCount >= sample.length * 0.6) return 'phone';

  // فحص إذا كانت إيميلات
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailCount = sample.filter((v) => emailPattern.test(v.trim())).length;
  if (emailCount >= sample.length * 0.6) return 'email';

  // فحص إذا كانت فئات
  const categories = ['vip', 'family', 'general', 'عائلة', 'عام'];
  const catCount = sample.filter((v) =>
    categories.includes(v.trim().toLowerCase())
  ).length;
  if (catCount >= sample.length * 0.5) return 'category';

  // فحص إذا كانت أسماء (نص عربي أو إنجليزي)
  const namePattern = /^[\u0600-\u06FFa-zA-Z\s]{2,50}$/;
  const nameCount = sample.filter((v) => namePattern.test(v.trim())).length;
  if (nameCount >= sample.length * 0.6) return 'name';

  return null;
}

/**
 * يرجع اسم العمود بالعربي
 */
export function getColumnLabel(type: ColumnType): string {
  const labels: Record<ColumnType, string> = {
    name: 'الاسم',
    phone: 'الجوال',
    category: 'الفئة',
    email: 'البريد',
    notes: 'ملاحظات',
  };
  return labels[type];
}
