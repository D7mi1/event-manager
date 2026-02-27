/**
 * 🛡️ Input Sanitization Utilities
 * مستوحى من production-saas-starter (go-b2b-starter/internal/platform/server/middleware/sanitization.go)
 *
 * يكتشف ويمنع:
 * - Path Traversal (.., //, \\)
 * - XSS (<script>, javascript:, onload=)
 * - SQL Injection (DROP, UNION SELECT, etc.)
 */

// أنماط XSS الشائعة
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /on(?:load|error|click|mouseover|focus|blur|submit|change|input)\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<form/gi,
  /data\s*:\s*text\/html/gi,
  /expression\s*\(/gi,
  /vbscript\s*:/gi,
];

// أنماط SQL Injection الشائعة
const SQL_PATTERNS = [
  /(\b(DROP|ALTER|CREATE|TRUNCATE|INSERT|DELETE|UPDATE)\b\s+(TABLE|DATABASE|INDEX))/gi,
  /(\bUNION\b\s+\bSELECT\b)/gi,
  /(\b(SELECT|INSERT|UPDATE|DELETE)\b\s+.*\bFROM\b)/gi,
  /(--\s|;\s*DROP|;\s*DELETE|;\s*UPDATE)/gi,
  /('\s*(OR|AND)\s+'?\d+'?\s*=\s*'?\d+'?)/gi,
];

// أنماط Path Traversal
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\/g,
  /\/\//g,
  /\\\\/g,
  /%2e%2e/gi,
  /%252e%252e/gi,
];

/**
 * يفحص النص بحثاً عن أنماط XSS
 */
export function detectXSS(input: string): boolean {
  return XSS_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * يفحص النص بحثاً عن أنماط SQL Injection
 */
export function detectSQLInjection(input: string): boolean {
  return SQL_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * يفحص النص بحثاً عن Path Traversal
 */
export function detectPathTraversal(input: string): boolean {
  return PATH_TRAVERSAL_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * ينظف النص من HTML tags الخطرة
 */
export function escapeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * يفحص كائن بالكامل بحثاً عن محتوى خبيث
 * يُستخدم لفحص body الـ API requests
 */
export function sanitizeInput(data: unknown): { safe: boolean; threat?: string } {
  if (data === null || data === undefined) return { safe: true };

  if (typeof data === 'string') {
    if (detectXSS(data)) return { safe: false, threat: 'XSS detected' };
    if (detectSQLInjection(data)) return { safe: false, threat: 'SQL injection detected' };
    if (detectPathTraversal(data)) return { safe: false, threat: 'Path traversal detected' };
    return { safe: true };
  }

  if (typeof data === 'number' || typeof data === 'boolean') return { safe: true };

  if (Array.isArray(data)) {
    for (const item of data) {
      const result = sanitizeInput(item);
      if (!result.safe) return result;
    }
    return { safe: true };
  }

  if (typeof data === 'object') {
    for (const value of Object.values(data as Record<string, unknown>)) {
      const result = sanitizeInput(value);
      if (!result.safe) return result;
    }
    return { safe: true };
  }

  return { safe: true };
}
