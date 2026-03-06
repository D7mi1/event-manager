/**
 * Schedule Checker — فحص تعارض التواريخ
 * ========================================
 * يتحقق من تعارض تاريخ الفعالية مع المناسبات والعطل
 * يدعم: رمضان، العيدين، اليوم الوطني، يوم التأسيس
 */

// ============================================
// الأنواع
// ============================================

export interface DateWarning {
  type: 'holiday' | 'religious' | 'national' | 'weekend' | 'info';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

export interface DateCheckResult {
  date: Date;
  warnings: DateWarning[];
  isGoodDate: boolean;
}

// ============================================
// قاعدة بيانات المناسبات (2024-2027)
// ============================================

interface KnownEvent {
  name: string;
  type: DateWarning['type'];
  severity: DateWarning['severity'];
  description: string;
}

// التواريخ بصيغة YYYY-MM-DD
// ملاحظة: تواريخ المناسبات الهجرية تقريبية — قد تختلف يوم أو يومين
const KNOWN_EVENTS: Record<string, KnownEvent> = {
  // ============ 2025 ============
  // رمضان 2025 (تقريباً 1-29 مارس)
  ...generateDateRange('2025-03-01', '2025-03-29', {
    name: 'شهر رمضان', type: 'religious', severity: 'high',
    description: 'معظم المناسبات والحفلات لا تُقام في رمضان',
  }),
  // عيد الفطر 2025
  ...generateDateRange('2025-03-30', '2025-04-02', {
    name: 'عيد الفطر', type: 'holiday', severity: 'medium',
    description: 'إجازة رسمية — قد يؤثر على الحضور',
  }),
  // عيد الأضحى 2025
  ...generateDateRange('2025-06-06', '2025-06-11', {
    name: 'عيد الأضحى', type: 'holiday', severity: 'medium',
    description: 'إجازة رسمية — قد يؤثر على الحضور',
  }),
  // اليوم الوطني 2025
  '2025-09-23': {
    name: 'اليوم الوطني السعودي', type: 'national', severity: 'low',
    description: 'إجازة رسمية — يمكن الاستفادة منها لفعالية وطنية',
  },
  // يوم التأسيس 2025
  '2025-02-22': {
    name: 'يوم التأسيس', type: 'national', severity: 'low',
    description: 'إجازة رسمية — يوم التأسيس السعودي',
  },

  // ============ 2026 ============
  // رمضان 2026 (تقريباً 18 فبراير - 19 مارس)
  ...generateDateRange('2026-02-18', '2026-03-19', {
    name: 'شهر رمضان', type: 'religious', severity: 'high',
    description: 'معظم المناسبات والحفلات لا تُقام في رمضان',
  }),
  // عيد الفطر 2026
  ...generateDateRange('2026-03-20', '2026-03-23', {
    name: 'عيد الفطر', type: 'holiday', severity: 'medium',
    description: 'إجازة رسمية — قد يؤثر على الحضور',
  }),
  // عيد الأضحى 2026
  ...generateDateRange('2026-05-27', '2026-06-01', {
    name: 'عيد الأضحى', type: 'holiday', severity: 'medium',
    description: 'إجازة رسمية — قد يؤثر على الحضور',
  }),
  // اليوم الوطني 2026
  '2026-09-23': {
    name: 'اليوم الوطني السعودي', type: 'national', severity: 'low',
    description: 'إجازة رسمية',
  },
  '2026-02-22': {
    name: 'يوم التأسيس', type: 'national', severity: 'low',
    description: 'إجازة رسمية — يوم التأسيس السعودي',
  },

  // ============ 2027 ============
  // رمضان 2027 (تقريباً 8 فبراير - 8 مارس)
  ...generateDateRange('2027-02-08', '2027-03-08', {
    name: 'شهر رمضان', type: 'religious', severity: 'high',
    description: 'معظم المناسبات والحفلات لا تُقام في رمضان',
  }),
  '2027-09-23': {
    name: 'اليوم الوطني السعودي', type: 'national', severity: 'low',
    description: 'إجازة رسمية',
  },
  '2027-02-22': {
    name: 'يوم التأسيس', type: 'national', severity: 'low',
    description: 'إجازة رسمية',
  },
};

// ============================================
// الدالة الرئيسية
// ============================================

/**
 * يفحص تاريخ ويرجع التحذيرات (إن وجدت)
 */
export function checkDateConflicts(date: Date | string): DateCheckResult {
  const d = typeof date === 'string' ? new Date(date) : date;
  const warnings: DateWarning[] = [];

  // 1. فحص المناسبات المعروفة
  const key = formatDateKey(d);
  const knownEvent = KNOWN_EVENTS[key];
  if (knownEvent) {
    warnings.push({
      type: knownEvent.type,
      severity: knownEvent.severity,
      title: knownEvent.name,
      description: knownEvent.description,
    });
  }

  // 2. فحص عطلة نهاية الأسبوع (الجمعة والسبت في السعودية)
  const dayOfWeek = d.getDay();
  if (dayOfWeek === 5) { // الجمعة
    warnings.push({
      type: 'weekend',
      severity: 'low',
      title: 'يوم الجمعة',
      description: 'عطلة نهاية الأسبوع — مناسب لحفلات الزواج والمناسبات الاجتماعية',
    });
  } else if (dayOfWeek === 6) { // السبت
    warnings.push({
      type: 'weekend',
      severity: 'low',
      title: 'يوم السبت',
      description: 'عطلة نهاية الأسبوع — مناسب للمناسبات الاجتماعية',
    });
  }

  // 3. فحص إذا كان التاريخ في الماضي
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d < today) {
    warnings.push({
      type: 'info',
      severity: 'high',
      title: 'تاريخ في الماضي',
      description: 'هذا التاريخ قد مضى',
    });
  }

  return {
    date: d,
    warnings,
    isGoodDate: !warnings.some((w) => w.severity === 'high'),
  };
}

// ============================================
// دوال مساعدة
// ============================================

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function generateDateRange(
  start: string,
  end: string,
  event: KnownEvent
): Record<string, KnownEvent> {
  const result: Record<string, KnownEvent> = {};
  const startDate = new Date(start);
  const endDate = new Date(end);

  const current = new Date(startDate);
  while (current <= endDate) {
    result[formatDateKey(current)] = event;
    current.setDate(current.getDate() + 1);
  }

  return result;
}

/**
 * يرجع أيقونة التحذير حسب النوع
 */
export function getWarningEmoji(type: DateWarning['type']): string {
  switch (type) {
    case 'religious': return '🌙';
    case 'holiday': return '🎉';
    case 'national': return '🇸🇦';
    case 'weekend': return '📅';
    case 'info': return 'ℹ️';
    default: return '⚠️';
  }
}
