# 🔐 Advanced Security Recommendations
## نصائح أمان متقدمة للمنتج

---

## 1. إضافة Security Headers

### ❌ المشكلة الحالية:
```typescript
// next.config.ts حالياً لا يحتوي على security headers مخصصة
```

### ✅ الحل:
```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... existing config ...
  
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // منع MIME sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          // منع clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          // منع XSS browser workaround
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          // Referrer Policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          // Permissions Policy (formerly Feature Policy)
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()"
          },
          // Content Security Policy (ملائم لتطبيق React)
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.sentry.io; object-src 'none'; frame-ancestors 'none';"
          }
        ]
      }
    ];
  },
};

export default nextConfig;
```

### 🔍 شرح الـ Headers:

| Header | الهدف |
|--------|-------|
| X-Content-Type-Options: nosniff | منع الـ browser من guess MIME type |
| X-Frame-Options: DENY | منع الـ iframe |
| X-XSS-Protection: 1; mode=block | تفعيل XSS filter |
| Referrer-Policy | التحكم في referrer sharing |
| Permissions-Policy | منع الـ features غير الضرورية |
| CSP | التحكم في مصادر محتوى |

---

## 2. تحسين رسائل الأخطاء

### ❌ المشكلة الحالية:
```typescript
// رسائل قد تكشف معلومات حساسة
return { success: false, error: 'User not found' };  // ❌ يكشف الـ user exists check
return { success: false, error: 'Database error: column not found' };  // ❌ كشف schema
```

### ✅ الحل:
```typescript
// lib/utils/error-messages.ts
export const ERROR_MESSAGES = {
  // Generic messages للـ client
  INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
  INVALID_INPUT: 'البيانات المدخلة غير صحيحة',
  UNAUTHORIZED: 'غير مصرح بالوصول',
  FORBIDDEN: 'ليس لديك صلاحيات كافية',
  NOT_FOUND: 'المورد المطلوب غير موجود',
  SERVER_ERROR: 'حدث خطأ في النظام، الرجاء المحاولة لاحقاً',
  TOO_MANY_REQUESTS: 'تم تجاوز عدد المحاولات المسموحة',
} as const;

// app/actions/verifyPin.ts (مثال)
export async function verifyEventPin(eventId: string, inputPin: string) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('pin_hash')
      .eq('id', eventId)
      .single();

    if (error || !data) {
      // ✅ لا نكشف ما إذا كانت الفعالية موجودة
      if (process.env.NODE_ENV === 'development') {
        console.error('Event PIN verification failed:', error);
      }
      return { success: false, message: ERROR_MESSAGES.INVALID_INPUT };
    }

    const isValid = await bcrypt.compare(inputPin, data.pin_hash);
    
    if (!isValid) {
      // ✅ رسالة عامة
      return { success: false, message: ERROR_MESSAGES.INVALID_INPUT };
    }

    return { success: true };
  } catch (error) {
    // ✅ catch unexpected errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error in verifyEventPin:', error);
    }
    return { success: false, message: ERROR_MESSAGES.SERVER_ERROR };
  }
}
```

---

## 3. تطبيق Rate Limiting

### ⚠️ الأهمية:
منع هجمات Brute Force على:
- Login endpoints
- PIN verification
- API requests

### ✅ الحل (باستخدام `express-rate-limit`):

```bash
npm install express-rate-limit
```

```typescript
// lib/rate-limit.ts
import rateLimit from 'express-rate-limit';

// Rate limiter للـ login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,      // 15 minutes
  max: 5,                         // 5 attempts per IP
  message: 'تم تجاوز محاولات الدخول، حاول مجدداً بعد 15 دقيقة',
  standardHeaders: true,          // Return info in headers
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development', // Skip in dev
});

// Rate limiter للـ PIN verification
export const pinVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,       // 10 minutes
  max: 3,                         // 3 attempts per event/IP
  message: 'تم تجاوز محاولات التحقق، حاول مجدداً لاحقاً',
  keyGenerator: (req, res) => {
    const eventId = req.body?.eventId || 'unknown';
    const ip = req.ip || 'unknown';
    return `${ip}-${eventId}`;
  },
});

// Rate limiter عام للـ API
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,        // 1 minute
  max: 30,                        // 30 requests per IP per minute
  message: 'تم تجاوز عدد الطلبات، حاول مجدداً لاحقاً',
});
```

```typescript
// app/api/verify-pin/route.ts
import { pinVerifyLimiter } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // تطبيق rate limiter
  // (يحتاج middleware للـ Express)
  
  const { eventId, pin } = await request.json();
  
  // verify pin...
}
```

---

## 4. إضافة Audit Logging

### ⚠️ الأهمية:
تتبع العمليات الحساسة للمراجعة والتدقيق

### ✅ الحل:

```typescript
// lib/audit-logger.ts
import { supabase } from '@/lib/supabase/client';

export interface AuditLog {
  action: 'login' | 'create_event' | 'verify_pin' | 'export_data' | 'delete_event';
  user_id?: string;
  event_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  timestamp?: Date;
  status: 'success' | 'failure';
  error_message?: string;
}

export async function logAudit(log: AuditLog) {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert([
        {
          action: log.action,
          user_id: log.user_id,
          event_id: log.event_id,
          ip_address: log.ip_address,
          user_agent: log.user_agent,
          details: log.details,
          status: log.status,
          error_message: log.error_message,
          created_at: log.timestamp || new Date(),
        }
      ]);

    if (error) {
      console.error('Failed to log audit:', error);
    }
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}

// مثال الاستخدام:
// في app/actions/verifyPin.ts
export async function verifyEventPin(eventId: string, inputPin: string) {
  try {
    // ... verification logic ...
    
    if (!isValid) {
      await logAudit({
        action: 'verify_pin',
        event_id: eventId,
        status: 'failure',
        error_message: 'Invalid PIN',
      });
      return { success: false };
    }

    await logAudit({
      action: 'verify_pin',
      event_id: eventId,
      status: 'success',
    });
    
    return { success: true };
  } catch (error) {
    await logAudit({
      action: 'verify_pin',
      event_id: eventId,
      status: 'failure',
      error_message: String(error),
    });
    throw error;
  }
}
```

```sql
-- Database schema للـ audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  event_id UUID REFERENCES events(id),
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "audit_logs_admin_only"
  ON audit_logs
  FOR SELECT
  USING (is_admin());

-- Index للـ performance
CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at DESC);
CREATE INDEX audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX audit_logs_action_idx ON audit_logs(action);
```

---

## 5. تحسين التحقق من البيانات (Validation)

### ✅ الحل:

```typescript
// lib/utils/validation-advanced.ts
import { z } from 'zod';

// Schemas متقدمة مع رسائل خطأ مخصصة
export const LoginSchema = z.object({
  email: z.string()
    .email('البريد الإلكتروني غير صحيح')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .max(128, 'كلمة المرور طويلة جداً'),
});

export const PINSchema = z.object({
  eventId: z.string().uuid('معرّف الفعالية غير صحيح'),
  pin: z.string()
    .regex(/^\d{4,6}$/, 'الرمز يجب أن يكون 4-6 أرقام')
    .trim(),
});

export const EventCreateSchema = z.object({
  title: z.string()
    .min(3, 'عنوان الفعالية قصير جداً')
    .max(200, 'عنوان الفعالية طويل جداً')
    .trim(),
  description: z.string()
    .max(1000, 'الوصف طويل جداً')
    .optional(),
  date: z.coerce.date()
    .min(new Date(), 'التاريخ يجب أن يكون في المستقبل'),
  location: z.string()
    .max(200)
    .optional(),
  capacity: z.number()
    .int('السعة يجب أن تكون رقم صحيح')
    .positive('السعة يجب أن تكون موجبة')
    .max(10000, 'السعة أكبر من الحد الأقصى'),
});
```

---

## 6. تحسين CORS Configuration

### ⚠️ الحالية:
```typescript
// غير معرّف بوضوح
```

### ✅ الحل:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  // قائمة الـ origins المسموحة
  const allowedOrigins = [
    'https://meras-event.com',
    'https://www.meras-event.com',
    'https://admin.meras-event.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
  ];

  const isAllowedOrigin = allowedOrigins.includes(origin || '');

  if (isAllowedOrigin) {
    // ✅ إضافة CORS headers
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin || 'https://meras-event.com');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  // ❌ منع الـ CORS requests من origins غير مسموحة
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
```

---

## 7. Two-Factor Authentication (2FA) - Optional

### ⚠️ الأهمية:
حماية إضافية للحسابات المهمة

### ✅ الحل (استخدام `speakeasy`):

```bash
npm install speakeasy qrcode
```

```typescript
// lib/two-factor-auth.ts
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function generateTwoFactorSecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `Meras Event (${email})`,
    issuer: 'Meras Event',
    length: 32,
  });

  // Generate QR Code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32,
    qrCode,
  };
}

export function verifyTwoFactorToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2 windows (30 seconds)
  });
}
```

---

## 8. Environment Variable Validation

### ⚠️ الحالية:
```typescript
// استخدام ! للـ optional chaining
process.env.NEXT_PUBLIC_SUPABASE_URL!
```

### ✅ الحل:

```typescript
// lib/env.ts
export const env = {
  // Public
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  
  // Private (Server only)
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
} as const;

// Validation
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
  ];

  for (const variable of required) {
    if (!process.env[variable]) {
      throw new Error(`Missing required environment variable: ${variable}`);
    }
  }
}

// Call في app/layout.tsx
if (typeof window === 'undefined') {
  validateEnv();
}
```

---

## 📋 Checklist الأمان الفوري

```
[ ] تطبيق Security Headers في next.config.ts
[ ] تحسين رسائل الأخطاء (generic messages)
[ ] إضافة Rate Limiting على endpoints الحساسة
[ ] إضافة Audit Logging table في database
[ ] تحسين CORS configuration
[ ] التحقق من environment variables
[ ] اختبار Security headers في Production
[ ] Penetration testing
[ ] Code review نهائي
[ ] إعداد Monitoring و Alerting
```

---

## 🚀 الخطوات التالية

### الأسبوع 1:
- ✅ تطبيق Security Headers
- ✅ تحسين رسائل الأخطاء

### الأسبوع 2:
- ✅ إضافة Rate Limiting
- ✅ إضافة CORS validation

### الأسبوع 3:
- ✅ إضافة Audit Logging
- ✅ الاختبارات الأمنية

### الشهر الأول:
- ✅ إضافة 2FA (اختياري)
- ✅ Penetration Testing

---

**آخر تحديث:** 11 يناير 2026

