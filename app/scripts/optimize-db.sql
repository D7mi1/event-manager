-- 🚀 تحسين أداء قاعدة البيانات (Database Optimization)

-- 1. تسريع البحث عن الضيوف داخل فعالية معينة (أهم Index)
CREATE INDEX IF NOT EXISTS idx_attendees_event_id ON attendees(event_id);

-- 2. تسريع البحث برقم الجوال (للمنع من التكرار وتسجيل الدخول)
CREATE INDEX IF NOT EXISTS idx_attendees_phone ON attendees(phone);

-- 3. تسريع البحث بحالة الحضور (للفلترة في الداشبورد)
CREATE INDEX IF NOT EXISTS idx_attendees_status ON attendees(status);

-- 4. تسريع البحث عن المقاعد (إذا تم استخدامها مستقبلاً)
CREATE INDEX IF NOT EXISTS idx_seats_attendee_id ON seats(attendee_id);
CREATE INDEX IF NOT EXISTS idx_seats_table_id ON seats(table_id);

-- 5. تسريع البحث عن الذكريات (Memories)
-- 6. تسريع البحث بالبريد الإلكتروني (مهم للتحقق من التكرار أو البحث)
CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email);

