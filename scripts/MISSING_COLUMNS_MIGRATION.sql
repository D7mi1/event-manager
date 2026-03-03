-- ============================================
-- Migration: إضافة الأعمدة الناقصة من قاعدة البيانات
-- ============================================
-- شغّل هذا في Supabase SQL Editor
-- هذه الأعمدة مستخدمة في الكود لكنها غير موجودة في DB الحالي
-- تاريخ الإنشاء: 2026-03-03
-- ============================================

-- ============================================
-- 1. جدول events - أعمدة ناقصة
-- ============================================

-- وصف الفعالية (صفحة التعديل)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS description TEXT;

-- وقت الفعالية (صفحة التعديل)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS event_time TEXT;

-- اسم المنظم (صفحة إنشاء فعالية جديدة)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS organizer_name TEXT;

-- السماح بالدخول المتعدد (صفحة التعديل)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS allow_multiple_entry BOOLEAN DEFAULT FALSE;

-- ============================================
-- 2. جدول attendees - أعمدة ناقصة
-- ============================================

-- تصنيف الضيف (لوحة التحكم + التصميم)
-- القيم: 'GENERAL', 'VIP', 'FAMILY'
ALTER TABLE public.attendees
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'GENERAL';

-- ============================================
-- 3. جدول memories - تعديل القيد
-- ============================================

-- image_url حالياً NOT NULL لكن ذكريات النص لا تحتاج صورة
-- نجعلها nullable لدعم الذكريات النصية فقط
ALTER TABLE public.memories
ALTER COLUMN image_url DROP NOT NULL;

-- تعيين قيمة افتراضية للسجلات القادمة بدون صورة
ALTER TABLE public.memories
ALTER COLUMN image_url SET DEFAULT '';

-- ============================================
-- 4. التحقق من النتائج
-- ============================================

-- تحقق من أن الأعمدة أُضيفت بنجاح
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'events' AND column_name IN ('description', 'event_time', 'organizer_name', 'allow_multiple_entry'))
    OR (table_name = 'attendees' AND column_name = 'category')
    OR (table_name = 'memories' AND column_name = 'image_url')
  )
ORDER BY table_name, column_name;

-- ============================================
-- ملاحظات مهمة:
-- ============================================
--
-- ✅ تم إصلاح الكود ليطابق أسماء الأعمدة الموجودة:
--    - events.pin_hash (الكود كان يستخدم pin)
--    - events.location_link (الكود كان يستخدم map_link)
--    - memories.guest_id (الكود كان يستخدم attendee_id)
--    - attendees.attended_at (الكود كان يستخدم check_in_time)
--
-- ⏳ هذا الـ migration يُضيف أعمدة جديدة مطلوبة للميزات التالية:
--    - صفحة تعديل الفعالية (description, event_time, allow_multiple_entry)
--    - صفحة إنشاء فعالية (organizer_name)
--    - تصنيف الضيوف في لوحة التحكم (category)
--    - ذكريات نصية بدون صور (memories.image_url nullable)
--
-- ⚠️ شغّل هذا الـ SQL قبل استخدام هذه الميزات
