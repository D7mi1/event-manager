# 🎨 Template Designer System - دليل المستخدم والمطور

## 📋 نظرة عامة

نظام محرر التصاميم الاحترافي الذي يسمح لمنظمي الفعاليات بإنشاء تصاميم مخصصة للزواجات والحفلات.

---

## 🚀 المميزات الرئيسية

### 1️⃣ **محرر بصري متقدم**
- ✅ واجهة drag-and-drop سهلة
- ✅ دعم عناصر متعددة (نص، صور، أشكال، زخارف)
- ✅ معاينة فورية للتصميم
- ✅ حفظ تلقائي للتعديلات

### 2️⃣ **دعم عربي كامل**
- ✅ خطوط عربية احترافية:
  - Cairo
  - Almarai
  - GE Dinar One
  - Droid Arabic Kufi
  - Mada
  - وغيرها...
- ✅ اتجاه النص من اليمين إلى اليسار
- ✅ أرقام عربية

### 3️⃣ **قوالب جاهزة للزواجات**
```
- تقليدي إسلامي (الأحمر والذهبي)
- حديث أنيق (الرمادي والفضي)
- ذهبي فاخر (اللون الذهبي والأسود)
- وغيرها...
```

### 4️⃣ **تخصيص كامل**
- تغيير الألوان والخطوط
- إضافة صور وزخارف
- تغيير أحجام العناصر
- ترتيب الطبقات (Z-Index)
- دوران العناصر

---

## 📁 الملفات المضافة

### Frontend

#### `components/TemplateDesigner.tsx` (الرئيسي)
```typescript
// المكون الأساسي للمحرر
// المسؤول عن:
// - عرض لوحة التصميم
// - إدارة العناصر
// - معالجة المدخلات
// - حفظ التصاميم
```

#### `app/hooks/useTemplateDesigner.ts`
```typescript
// Hook مخصص لإدارة حالة المحرر
// يوفر:
// - إضافة/تحديث/حذف عناصر
// - حفظ وتحميل التصاميم
// - تحميل القوالب الجاهزة
// - معالجة الأخطاء
```

#### `components/ui/tabs.tsx`
```typescript
// مكون Tabs للملاحة بين الأقسام
// (المحرر - القوالب - المعرض)
```

#### `app/dashboard/events/[id]/design/page.tsx`
```typescript
// صفحة محرر التصاميم الرئيسية
// توفر:
// - واجهة التحرير
// - عرض القوالب
// - معرض التصاميم
```

### Backend

#### `app/api/templates/route.ts`
```typescript
// API endpoints للتصاميم
// GET    /api/templates - جلب التصاميم
// POST   /api/templates - إنشاء تصميم
// PUT    /api/templates - تحديث تصميم
// DELETE /api/templates - حذف تصميم
```

### Database

#### `DATABASE_MIGRATION_TEMPLATES.sql`
```sql
-- إنشاء جداول:
-- event_templates       : التصاميم المخصصة
-- template_presets      : القوالب الجاهزة
-- template_versions     : سجل التعديلات
-- template_images       : الصور المرفوعة
```

### Utils

#### `app/utils/templateSchema.ts`
```typescript
// Zod schemas للتحقق من البيانات
// - designElementSchema
// - templateSchema
// - presetTemplateSchema
// - قوائم الخطوط والألوان
```

---

## 🛠️ كيفية الاستخدام

### للمستخدم النهائي

#### 1. الوصول للمحرر
```
لوحة التحكم → الفعالية → كلمة "🎨 التصميم"
```

#### 2. اختيار طريقة البدء
```
- استخدام قالب جاهز
- أو البدء من صفحة فارغة
```

#### 3. تصميم التذكرة
```
① اختر "نص" من الأدوات
② انقر على لوحة التصميم
③ عدّل النص والخط والحجم
④ أضف صور وزخارف حسب الحاجة
⑤ احفظ التصميم
```

#### 4. حفظ واستخدام
```
الكود سيحفظ التصميم تلقائياً
ويطبقه على:
- التذاكر
- رسائل البريد
- الشهادات
```

---

## 👨‍💻 كيفية الاستخدام للمطورين

### 1. إعداد قاعدة البيانات

```bash
# 1. اذهب إلى Supabase SQL Editor
https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql

# 2. انسخ محتوى DATABASE_MIGRATION_TEMPLATES.sql
# 3. الصق وشغّل الـ SQL

# ✅ تم إنشاء الجداول والـ RLS Policies
```

### 2. استخدام الـ Hook

```typescript
'use client'

import useTemplateDesigner from '@/app/hooks/useTemplateDesigner'

export function MyDesigner({ eventId }: { eventId: string }) {
  const {
    elements,
    selectedElement,
    addElement,
    updateElement,
    deleteElement,
    saveTemplate,
  } = useTemplateDesigner({
    eventId,
    templateType: 'ticket',
  })

  // استخدام في الـ Component
}
```

### 3. استدعاء الـ API

```typescript
// إنشاء تصميم
const createTemplate = async (eventId, design) => {
  const res = await fetch('/api/templates', {
    method: 'POST',
    body: JSON.stringify({
      eventId,
      templateName: 'تصميم زفاف',
      templateType: 'ticket',
      elements: design.elements,
      backgroundColor: design.bgColor,
    }),
  })
  return res.json()
}

// تحديث تصميم
const updateTemplate = async (templateId, design) => {
  const res = await fetch('/api/templates', {
    method: 'PUT',
    body: JSON.stringify({
      templateId,
      templateName: 'تصميم محدّث',
      elements: design.elements,
    }),
  })
  return res.json()
}

// حذف تصميم
const deleteTemplate = async (templateId) => {
  const res = await fetch(`/api/templates?templateId=${templateId}`, {
    method: 'DELETE',
  })
  return res.json()
}
```

---

## 📊 قاعدة البيانات

### جدول `event_templates`

| الحقل | النوع | الوصف |
|------|-------|-------|
| `id` | UUID | معرّف فريد |
| `event_id` | UUID | معرّف الفعالية |
| `template_name` | VARCHAR | اسم التصميم |
| `template_type` | VARCHAR | النوع (ticket/email) |
| `elements` | JSONB | العناصر المصممة |
| `background_color` | VARCHAR | لون الخلفية |
| `preview_url` | TEXT | صورة معاينة |
| `created_at` | TIMESTAMP | تاريخ الإنشاء |
| `updated_at` | TIMESTAMP | تاريخ التحديث |

### جدول `template_presets`

| الحقل | النوع | الوصف |
|------|-------|-------|
| `id` | UUID | معرّف فريد |
| `name` | VARCHAR | اسم القالب |
| `category` | VARCHAR | التصنيف (wedding) |
| `design_json` | JSONB | التصميم الكامل |
| `colors` | JSONB | الألوان المستخدمة |
| `fonts` | JSONB | الخطوط المستخدمة |

---

## 🔒 الأمان

### RLS Policies

```sql
-- المستخدم يرى فقط تصاميم فعالياته
SELECT: owner_id = auth.uid()
UPDATE: owner_id = auth.uid()
DELETE: owner_id = auth.uid()

-- الجميع يرون القوالب العامة
SELECT: is_active = true
```

### Validation

```typescript
// جميع المدخلات تُتحقق بـ Zod
const designElement = designElementSchema.parse(input)
const template = templateSchema.parse(input)
```

---

## 🎨 أمثلة التخصيص

### إضافة خط عربي جديد

```typescript
// في templateSchema.ts
export const ARABIC_FONTS = [
  // ...موجود
  { name: 'خطك الجديد', value: 'Your Font Name' },
]
```

### إضافة قالب زفاف جديد

```sql
INSERT INTO template_presets (
  name, description, category, template_type, design_json, colors, fonts
) VALUES (
  'الزفاف الحديث',
  'تصميم حديث للأعراس',
  'wedding',
  'ticket',
  '{
    "background": "#ffffff",
    "border": {"color": "#FF69B4", "width": 3}
  }'::jsonb,
  '["#FF69B4", "#FFB6C1", "#FFFFFF"]'::jsonb,
  '["Cairo", "Almarai"]'::jsonb
)
```

### تطبيق التصميم على التذاكر

```typescript
// في send-email API
export async function applyTemplate(templateId, ticketData) {
  const template = await getTemplate(templateId)
  
  // دمج البيانات مع التصميم
  const html = renderTemplate(template.elements, ticketData)
  
  // إرسال البريد
  await resend.emails.send({
    html,
    to: ticketData.email,
  })
}
```

---

## 🚀 الخطوات التالية

### Phase 2 (أسبوع 2-3)
- [ ] Gallery - عرض الصور
- [ ] Email Scheduling
- [ ] QR Scanner History
- [ ] VIP System

### Phase 3 (أسبوع 4)
- [ ] Excel Import
- [ ] PDF Export
- [ ] Email Campaign

### Phase 4 (أسبوع 5+)
- [ ] Stripe Payment
- [ ] Live Dashboard
- [ ] Multi-Admin

---

## 📞 الدعم

### مشاكل شائعة

**س: التصميم لا يحفظ**
```
ج: تأكد من:
1. أن event_id صحيح
2. أن المستخدم مالك الفعالية
3. أن الجداول موجودة (شغّل الـ SQL)
```

**س: الخطوط العربية لا تظهر**
```
ج: تأكد من:
1. استخدام Google Fonts API
2. أن الخط مُضاف في ARABIC_FONTS
3. تحميل الخط قبل الاستخدام
```

**س: لا يمكن رفع صور**
```
ج: تأكد من:
1. تفعيل Supabase Storage
2. إضافة RLS policies
3. أن حجم الصورة < 5MB
```

---

## 📚 الموارد

- [Zod Validation](https://zod.dev)
- [Supabase Docs](https://supabase.com/docs)
- [React Best Practices](https://react.dev)
- [Typography.js](https://typographyjs.com)

---

**آخر تحديث**: 5 يناير 2026  
**الحالة**: ✅ جاهز للاستخدام

**التالي**: إضافة Gallery و Email Scheduling
