/**
 * Analytics Predictions — توقعات الحضور
 * =======================================
 * يتوقع نسبة الحضور بناءً على نوع الفعالية وعدد المدعوين
 * يقترح أعداد الوجبات والكراسي
 */

// ============================================
// الأنواع
// ============================================

export interface PredictionResult {
  expectedAttendance: number;
  attendanceRate: number;        // نسبة مئوية
  range: { min: number; max: number };
  suggestions: PredictionSuggestion[];
  confidence: 'high' | 'medium' | 'low';
}

export interface PredictionSuggestion {
  icon: string;
  label: string;
  value: string;
  description?: string;
}

// ============================================
// معدلات الحضور حسب نوع الفعالية
// ============================================

interface AttendanceProfile {
  baseRate: number;     // النسبة الأساسية
  deviation: number;    // الانحراف (±)
  vipRate: number;      // نسبة حضور VIP
  familyRate: number;   // نسبة حضور العائلة
}

const ATTENDANCE_PROFILES: Record<string, AttendanceProfile> = {
  // مناسبات اجتماعية
  wedding:      { baseRate: 0.80, deviation: 0.05, vipRate: 0.90, familyRate: 0.95 },
  graduation:   { baseRate: 0.70, deviation: 0.10, vipRate: 0.85, familyRate: 0.90 },
  social:       { baseRate: 0.65, deviation: 0.10, vipRate: 0.80, familyRate: 0.85 },
  dinner:       { baseRate: 0.75, deviation: 0.08, vipRate: 0.88, familyRate: 0.92 },

  // فعاليات أعمال
  conference:   { baseRate: 0.65, deviation: 0.10, vipRate: 0.85, familyRate: 0.70 },
  workshop:     { baseRate: 0.55, deviation: 0.12, vipRate: 0.75, familyRate: 0.60 },
  seminar:      { baseRate: 0.60, deviation: 0.10, vipRate: 0.80, familyRate: 0.65 },
  exhibition:   { baseRate: 0.50, deviation: 0.15, vipRate: 0.70, familyRate: 0.55 },
  business:     { baseRate: 0.60, deviation: 0.10, vipRate: 0.80, familyRate: 0.65 },

  // افتراضي
  default:      { baseRate: 0.65, deviation: 0.10, vipRate: 0.80, familyRate: 0.80 },
};

// ============================================
// الدالة الرئيسية
// ============================================

/**
 * يتوقع نسبة الحضور ويقدم اقتراحات
 */
export function predictAttendance(params: {
  totalGuests: number;
  eventType?: string;
  guestBreakdown?: { general: number; vip: number; family: number };
}): PredictionResult {
  const { totalGuests, eventType, guestBreakdown } = params;

  if (totalGuests <= 0) {
    return {
      expectedAttendance: 0,
      attendanceRate: 0,
      range: { min: 0, max: 0 },
      suggestions: [],
      confidence: 'low',
    };
  }

  // البحث عن الملف الشخصي المناسب
  const profile = findProfile(eventType);

  let expectedAttendance: number;
  let attendanceRate: number;

  if (guestBreakdown) {
    // حساب دقيق بناءً على الفئات
    const generalAttendees = guestBreakdown.general * profile.baseRate;
    const vipAttendees = guestBreakdown.vip * profile.vipRate;
    const familyAttendees = guestBreakdown.family * profile.familyRate;

    expectedAttendance = Math.round(generalAttendees + vipAttendees + familyAttendees);
    attendanceRate = totalGuests > 0 ? expectedAttendance / totalGuests : 0;
  } else {
    // حساب تقريبي
    attendanceRate = profile.baseRate;
    expectedAttendance = Math.round(totalGuests * attendanceRate);
  }

  // حساب النطاق
  const range = {
    min: Math.round(totalGuests * (attendanceRate - profile.deviation)),
    max: Math.round(totalGuests * (attendanceRate + profile.deviation)),
  };

  // ضمان حدود معقولة
  range.min = Math.max(0, range.min);
  range.max = Math.min(totalGuests, range.max);

  // الاقتراحات
  const suggestions = generateSuggestions(expectedAttendance, range, eventType);

  // درجة الثقة
  let confidence: 'high' | 'medium' | 'low';
  if (guestBreakdown && totalGuests >= 20) {
    confidence = 'high';
  } else if (totalGuests >= 10) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    expectedAttendance,
    attendanceRate: Math.round(attendanceRate * 100),
    range,
    suggestions,
    confidence,
  };
}

// ============================================
// دوال مساعدة
// ============================================

function findProfile(eventType?: string): AttendanceProfile {
  if (!eventType) return ATTENDANCE_PROFILES.default;

  const t = eventType.toLowerCase();

  // بحث بالكلمات المفتاحية
  const keywords: Record<string, string[]> = {
    wedding: ['wedding', 'زواج', 'زفاف', 'عرس', 'ملكة'],
    graduation: ['graduation', 'تخرج', 'تخرّج'],
    dinner: ['dinner', 'عشاء', 'عزيمة', 'غداء'],
    social: ['social', 'حفلة', 'عيد', 'استقبال', 'مولود'],
    conference: ['conference', 'مؤتمر'],
    workshop: ['workshop', 'ورشة'],
    seminar: ['seminar', 'ندوة', 'محاضرة'],
    exhibition: ['exhibition', 'معرض'],
  };

  for (const [key, words] of Object.entries(keywords)) {
    if (words.some((w) => t.includes(w))) {
      return ATTENDANCE_PROFILES[key] || ATTENDANCE_PROFILES.default;
    }
  }

  return ATTENDANCE_PROFILES.default;
}

function generateSuggestions(
  expected: number,
  range: { min: number; max: number },
  eventType?: string
): PredictionSuggestion[] {
  const suggestions: PredictionSuggestion[] = [];

  // عدد الوجبات المقترح (احتياط 10%)
  const mealCount = Math.ceil(expected * 1.10);
  suggestions.push({
    icon: '🍽️',
    label: 'الوجبات المقترحة',
    value: `${mealCount} وجبة`,
    description: `احتياط 10% فوق المتوقع (${expected})`,
  });

  // عدد الكراسي
  const chairCount = Math.ceil(expected * 1.05);
  suggestions.push({
    icon: '🪑',
    label: 'الكراسي المطلوبة',
    value: `${chairCount} كرسي`,
    description: 'احتياط 5% للتغييرات',
  });

  // عدد مواقف السيارات (1 موقف لكل 2-3 ضيوف)
  const parkingCount = Math.ceil(expected / 2.5);
  suggestions.push({
    icon: '🅿️',
    label: 'مواقف السيارات',
    value: `${parkingCount} موقف تقريباً`,
  });

  // اقتراحات خاصة بنوع الفعالية
  const category = eventType?.toLowerCase() || '';
  if (['wedding', 'زواج', 'زفاف', 'عرس'].some((k) => category.includes(k))) {
    suggestions.push({
      icon: '🎂',
      label: 'كيك/حلويات',
      value: `${Math.ceil(expected * 1.15)} قطعة`,
      description: 'احتياط 15% — الحلويات تنفد سريعاً',
    });
  }

  if (['conference', 'مؤتمر', 'workshop', 'ورشة'].some((k) => category.includes(k))) {
    suggestions.push({
      icon: '📋',
      label: 'المطبوعات',
      value: `${Math.ceil(expected * 1.20)} نسخة`,
      description: 'احتياط 20% للتوزيع الإضافي',
    });
  }

  return suggestions;
}
