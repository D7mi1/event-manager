# API Documentation - توثيق API

## نظرة عامة

هذا المستند يوضح جميع الـ APIs المتاحة في تطبيق Meras Event Platform.

---

## قاعدة البيانات (Supabase)

### Attendees Table - جدول الحضور

#### الحقول:
- `id` (UUID): معرف فريد للضيف
- `event_id` (UUID): معرف الفعالية المرتبطة
- `name` (String): اسم الضيف
- `email` (String): البريد الإلكتروني
- `phone` (String): رقم الهاتف
- `status` (Enum): حالة الضيف (pending | confirmed | declined)
- `created_at` (Timestamp): تاريخ الإضافة
- `check_in_time` (Timestamp, nullable): وقت الدخول
- `attended` (Boolean): هل حضر الفعالية
- `regret_reason` (String, nullable): سبب الاعتذار

#### العمليات:

**جلب بيانات ضيف:**
```typescript
const { data, error } = await supabase
  .from('attendees')
  .select('*, events(*), seats(*)')
  .eq('id', ticketId)
  .single();
```

**تحديث حالة الضيف:**
```typescript
const { error } = await supabase
  .from('attendees')
  .update({ status: 'confirmed' })
  .eq('id', attendeeId);
```

---

### Events Table - جدول الفعاليات

#### الحقول:
- `id` (UUID): معرف الفعالية
- `name` (String): اسم الفعالية
- `date` (Timestamp): تاريخ الفعالية
- `location_name` (String): اسم الموقع
- `type` (Enum): نوع الفعالية (wedding | business | other)
- `user_id` (UUID): معرف المنظم
- `status` (Enum): حالة الفعالية (active | draft)
- `guests_count` (Integer): عدد المدعوين
- `is_registration_open` (Boolean): هل التسجيل مفتوح

#### العمليات:

**جلب بيانات الفعالية:**
```typescript
const { data, error } = await supabase
  .from('events')
  .select('*')
  .eq('id', eventId)
  .single();
```

---

### Memories Table - جدول الذكريات

#### الحقول:
- `id` (UUID): معرف الذكرى
- `event_id` (UUID): معرف الفعالية
- `attendee_id` (UUID): معرف الضيف
- `message` (String): نص الذكرى
- `created_at` (Timestamp): وقت الإضافة

#### العمليات:

**إضافة ذكرى:**
```typescript
const { error } = await supabase.from('memories').insert({
  event_id: eventId,
  attendee_id: attendeeId,
  message: 'ذكرى جميلة',
});
```

---

## Hooks المتاحة

### useTicket
جلب بيانات التذكرة مع معالجة الأخطاء.

```typescript
const { ticket, loading, error, updateTicketStatus } = useTicket(id);
```

**الخصائص:**
- `ticket`: بيانات التذكرة
- `loading`: هل في حالة تحميل
- `error`: رسالة الخطأ
- `updateTicketStatus()`: تحديث حالة التذكرة

---

### useTicketWithCache
جلب التذكرة مع SWR للـ caching.

```typescript
const { ticket, loading, error, mutate } = useTicketWithCache(id);
```

**الميزات:**
- تخزين مؤقت للبيانات
- إعادة تحميل ذكية عند تغيير الاتصال
- تجنب عمليات جلب البيانات المكررة

---

### useEvent
جلب بيانات الفعالية.

```typescript
const { event, loading, error } = useEvent(eventId);
```

---

## Validation Functions - دوال التحقق

### validateEmail
```typescript
const isValid = validateEmail('user@example.com');
```

### validatePhone
```typescript
const isValid = validatePhone('0501234567', 9); // 9 digits
```

### validateRequired
```typescript
const error = validateRequired('value', 'Field Name');
```

---

## Zod Schemas

### registrationSchema
التحقق من نموذج التسجيل:

```typescript
import { registrationSchema, validateData } from '@/app/utils/schemas';

const result = validateData(registrationSchema, {
  name: 'أحمد محمد',
  email: 'ahmed@example.com',
  phone: '0501234567',
  eventId: 'uuid-here',
});

if (result.success) {
  // البيانات صحيحة
  const data = result.data;
} else {
  // يوجد خطأ
  console.error(result.error);
}
```

### memorySchema
التحقق من البيانات المدخلة للذكريات:

```typescript
import { memorySchema } from '@/app/utils/schemas';

const result = memorySchema.safeParse({
  message: 'ذكرى جميلة',
  eventId: 'uuid-here',
  attendeeId: 'uuid-here',
});
```

---

## Error Handling - معالجة الأخطاء

### Sentry Integration

تتبع الأخطاء تلقائياً:

```typescript
import { captureError, setSentryUser } from '@/app/utils/sentry';

// تعيين المستخدم
setSentryUser(userId, userEmail);

// تسجيل خطأ
captureError(error, { context: 'registration_form' });

// مسح بيانات المستخدم عند الخروج
clearSentryUser();
```

---

## الثوابت والإعدادات

### app/config/constants.ts

```typescript
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
export const STATUS_TYPES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DECLINED: 'declined',
};
export const EVENT_TYPES = {
  WEDDING: 'wedding',
  BUSINESS: 'business',
  OTHER: 'other',
};
```

---

## متغيرات البيئة

انسخ `.env.example` إلى `.env.local` وأضف القيم الخاصة بك:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## أمثلة الاستخدام

### التسجيل في فعالية

```typescript
import { registrationSchema, validateData } from '@/app/utils/schemas';
import { supabase } from '@/app/utils/supabase/client';

async function registerForEvent(formData) {
  // التحقق من البيانات
  const validation = validateData(registrationSchema, formData);
  if (!validation.success) {
    throw new Error(validation.error);
  }

  // إضافة في قاعدة البيانات
  const { data, error } = await supabase
    .from('attendees')
    .insert([validation.data])
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### تأكيد الحضور

```typescript
import { useTicket } from '@/app/hooks/useTicket';

export function ConfirmAttendance({ ticketId }) {
  const { ticket, updateTicketStatus } = useTicket(ticketId);

  const handleConfirm = async () => {
    try {
      await updateTicketStatus('confirmed');
      // عرض رسالة نجاح
    } catch (error) {
      // عرض رسالة الخطأ
    }
  };

  return <button onClick={handleConfirm}>تأكيد الحضور</button>;
}
```

---

## Testing

تشغيل الاختبارات:

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل الاختبارات في وضع المراقبة
npm run test:watch

# تشغيل ملف اختبار معين
npm test validation.test.ts
```

---

## الدعم والمساعدة

للمزيد من المعلومات:
- [Supabase Documentation](https://supabase.com/docs)
- [SWR Documentation](https://swr.vercel.app)
- [Zod Documentation](https://zod.dev)
- [Sentry Documentation](https://docs.sentry.io)
- [Jest Documentation](https://jestjs.io)

---

**آخر تحديث:** December 30, 2025
