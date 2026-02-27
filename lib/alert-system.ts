/**
 * 🔔 Alert System
 * نظام التنبيهات للأنشطة المريبة
 */

interface AlertRule {
  name: string;
  condition: (logs: AuditLog[]) => boolean;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  emailToNotify?: string;
}

interface AuditLog {
  action: string;
  status: string;
  ipAddress?: string;
  userId?: string;
  timestamp: Date;
}

class AlertSystem {
  private rules: Map<string, AlertRule> = new Map();
  private alertHistory: Array<{ rule: string; timestamp: Date; message: string }> = [];

  /**
   * إضافة قاعدة تنبيه
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.name, rule);
  }

  /**
   * فحص السجلات الحديثة للتنبيهات
   */
  async checkForAlerts(logs: AuditLog[]): Promise<Array<{ rule: string; message: string; severity: string }>> {
    const alerts: Array<{ rule: string; message: string; severity: string }> = [];

    for (const [ruleName, rule] of this.rules) {
      if (rule.condition(logs)) {
        alerts.push({
          rule: ruleName,
          message: rule.message,
          severity: rule.severity,
        });

        // تسجيل التنبيه
        this.alertHistory.push({
          rule: ruleName,
          timestamp: new Date(),
          message: rule.message,
        });

        // إرسال email إذا كان مطلوباً
        if (rule.emailToNotify) {
          await this.sendAlert(rule.emailToNotify, rule.message, rule.severity);
        }
      }
    }

    return alerts;
  }

  /**
   * إرسال تنبيه
   */
  private async sendAlert(
    email: string,
    message: string,
    severity: string
  ): Promise<void> {
    // TODO: تطبيق نظام إرسال البريد الإلكتروني
    console.log(`[ALERT ${severity.toUpperCase()}] ${message} -> ${email}`);
  }

  /**
   * الحصول على سجل التنبيهات
   */
  getAlertHistory(limit = 50): typeof this.alertHistory {
    return this.alertHistory.slice(-limit);
  }
}

// ============================================
// Alert Rules المعرفة مسبقاً
// ============================================

export const alertSystem = new AlertSystem();

/**
 * قاعدة: محاولات دخول فاشلة متكررة
 */
alertSystem.addRule({
  name: 'repeated_login_failures',
  message: '⚠️ محاولات دخول فاشلة متكررة من نفس الـ IP',
  severity: 'high',
  condition: (logs) => {
    const failedLogins = logs.filter(
      log => log.action === 'login' && log.status === 'failure'
    );
    const ipsWithFailures = new Map<string, number>();

    failedLogins.forEach(log => {
      const count = (ipsWithFailures.get(log.ipAddress || 'unknown') || 0) + 1;
      ipsWithFailures.set(log.ipAddress || 'unknown', count);
    });

    // تنبيه إذا كان هناك 5 محاولات فاشلة من نفس الـ IP
    return Array.from(ipsWithFailures.values()).some(count => count >= 5);
  },
  emailToNotify: process.env.ALERT_EMAIL,
});

/**
 * قاعدة: محاولات PIN فاشلة متكررة
 */
alertSystem.addRule({
  name: 'repeated_pin_failures',
  message: '⚠️ محاولات PIN فاشلة متكررة - قد يكون هناك محاولة اختراق',
  severity: 'critical',
  condition: (logs) => {
    const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);
    const recentPINFailures = logs.filter(
      log =>
        log.action === 'verify_pin' &&
        log.status === 'failure' &&
        log.timestamp > last5Minutes
    );

    // تنبيه إذا كان هناك 10 محاولات فاشلة في آخر 5 دقائق
    return recentPINFailures.length >= 10;
  },
  emailToNotify: process.env.ALERT_EMAIL,
});

/**
 * قاعدة: وصول غير مصرح
 */
alertSystem.addRule({
  name: 'unauthorized_access',
  message: '🔴 محاولة وصول غير مصرح من قِبل مستخدم',
  severity: 'critical',
  condition: (logs) => {
    return logs.some(log => log.action === 'unauthorized_access');
  },
  emailToNotify: process.env.ALERT_EMAIL,
});

/**
 * قاعدة: نشاط غير عادي
 */
alertSystem.addRule({
  name: 'suspicious_activity',
  message: '⚠️ تم اكتشاف نشاط مريب في النظام',
  severity: 'medium',
  condition: (logs) => {
    return logs.some(log => log.status === 'suspicious');
  },
});

/**
 * مثال الاستخدام:
 * 
 * import { alertSystem } from '@/lib/alert-system';
 * 
 * // في مكان معين (مثل API route أو cron job)
 * const recentLogs = await fetchRecentAuditLogs();
 * const alerts = await alertSystem.checkForAlerts(recentLogs);
 * 
 * if (alerts.length > 0) {
 *   console.log('⚠️ Alerts triggered:', alerts);
 * }
 */
