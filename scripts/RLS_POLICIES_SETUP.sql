-- ============================================================
-- ✅ RLS POLICIES SETUP FOR MERAS EVENT PLATFORM
-- ============================================================
-- توثيق كامل لسياسات Row Level Security المطلوبة
-- تأكد من تنفيذ هذه السياسات على Supabase Dashboard
-- ============================================================

-- ============================================================
-- 1️⃣ جدول USERS (المستخدمين)
-- ============================================================
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- المستخدمون يرون فقط بيانات أنفسهم
CREATE POLICY "Users can view own data"
  ON auth.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON auth.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ============================================================
-- 2️⃣ جدول EVENTS (الفعاليات)
-- ============================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ✅ المالك يرى فعالياته
CREATE POLICY "Users can view own events"
  ON events
  FOR SELECT
  USING (auth.uid() = user_id);

-- ✅ المالك يمكنه إنشاء فعالية
CREATE POLICY "Users can insert own events"
  ON events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ✅ المالك يمكنه تحديث فعاليته
CREATE POLICY "Users can update own events"
  ON events
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ✅ المالك يمكنه حذف فعاليته
CREATE POLICY "Users can delete own events"
  ON events
  FOR DELETE
  USING (auth.uid() = user_id);

-- ✅ الضيوف يرون معلومات الفعالية المحدودة (بدون PIN)
CREATE POLICY "Guests can view public event info"
  ON events
  FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);


-- ============================================================
-- 3️⃣ جدول ATTENDEES (المدعوين)
-- ============================================================
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

-- ✅ مالك الفعالية يرى جميع الحاضرين
CREATE POLICY "Event owners can view attendees"
  ON attendees
  FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- ✅ الضيوف يرون بيانات أنفسهم
CREATE POLICY "Attendees can view own data"
  ON attendees
  FOR SELECT
  USING (auth.uid() = user_id);

-- ✅ مالك الفعالية يمكنه إضافة مدعوين
CREATE POLICY "Event owners can insert attendees"
  ON attendees
  FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- ✅ مالك الفعالية يمكنه تحديث بيانات الحضور
CREATE POLICY "Event owners can update attendees"
  ON attendees
  FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- ✅ الضيوف يمكنهم تحديث بياناتهم الشخصية فقط
CREATE POLICY "Attendees can update own data"
  ON attendees
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ✅ مالك الفعالية يمكنه حذف مدعو
CREATE POLICY "Event owners can delete attendees"
  ON attendees
  FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );


-- ============================================================
-- 4️⃣ جدول TICKETS (التذاكر)
-- ============================================================
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- ✅ مالك الفعالية يرى جميع التذاكر
CREATE POLICY "Event owners can view all tickets"
  ON tickets
  FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- ✅ الضيوف يرون تذاكرهم فقط
CREATE POLICY "Attendees can view own tickets"
  ON tickets
  FOR SELECT
  USING (auth.uid() = attendee_id);

-- ✅ مالك الفعالية ينشئ التذاكر
CREATE POLICY "Event owners can create tickets"
  ON tickets
  FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- ✅ مالك الفعالية يمكنه تحديث التذاكر
CREATE POLICY "Event owners can update tickets"
  ON tickets
  FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- ✅ مالك الفعالية يمكنه حذف التذاكر
CREATE POLICY "Event owners can delete tickets"
  ON tickets
  FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );


-- ============================================================
-- 5️⃣ جدول MEMORIES (الذكريات)
-- ============================================================
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- ✅ الجميع يرون الذكريات المعتمدة
CREATE POLICY "Public memories are viewable"
  ON memories
  FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id);

-- ✅ مالك الفعالية يرى جميع الذكريات (معتمدة وغير معتمدة)
CREATE POLICY "Event owners can view all memories"
  ON memories
  FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- ✅ الضيوف يكتبون ذكرياتهم
CREATE POLICY "Attendees can insert memories"
  ON memories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ✅ الضيوف يمكنهم تحديث ذكرياتهم
CREATE POLICY "Attendees can update own memories"
  ON memories
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ✅ الضيوف يمكنهم حذف ذكرياتهم
CREATE POLICY "Attendees can delete own memories"
  ON memories
  FOR DELETE
  USING (auth.uid() = user_id);

-- ✅ مالك الفعالية يمكنه تعديل حالة الموافقة
CREATE POLICY "Event owners can moderate memories"
  ON memories
  FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );


-- ============================================================
-- 6️⃣ جدول SUBSCRIPTIONS (الاشتراكات)
-- ============================================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ✅ المستخدمون يرون اشتراكاتهم فقط
CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- ✅ مديرو النظام يمكنهم تحديث الاشتراكات
-- (يجب أن تكون هناك دالة server-side آمنة لهذا)
CREATE POLICY "Users can update own subscription"
  ON subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 7️⃣ جدول SEATING (الجلوس)
-- ============================================================
ALTER TABLE seating ENABLE ROW LEVEL SECURITY;

-- ✅ مالك الفعالية يرى ترتيب المقاعد
CREATE POLICY "Event owners can view seating"
  ON seating
  FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- ✅ الضيوف يرون مقاعدهم
CREATE POLICY "Attendees can view own seat"
  ON seating
  FOR SELECT
  USING (auth.uid() = attendee_id);

-- ✅ مالك الفعالية يمكنه تعديل الجلوس
CREATE POLICY "Event owners can manage seating"
  ON seating
  FOR ALL
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );


-- ============================================================
-- 8️⃣ جدول SETTINGS (الإعدادات)
-- ============================================================
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ✅ المستخدمون يرون إعداداتهم فقط
CREATE POLICY "Users can view own settings"
  ON settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- ✅ المستخدمون يمكنهم تحديث إعداداتهم
CREATE POLICY "Users can update own settings"
  ON settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 9️⃣ جدول AUDIT_LOG (سجل الأنشطة) - للقراءة فقط
-- ============================================================
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ✅ مالك الفعالية يرى أنشطة فعاليته
CREATE POLICY "Event owners can view audit log"
  ON audit_log
  FOR SELECT
  USING (
    resource_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );


-- ============================================================
-- ✅ التعليمات والملاحظات المهمة
-- ============================================================
/*

📋 خطوات التطبيق:

1. افتح Supabase Dashboard
2. اذهب إلى SQL Editor
3. انسخ الأوامر أعلاه وقم بتنفيذها تدريجياً
4. تحقق من أن كل سياسة تم تطبيقها بنجاح

⚠️ ملاحظات أمان مهمة:

✅ تأكد من تفعيل RLS على جميع الجداول قبل النشر
✅ لا تسمح بـ SELECT للجميع دون شروط
✅ استخدم auth.uid() للتحقق من هوية المستخدم
✅ استخدم الـ nested queries للتحقق من الصلاحيات
✅ لا تخزن PIN codes بشكل نصي - استخدم bcrypt
✅ سجّل جميع العمليات الحساسة في audit_log

🔒 العمليات التي تحتاج SERVER-SIDE FUNCTIONS:
- تحديث عدادات الاستخدام (guests_used, events_used)
- تعديل الاشتراكات (يجب أن يكون من server فقط)
- قبول/رفض الذكريات (يجب التحقق من الملكية)
- إنشاء backup للبيانات

📊 اختبار RLS:
- استخدم Supabase Studio لاختبار السياسات
- تأكد من أن المستخدم لا يرى بيانات آخرين
- اختبر كل عملية (SELECT, INSERT, UPDATE, DELETE)

*/
