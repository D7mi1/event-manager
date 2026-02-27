-- 🛠️ سيقوم هذا السكربت بإصلاح الفجوات بين الكود وقاعدة البيانات
-- التشغيل آمن (Idempotent) - لن يسبب أخطاء إذا كانت الأعمدة موجودة مسبقاً

-- 1. إضافة عمود `theme_color` في جدول `events` (لتخصيص ألوان التذاكر)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS theme_color VARCHAR(7) DEFAULT '#C19D65';

-- 2. إضافة عمود `regret_reason` في جدول `attendees` (لحفظ سبب الاعتذار عن الحضور)
ALTER TABLE attendees 
ADD COLUMN IF NOT EXISTS regret_reason TEXT;

-- 3. التأكد من أن `email` في `attendees` ليس إجبارياً (لأن بعض الضيوف نملك أرقامهم فقط)
ALTER TABLE attendees 
ALTER COLUMN email DROP NOT NULL;

-- 4. إضافة Indexes إضافية للأداء (تأكيد)
CREATE INDEX IF NOT EXISTS idx_events_theme_color ON events(theme_color);

-- 5. دعم ميزة الوايت ليبل (White Label) للمشتركين
-- هذا العمود سيتحكم في إخفاء "Powered by"
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS white_label BOOLEAN DEFAULT false;

