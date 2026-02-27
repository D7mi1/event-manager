/**
 * IP Protection - حماية من الهجمات المكثفة
 * ===========================================
 * مستوحى من production-saas-starter kit
 *
 * يتتبع IPs المشبوهة ويحظرها مؤقتاً عند تجاوز حدود معينة
 * - حماية من brute force على Login و PIN
 * - حظر مؤقت للـ IPs المُسيئة
 * - قائمة IPs الموثوقة (allowlist)
 */

interface IPRecord {
  violations: number;
  lastViolation: number;
  blockedUntil: number | null;
}

class IPProtection {
  private records: Map<string, IPRecord> = new Map();

  // الحد الأقصى للمخالفات قبل الحظر
  private readonly MAX_VIOLATIONS = 10;
  // مدة الحظر (30 دقيقة)
  private readonly BLOCK_DURATION_MS = 30 * 60 * 1000;
  // مدة نسيان المخالفات (ساعة)
  private readonly VIOLATION_EXPIRY_MS = 60 * 60 * 1000;

  // IPs موثوقة (لا تُحظر أبداً)
  private readonly ALLOWLIST = new Set([
    '127.0.0.1',
    '::1',
    'localhost',
  ]);

  constructor() {
    // تنظيف دوري كل 5 دقائق
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * تسجيل مخالفة لـ IP معين
   * (يُستدعى عند: rate limit exceeded, failed login, invalid PIN, etc.)
   */
  recordViolation(ip: string): void {
    if (this.ALLOWLIST.has(ip)) return;

    const now = Date.now();
    let record = this.records.get(ip);

    if (!record || (now - record.lastViolation) > this.VIOLATION_EXPIRY_MS) {
      record = { violations: 0, lastViolation: now, blockedUntil: null };
    }

    record.violations++;
    record.lastViolation = now;

    // الحظر عند تجاوز الحد
    if (record.violations >= this.MAX_VIOLATIONS) {
      record.blockedUntil = now + this.BLOCK_DURATION_MS;

      if (process.env.NODE_ENV === 'development') {
        console.warn(`[IPProtection] IP blocked: ${ip} (${record.violations} violations)`);
      }
    }

    this.records.set(ip, record);
  }

  /**
   * التحقق مما إذا كان IP محظور
   */
  isBlocked(ip: string): boolean {
    if (this.ALLOWLIST.has(ip)) return false;

    const record = this.records.get(ip);
    if (!record || !record.blockedUntil) return false;

    const now = Date.now();
    if (now >= record.blockedUntil) {
      // انتهى الحظر
      record.blockedUntil = null;
      record.violations = 0;
      return false;
    }

    return true;
  }

  /**
   * وقت إنتهاء الحظر بالثواني
   */
  getBlockTimeRemaining(ip: string): number {
    const record = this.records.get(ip);
    if (!record?.blockedUntil) return 0;

    const remaining = Math.ceil((record.blockedUntil - Date.now()) / 1000);
    return Math.max(0, remaining);
  }

  /**
   * الحصول على عدد المخالفات
   */
  getViolationCount(ip: string): number {
    return this.records.get(ip)?.violations || 0;
  }

  /**
   * إعادة تعيين سجل IP
   */
  reset(ip: string): void {
    this.records.delete(ip);
  }

  /**
   * تنظيف السجلات المنتهية
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [ip, record] of this.records.entries()) {
      // حذف السجلات القديمة (أكثر من ساعة بدون مخالفات)
      if (
        (now - record.lastViolation) > this.VIOLATION_EXPIRY_MS &&
        (!record.blockedUntil || now >= record.blockedUntil)
      ) {
        this.records.delete(ip);
      }
    }
  }
}

// Singleton instance
export const ipProtection = new IPProtection();

/**
 * دالة مساعدة: فحص IP وإرجاع Response 403 إذا محظور
 *
 * @example
 * ```ts
 * const blockResponse = checkIPBlock(request);
 * if (blockResponse) return blockResponse;
 * // متابعة المعالجة...
 * ```
 */
export function checkIPBlock(request: Request): Response | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

  if (ipProtection.isBlocked(ip)) {
    const retryAfter = ipProtection.getBlockTimeRemaining(ip);

    return new Response(
      JSON.stringify({
        error: 'تم حظر عنوان IP مؤقتاً بسبب نشاط مشبوه',
        retryAfter,
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  return null;
}
