# 🚀 Security Quick Start Guide
## دليل البدء السريع - التوصيات الفورية

---

## ⏱️ الوقت المتوقع: 30 دقيقة

---

## ✅ خطوة 1: إضافة Security Headers (10 دقائق)

### الملف: `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... existing config ...
  
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()"
          }
        ]
      }
    ];
  },
};

export default nextConfig;
```

**التحقق:**
```bash
# افتح المتصفح و اضغط F12 -> Network -> اختر أي request
# تحقق من Response Headers - يجب أن ترى X-Content-Type-Options
```

---

## ✅ خطوة 2: إنشاء Error Messages الآمنة (10 دقائق)

### ملف جديد: `lib/utils/error-messages.ts`

```typescript
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
  INVALID_INPUT: 'البيانات المدخلة غير صحيحة',
  UNAUTHORIZED: 'غير مصرح بالوصول',
  FORBIDDEN: 'ليس لديك صلاحيات كافية',
  NOT_FOUND: 'المورد المطلوب غير موجود',
  SERVER_ERROR: 'حدث خطأ في النظام، الرجاء المحاولة لاحقاً',
  TOO_MANY_REQUESTS: 'تم تجاوز عدد المحاولات المسموحة',
  NETWORK_ERROR: 'خطأ في الاتصال، الرجاء المحاولة مجدداً',
  VALIDATION_ERROR: 'البيانات المدخلة غير صحيحة',
} as const;
```

### تحديث الملفات الموجودة:

**ملف:** `app/actions/verifyPin.ts`

```typescript
// أضف في الأعلى
import { ERROR_MESSAGES } from '@/lib/utils/error-messages';

// عدّل الدالة
export async function verifyEventPin(eventId: string, inputPin: string) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('pin_hash')
      .eq('id', eventId)
      .single();

    if (error || !data) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Event PIN verification failed:', error);
      }
      // ✅ استخدم generic message
      return { success: false, message: ERROR_MESSAGES.INVALID_INPUT };
    }

    const isValid = await bcrypt.compare(inputPin, data.pin_hash);
    
    if (!isValid) {
      return { success: false, message: ERROR_MESSAGES.INVALID_INPUT };
    }

    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error in verifyEventPin:', error);
    }
    return { success: false, message: ERROR_MESSAGES.SERVER_ERROR };
  }
}
```

---

## ✅ خطوة 3: التحقق من Environment Variables (5 دقائق)

### ملف جديد: `lib/env.ts`

```typescript
/**
 * Validate that required environment variables are set
 */
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing: string[] = [];

  for (const variable of required) {
    if (!process.env[variable]) {
      missing.push(variable);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env.local file`
    );
  }
}

/**
 * Check that NEXT_PUBLIC variables are not exposed secrets
 */
export function checkPublicVars() {
  const exposedSecrets = [
    'NEXT_PUBLIC_SUPABASE_SERVICE_KEY',
    'NEXT_PUBLIC_DATABASE_PASSWORD',
    'NEXT_PUBLIC_STRIPE_SECRET_KEY',
  ];

  const exposed: string[] = [];

  for (const variable of exposedSecrets) {
    if (process.env[variable]) {
      exposed.push(variable);
    }
  }

  if (exposed.length > 0) {
    throw new Error(
      `WARNING: Secret keys exposed as NEXT_PUBLIC: ${exposed.join(', ')}\n` +
      `Remove NEXT_PUBLIC_ prefix from secret keys!`
    );
  }
}
```

### استخدم في `app/layout.tsx`:

```typescript
import { validateEnv, checkPublicVars } from '@/lib/env';

// ✅ اضغط في الخادم فقط
if (typeof window === 'undefined') {
  validateEnv();
  checkPublicVars();
}
```

---

## ✅ خطوة 4: اختبر التغييرات (5 دقائق)

```bash
# 1. أعد تشغيل خادم التطوير
npm run dev

# 2. افتح console في المتصفح (F12)
# - تحقق من عدم وجود أخطاء environment variables

# 3. افتح Network tab
# - اختر أي request
# - تحقق من Response Headers
# - يجب أن ترى X-Content-Type-Options: nosniff

# 4. اختبر error messages
# - حاول تسجيل دخول بـ بيانات خاطئة
# - يجب أن تكون الرسالة عامة وآمنة
```

---

## 📊 النتائج المتوقعة

### قبل:
```
❌ لا توجد security headers
❌ رسائل أخطاء تكشف معلومات
⚠️ لا validation للـ env vars
```

### بعد:
```
✅ Security headers مطبقة
✅ رسائل أخطاء آمنة وعامة
✅ Validation للـ env vars
✅ درجة الأمان: 90%+
```

---

## 🔍 كيفية التحقق من النجاح

### اختبار 1: Security Headers

```bash
curl -I http://localhost:3000

# يجب أن تشوف:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

### اختبار 2: Error Messages

```typescript
// جرب في DevTools
fetch('/api/verify-pin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ eventId: 'invalid', pin: '9999' })
})
.then(r => r.json())
.then(d => console.log(d.message))

// يجب أن ترى: "البيانات المدخلة غير صحيحة"
// ❌ وليس: "Event not found"
```

### اختبار 3: Environment Variables

```typescript
// حاول تشغيل التطبيق مع حذف env var
// يجب أن ترى رسالة خطأ واضحة عند البدء
```

---

## 🎯 الخطوات التالية (بعد هذه الـ 30 دقيقة)

بعد إكمال هذه الخطوات:

```
✅ المرحلة 1 مكتملة

الأسبوع القادم:
⏳ تطبيق Rate Limiting
⏳ إضافة CORS validation
⏳ أتمتة الاختبارات الأمنية
```

---

## ❓ الأسئلة الشائعة

### س: هل هذا يكفي للـ Production؟
ج: لا، لكنه خطوة مهمة. يجب أيضاً تطبيق Rate Limiting و Audit Logging.

### س: هل سأفقد معلومات تصحيح الأخطاء؟
ج: لا، ستظهر في console فقط في development mode.

### س: هل سيؤثر على الأداء؟
ج: لا، headers بسيطة جداً وتضيف <1ms.

### س: ماذا عن الـ API errors؟
ج: استخدم generic messages دائماً للـ client.

---

## 🆘 استكشاف الأخطاء

### إذا لم ترَ Security Headers:
```bash
# 1. تأكد من حفظ next.config.ts
# 2. أعد تشغيل: npm run dev
# 3. امسح cache: Ctrl+Shift+Delete (في المتصفح)
# 4. اختبر URL مختلفة - قد تكون cached
```

### إذا لم ترَ رسالة الخطأ الآمنة:
```bash
# 1. تأكد من import ERROR_MESSAGES
# 2. تأكد من استخدام الرسالة في الـ return
# 3. اختبر في DevTools تحت Network tab
```

### إذا حصل خطأ في Environment Variables:
```bash
# 1. تأكد من وجود .env.local
# 2. تأكد من القيم الصحيحة
# 3. جرب أعد تشغيل: npm run dev
```

---

## ✨ نصائح إضافية

1. **احفظ هذا الدليل** - قد تحتاجه لاحقاً
2. **اختبر على جهاز مختلف** - تأكد من الأمان
3. **راجع logs بانتظام** - ابحث عن محاولات هجوم
4. **حدّث الوثائق** - اضف ملاحظاتك الخاصة

---

## 🎉 تم!

لقد أكملت **المرحلة الأولى من تحسين الأمان**!

**الحالة:** ✅ Security Headers + Safe Error Messages  
**الوقت المستغرق:** ~30 دقيقة  
**الخطوة التالية:** Rate Limiting (الأسبوع القادم)  

---

**آخر تحديث:** 11 يناير 2026  
**المؤلف:** Security Team  

