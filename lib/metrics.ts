/**
 * 📊 Monitoring & Metrics
 * تتبع الأداء والمقاييس الأساسية
 */

interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

class MetricsCollector {
  private metrics: Metric[] = [];
  private counterMetrics: Map<string, number> = new Map();
  private gaugeMetrics: Map<string, number> = new Map();
  private histogramMetrics: Map<string, number[]> = new Map();

  /**
   * تسجيل counter metric
   */
  incrementCounter(name: string, value: number = 1, tags?: Record<string, string>): void {
    const key = this.buildKey(name, tags);
    const current = this.counterMetrics.get(key) || 0;
    this.counterMetrics.set(key, current + value);

    this.recordMetric({
      name,
      value: current + value,
      unit: 'count',
      tags,
      timestamp: new Date(),
    });
  }

  /**
   * تسجيل gauge metric (قيمة حالية)
   */
  setGauge(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.buildKey(name, tags);
    this.gaugeMetrics.set(key, value);

    this.recordMetric({
      name,
      value,
      unit: 'gauge',
      tags,
      timestamp: new Date(),
    });
  }

  /**
   * تسجيل histogram metric (توزيع القيم)
   */
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.buildKey(name, tags);
    const values = this.histogramMetrics.get(key) || [];
    values.push(value);
    this.histogramMetrics.set(key, values);

    this.recordMetric({
      name,
      value,
      unit: 'ms',
      tags,
      timestamp: new Date(),
    });
  }

  /**
   * قياس وقت التنفيذ
   */
  async measureExecutionTime<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.recordHistogram(`${name}_duration`, duration, tags);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordHistogram(`${name}_duration_error`, duration, tags);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات المقاييس
   */
  getMetricsSnapshot(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<string, { count: number; avg: number; min: number; max: number }>;
  } {
    const histogramStats: Record<string, { count: number; avg: number; min: number; max: number }> = {};

    for (const [key, values] of this.histogramMetrics) {
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        histogramStats[key] = {
          count: values.length,
          avg: sum / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
        };
      }
    }

    return {
      counters: Object.fromEntries(this.counterMetrics),
      gauges: Object.fromEntries(this.gaugeMetrics),
      histograms: histogramStats,
    };
  }

  /**
   * تصفير جميع المقاييس
   */
  reset(): void {
    this.metrics = [];
    this.counterMetrics.clear();
    this.gaugeMetrics.clear();
    this.histogramMetrics.clear();
  }

  /**
   * تسجيل metric داخلي
   */
  private recordMetric(metric: Metric): void {
    this.metrics.push(metric);

    // الاحتفاظ بـ 10000 metric فقط كحد أقصى
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000);
    }
  }

  /**
   * بناء key من الـ name والـ tags
   */
  private buildKey(name: string, tags?: Record<string, string>): string {
    if (!tags || Object.keys(tags).length === 0) {
      return name;
    }
    const tagStr = Object.entries(tags)
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return `${name}{${tagStr}}`;
  }
}

export const metricsCollector = new MetricsCollector();

// ============================================
// Common Metrics
// ============================================

/**
 * تتبع عدد الـ API requests
 */
export function trackApiRequest(
  route: string,
  method: string,
  statusCode: number,
  duration: number
): void {
  metricsCollector.incrementCounter('api_requests_total', 1, {
    route,
    method,
    status: statusCode.toString(),
  });

  metricsCollector.recordHistogram('api_request_duration', duration, {
    route,
    method,
  });
}

/**
 * تتبع عمليات قاعدة البيانات
 */
export function trackDatabaseOperation(
  operation: string,
  table: string,
  success: boolean,
  duration: number
): void {
  metricsCollector.incrementCounter('database_operations_total', 1, {
    operation,
    table,
    success: success ? 'true' : 'false',
  });

  metricsCollector.recordHistogram('database_operation_duration', duration, {
    operation,
    table,
  });
}

/**
 * تتبع عمليات الـ Audit Log
 */
export function trackAuditLog(action: string, status: string): void {
  metricsCollector.incrementCounter('audit_logs_total', 1, {
    action,
    status,
  });
}

/**
 * مثال الاستخدام:
 * 
 * import { metricsCollector, trackApiRequest, trackAuditLog } from '@/lib/metrics';
 * 
 * // في API route
 * const start = Date.now();
 * 
 * try {
 *   // معالجة الـ request
 *   trackApiRequest('/api/verify-pin', 'POST', 200, Date.now() - start);
 *   trackAuditLog('verify_pin', 'success');
 * } catch (error) {
 *   trackApiRequest('/api/verify-pin', 'POST', 500, Date.now() - start);
 *   trackAuditLog('verify_pin', 'failure');
 * }
 * 
 * // الحصول على المقاييس
 * const snapshot = metricsCollector.getMetricsSnapshot();
 * console.log(snapshot);
 */
