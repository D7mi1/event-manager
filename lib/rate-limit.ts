/**
 * 🚦 Rate Limiting Utilities
 * محاكاة rate limiting بدون مكتبات خارجية
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 30) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // تنظيف دوري للـ expired entries
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetTime < now) {
          this.store.delete(key);
        }
      }
    }, windowMs);
  }

  /**
   * التحقق مما إذا كان الـ request مسموح به
   * @param key المعرّف الفريد (IP + endpoint)
   * @returns { success: boolean, remaining: number, retryAfter?: number }
   */
  check(key: string): { success: boolean; remaining: number; retryAfter?: number } {
    const now = Date.now();
    let entry = this.store.get(key);

    // إنشاء entry جديد إذا انتهت الفترة السابقة
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + this.windowMs,
      };
      this.store.set(key, entry);
    }

    entry.count++;

    // التحقق من تجاوز الحد
    if (entry.count > this.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return {
        success: false,
        remaining: 0,
        retryAfter,
      };
    }

    return {
      success: true,
      remaining: this.maxRequests - entry.count,
    };
  }

  /**
   * إعادة تعيين عداد معين
   */
  reset(key: string): void {
    this.store.delete(key);
  }
}

// ============================================
// Rate Limiters المختلفة
// ============================================

// Rate limiter للـ PIN verification (صارم جداً)
export const pinVerifyLimiter = new RateLimiter(
  10 * 60 * 1000, // 10 دقائق
  3                // 3 محاولات فقط
);

// Rate limiter للـ Login (صارم)
export const loginLimiter = new RateLimiter(
  15 * 60 * 1000,  // 15 دقيقة
  5                // 5 محاولات
);

// Rate limiter عام للـ API
export const apiLimiter = new RateLimiter(
  1 * 60 * 1000,   // دقيقة واحدة
  30               // 30 request
);

// Rate limiter للـ File uploads (صارم)
export const uploadLimiter = new RateLimiter(
  60 * 60 * 1000,  // ساعة واحدة
  10               // 10 uploads
);

// Rate limiter للـ AI API calls (مكلف - صارم)
export const aiLimiter = new RateLimiter(
  60 * 60 * 1000,  // ساعة واحدة
  20               // 20 طلب AI في الساعة
);

// Rate limiter لإرسال الإيميلات
export const emailLimiter = new RateLimiter(
  60 * 1000,       // دقيقة واحدة
  10               // 10 إيميلات في الدقيقة
);

/**
 * دالة مساعدة للحصول على IP address من request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

/**
 * دالة مساعدة للتحقق من Rate Limit
 */
export function checkRateLimit(
  limiter: RateLimiter,
  key: string
): { allowed: boolean; remaining: number; headers: Record<string, string> } {
  const result = limiter.check(key);

  const headers: Record<string, string> = {
    'RateLimit-Limit': (limiter as any).maxRequests?.toString() || '30',
    'RateLimit-Remaining': result.remaining.toString(),
  };

  if (!result.success && result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return {
    allowed: result.success,
    remaining: result.remaining,
    headers,
  };
}

/**
 * مثال الاستخدام في API route:
 * 
 * export async function POST(request: Request) {
 *   const ip = getClientIP(request);
 *   const key = `login-${ip}`;
 *   
 *   const { allowed, remaining, headers } = checkRateLimit(loginLimiter, key);
 *   
 *   if (!allowed) {
 *     return new Response(
 *       JSON.stringify({ error: 'تم تجاوز محاولات الدخول' }),
 *       { status: 429, headers }
 *     );
 *   }
 *   
 *   // معالجة الـ request
 *   return new Response(
 *     JSON.stringify({ success: true }),
 *     { status: 200, headers }
 *   );
 * }
 */
