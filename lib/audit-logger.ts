/**
 * 🔍 Audit Logger
 * تسجيل العمليات الحساسة للمراجعة والتدقيق
 */

import { createClient } from '@supabase/supabase-js';

interface AuditLogEntry {
  action: string;
  userId?: string;
  eventId?: string;
  guestId?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'suspicious';
  details?: Record<string, any>;
  errorMessage?: string;
  timestamp?: Date;
}

class AuditLogger {
  private supabase;
  private batchLogs: AuditLogEntry[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private batchSize = 10;
  private batchTimeMs = 5000; // 5 seconds

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * تسجيل عملية في الـ audit log
   */
  async log(entry: AuditLogEntry): Promise<void> {
    // إضافة timestamp
    entry.timestamp = entry.timestamp || new Date();

    // إضافة إلى الـ batch
    this.batchLogs.push(entry);

    // إرسال فوري إذا امتلأ الـ batch
    if (this.batchLogs.length >= this.batchSize) {
      await this.flush();
      return;
    }

    // بدء timer للإرسال المؤجل
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flush(), this.batchTimeMs);
    }
  }

  /**
   * إرسال جميع السجلات المعلقة
   */
  async flush(): Promise<void> {
    if (this.batchLogs.length === 0) return;

    const logsToSend = [...this.batchLogs];
    this.batchLogs = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      const { error } = await this.supabase
        .from('audit_logs')
        .insert(logsToSend.map(log => ({
          action: log.action,
          user_id: log.userId,
          event_id: log.eventId,
          guest_id: log.guestId,
          ip_address: log.ipAddress,
          user_agent: log.userAgent,
          status: log.status,
          details: log.details,
          error_message: log.errorMessage,
          created_at: log.timestamp,
        })));

      if (error) {
        console.error('Failed to log audit:', error);
        // أعد الـ logs إلى الـ batch في حالة الفشل
        this.batchLogs = [...logsToSend, ...this.batchLogs];
      }
    } catch (error) {
      console.error('Audit logging error:', error);
      // أعد الـ logs
      this.batchLogs = [...logsToSend, ...this.batchLogs];
    }
  }

  /**
   * تسجيل عملية ناجحة
   */
  async logSuccess(action: string, options: Partial<AuditLogEntry> = {}): Promise<void> {
    await this.log({
      action,
      status: 'success',
      ...options,
    });
  }

  /**
   * تسجيل عملية فاشلة
   */
  async logFailure(
    action: string,
    errorMessage: string,
    options: Partial<AuditLogEntry> = {}
  ): Promise<void> {
    await this.log({
      action,
      status: 'failure',
      errorMessage,
      ...options,
    });
  }

  /**
   * تسجيل نشاط مريب
   */
  async logSuspicious(action: string, details: Record<string, any> = {}): Promise<void> {
    await this.log({
      action,
      status: 'suspicious',
      details,
    });
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();

// ============================================
// Helper Functions
// ============================================

export function getClientIPFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

// Usage example:
// import { auditLogger, getClientIPFromRequest, getUserAgent } from '@/lib/audit-logger';
// 
// export async function POST(request: Request) {
//   const ip = getClientIPFromRequest(request);
//   const userAgent = getUserAgent(request);
//   
//   try {
//     await doSomething();
//     
//     await auditLogger.logSuccess('action_name', {
//       ipAddress: ip,
//       userAgent,
//     });
//   } catch (error) {
//     await auditLogger.logFailure('action_name', error.message, {
//       ipAddress: ip,
//       userAgent,
//     });
//   }
// }
