/**
 * Rate Limiter - تحديد معدل الطلبات
 * =====================================
 * يحمي API routes من الاستخدام المفرط
 * يعمل بنمط Sliding Window في الذاكرة
 */

interface RateLimitRecord {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  /** عدد الطلبات المسموحة */
  maxRequests: number;
  /** فترة النافذة بالثواني */
  windowSeconds: number;
}

/** إعدادات مسبقة حسب نوع الـ route */
export const RATE_LIMITS = {
  /** AI routes - مكلفة، تحتاج تحديد صارم */
  ai: { maxRequests: 10, windowSeconds: 60 } as RateLimitConfig,
  /** Auth routes - حماية من brute force */
  auth: { maxRequests: 5, windowSeconds: 60 } as RateLimitConfig,
  /** API عامة */
  api: { maxRequests: 30, windowSeconds: 60 } as RateLimitConfig,
  /** إرسال إيميلات */
  email: { maxRequests: 5, windowSeconds: 120 } as RateLimitConfig,
} as const;

class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();

  constructor() {
    // تنظيف كل 10 دقائق
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  /**
   * التحقق وتسجيل طلب
   * @returns true إذا الطلب مسموح، false إذا تجاوز الحد
   */
  check(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;
    let record = this.records.get(key);

    if (!record || (now - record.lastRefill) >= windowMs) {
      // نافذة جديدة
      record = { tokens: config.maxRequests - 1, lastRefill: now };
      this.records.set(key, record);
      return { allowed: true, remaining: record.tokens, resetIn: config.windowSeconds };
    }

    if (record.tokens > 0) {
      record.tokens--;
      return {
        allowed: true,
        remaining: record.tokens,
        resetIn: Math.ceil((windowMs - (now - record.lastRefill)) / 1000),
      };
    }

    // تجاوز الحد
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((windowMs - (now - record.lastRefill)) / 1000),
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 دقائق
    for (const [key, record] of this.records.entries()) {
      if ((now - record.lastRefill) > maxAge) {
        this.records.delete(key);
      }
    }
  }
}

// Singleton
export const rateLimiter = new RateLimiter();

/**
 * دالة مساعدة: تطبيق Rate Limiting على API Route
 *
 * @example
 * ```ts
 * export async function POST(request: Request) {
 *   const limited = applyRateLimit(request, 'ai');
 *   if (limited) return limited;
 *   // ... باقي المنطق
 * }
 * ```
 */
export function applyRateLimit(
  request: Request,
  type: keyof typeof RATE_LIMITS
): Response | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const config = RATE_LIMITS[type];
  const key = `${type}:${ip}`;

  const result = rateLimiter.check(key, config);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'لقد تجاوزت الحد المسموح من الطلبات. حاول مرة أخرى لاحقاً.',
        retryAfter: result.resetIn,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': result.resetIn.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetIn.toString(),
        },
      }
    );
  }

  return null;
}
