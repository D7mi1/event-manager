/**
 * نظام الخطط والاشتراكات - Billing Plans
 * ==========================================
 * يحدد الخطط المتاحة وحدودها
 * يشمل: اشتراكات شهرية/سنوية + باقات فعالية واحدة + إضافات
 * مربوط مع Polar.sh كـ Merchant of Record
 */

// ==========================================
// الأنواع الأساسية
// ==========================================

export type PlanId = 'free' | 'starter' | 'pro' | 'enterprise';
export type BillingInterval = 'monthly' | 'yearly';
export type EventPackageId = 'event_small' | 'event_medium' | 'event_large';
export type AddonId = 'whatsapp_extra' | 'ai_extra' | 'guests_extra' | 'priority_support';

export interface PlanLimit {
  maxEvents: number;
  maxGuestsPerEvent: number;
  maxTemplates: number;
  maxTeamMembers: number;
  aiGenerations: number;
  whatsappMessages: number;
  customBranding: boolean;
  prioritySupport: boolean;
  analytics: boolean;
  seatMap: boolean;
  exportExcel: boolean;
  certificates: boolean;
  survey: boolean;
  walletPass: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  nameAr: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  limits: PlanLimit;
  popular?: boolean;
  features: string[];
}

export interface EventPackage {
  id: EventPackageId;
  name: string;
  nameAr: string;
  description: string;
  price: number;
  maxGuests: number;
  validDays: number;
  features: string[];
}

export interface Addon {
  id: AddonId;
  nameAr: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
}

// ==========================================
// الاشتراكات الشهرية / السنوية
// ==========================================

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    nameAr: 'المجانية',
    description: 'للتجربة والفعاليات الصغيرة',
    price: { monthly: 0, yearly: 0 },
    limits: {
      maxEvents: 1,
      maxGuestsPerEvent: 50,
      maxTemplates: 2,
      maxTeamMembers: 0,
      aiGenerations: 5,
      whatsappMessages: 20,
      customBranding: false,
      prioritySupport: false,
      analytics: false,
      seatMap: false,
      exportExcel: false,
      certificates: false,
      survey: false,
      walletPass: false,
    },
    features: [
      'فعالية واحدة نشطة',
      'حتى 50 ضيف',
      'ماسح QR ذكي',
      'تصميم تذكرة واحد',
      'شعار مِراس على التذكرة',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    nameAr: 'الأساسية',
    description: 'للمنظمين المستقلين والفعاليات المتوسطة',
    price: { monthly: 79, yearly: 790 },
    limits: {
      maxEvents: 5,
      maxGuestsPerEvent: 300,
      maxTemplates: 5,
      maxTeamMembers: 2,
      aiGenerations: 30,
      whatsappMessages: 200,
      customBranding: true,
      prioritySupport: false,
      analytics: true,
      seatMap: false,
      exportExcel: true,
      certificates: false,
      survey: false,
      walletPass: false,
    },
    features: [
      '5 فعاليات نشطة',
      'حتى 300 ضيف / فعالية',
      '5 تصاميم تذاكر',
      '200 رسالة واتساب / شهر',
      'تحليلات وإحصائيات',
      'تصدير Excel',
      'بدون شعار مِراس',
      'عضوين في الفريق',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    nameAr: 'الاحترافية',
    description: 'للشركات والفعاليات الكبيرة',
    price: { monthly: 199, yearly: 1990 },
    popular: true,
    limits: {
      maxEvents: 20,
      maxGuestsPerEvent: 2000,
      maxTemplates: Infinity,
      maxTeamMembers: 10,
      aiGenerations: 200,
      whatsappMessages: 1000,
      customBranding: true,
      prioritySupport: true,
      analytics: true,
      seatMap: true,
      exportExcel: true,
      certificates: true,
      survey: true,
      walletPass: true,
    },
    features: [
      '20 فعالية نشطة',
      'حتى 2,000 ضيف / فعالية',
      'تصاميم لا محدودة',
      '1,000 رسالة واتساب / شهر',
      'فريق عمل (10 أعضاء)',
      'خريطة مقاعد',
      'تصميم بالذكاء الاصطناعي',
      'شهادات حضور PDF',
      'استبيان بعد الفعالية',
      'Apple/Google Wallet',
      'دعم أولوية',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    nameAr: 'المؤسسات',
    description: 'للجهات الحكومية والشركات الكبرى',
    price: { monthly: 0, yearly: 0 },
    limits: {
      maxEvents: Infinity,
      maxGuestsPerEvent: Infinity,
      maxTemplates: Infinity,
      maxTeamMembers: Infinity,
      aiGenerations: Infinity,
      whatsappMessages: Infinity,
      customBranding: true,
      prioritySupport: true,
      analytics: true,
      seatMap: true,
      exportExcel: true,
      certificates: true,
      survey: true,
      walletPass: true,
    },
    features: [
      'كل شيء لا محدود',
      'API مخصص',
      'مدير حساب مخصص',
      'SLA ودعم 24/7',
      'تكامل مع أنظمة الشركة',
      'تدريب الفريق',
      'فواتير شهرية',
    ],
  },
};

// ==========================================
// باقات الفعالية الواحدة (Per-Event)
// ==========================================

export const EVENT_PACKAGES: Record<EventPackageId, EventPackage> = {
  event_small: {
    id: 'event_small',
    name: 'Small Event',
    nameAr: 'فعالية صغيرة',
    description: 'حفلات خاصة، تخرج، عزايم',
    price: 149,
    maxGuests: 100,
    validDays: 60,
    features: [
      'حتى 100 ضيف',
      'ماسح QR',
      'تصميم تذكرة',
      'رسائل واتساب (50)',
      'صلاحية 60 يوم',
    ],
  },
  event_medium: {
    id: 'event_medium',
    name: 'Medium Event',
    nameAr: 'فعالية متوسطة',
    description: 'مؤتمرات، ورش عمل، معارض',
    price: 299,
    maxGuests: 500,
    validDays: 60,
    features: [
      'حتى 500 ضيف',
      'ماسح QR + فريق (3 مشرفين)',
      '3 تصاميم تذاكر',
      'رسائل واتساب (200)',
      'تحليلات وإحصائيات',
      'تصدير Excel',
      'صلاحية 60 يوم',
    ],
  },
  event_large: {
    id: 'event_large',
    name: 'Large Event',
    nameAr: 'فعالية كبيرة',
    description: 'مؤتمرات كبرى، حفلات زواج فاخرة',
    price: 599,
    maxGuests: 2000,
    validDays: 90,
    features: [
      'حتى 2,000 ضيف',
      'ماسح QR + فريق (10 مشرفين)',
      'تصاميم لا محدودة',
      'رسائل واتساب (500)',
      'خريطة مقاعد',
      'تحليلات متقدمة',
      'تصدير Excel',
      'شهادات حضور',
      'هوية بصرية مخصصة',
      'صلاحية 90 يوم',
    ],
  },
};

// ==========================================
// الإضافات (Add-ons)
// ==========================================

export const ADDONS: Record<AddonId, Addon> = {
  whatsapp_extra: {
    id: 'whatsapp_extra',
    nameAr: 'رسائل واتساب إضافية',
    description: '100 رسالة واتساب إضافية',
    price: 29,
    unit: 'رسالة',
    quantity: 100,
  },
  ai_extra: {
    id: 'ai_extra',
    nameAr: 'تصميم AI إضافي',
    description: '50 عملية توليد بالذكاء الاصطناعي',
    price: 19,
    unit: 'تصميم',
    quantity: 50,
  },
  guests_extra: {
    id: 'guests_extra',
    nameAr: 'ضيوف إضافيين',
    description: '500 ضيف إضافي لفعاليتك',
    price: 39,
    unit: 'ضيف',
    quantity: 500,
  },
  priority_support: {
    id: 'priority_support',
    nameAr: 'دعم أولوية',
    description: 'رد خلال ساعة واحدة + قناة واتساب مباشرة',
    price: 49,
    unit: 'شهر',
    quantity: 1,
  },
};

// ==========================================
// الدوال المساعدة
// ==========================================

export function getPlanLimits(planId: PlanId): PlanLimit {
  return PLANS[planId]?.limits ?? PLANS.free.limits;
}

export function isLimitExceeded(
  planId: PlanId,
  limitKey: keyof PlanLimit,
  currentUsage: number
): boolean {
  const limit = PLANS[planId]?.limits[limitKey];
  if (typeof limit === 'boolean') return false;
  return currentUsage >= (limit as number);
}

export function getPlanPrice(planId: PlanId, interval: BillingInterval): number {
  const plan = PLANS[planId];
  if (!plan) return 0;
  return interval === 'yearly' ? plan.price.yearly : plan.price.monthly;
}

export function getYearlySavings(planId: PlanId): number {
  const plan = PLANS[planId];
  if (!plan || plan.price.monthly === 0) return 0;
  const yearlyIfMonthly = plan.price.monthly * 12;
  return Math.round(((yearlyIfMonthly - plan.price.yearly) / yearlyIfMonthly) * 100);
}

export function getAllPlans(): Plan[] {
  return Object.values(PLANS);
}

export function getAllEventPackages(): EventPackage[] {
  return Object.values(EVENT_PACKAGES);
}

export function getAllAddons(): Addon[] {
  return Object.values(ADDONS);
}
