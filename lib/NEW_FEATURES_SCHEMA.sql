-- ==========================================
-- مِراس - جداول الميزات التنافسية الجديدة
-- ==========================================
-- شغّل هذا في Supabase SQL Editor

-- ==========================================
-- 1. جدول الاستبيانات
-- ==========================================
CREATE TABLE IF NOT EXISTS surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- فهرس للبحث بالفعالية
CREATE INDEX IF NOT EXISTS idx_surveys_event_id ON surveys(event_id);
CREATE INDEX IF NOT EXISTS idx_surveys_user_id ON surveys(user_id);

-- RLS
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

-- المالك يقدر يقرأ/يكتب
CREATE POLICY "Users manage own surveys" ON surveys
  FOR ALL USING (auth.uid() = user_id);

-- أي شخص يقدر يقرأ الاستبيانات النشطة (للرابط العام)
CREATE POLICY "Anyone can read active surveys" ON surveys
  FOR SELECT USING (is_active = true);

-- ==========================================
-- 2. جدول ردود الاستبيانات
-- ==========================================
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  attendee_id UUID REFERENCES attendees(id) ON DELETE SET NULL,
  attendee_name TEXT,
  answers JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);

-- RLS
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- أي شخص يقدر يضيف رد (لا يتطلب تسجيل دخول)
CREATE POLICY "Anyone can submit survey response" ON survey_responses
  FOR INSERT WITH CHECK (true);

-- المالك يقدر يقرأ الردود (عبر join مع surveys)
CREATE POLICY "Survey owners read responses" ON survey_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = survey_responses.survey_id
      AND surveys.user_id = auth.uid()
    )
  );

-- ==========================================
-- 3. جدول اشتراكات Push Notifications
-- ==========================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_event_id ON push_subscriptions(event_id);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 4. تحديث profiles لإضافة حقول الاشتراك (إذا لم تكن موجودة)
-- ==========================================
DO $$
BEGIN
  -- إضافة حقل plan_id إذا لم يكن موجوداً
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'plan_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN plan_id TEXT DEFAULT 'free';
  END IF;

  -- إضافة حقل subscription_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_id TEXT;
  END IF;

  -- إضافة حقل subscription_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_status TEXT;
  END IF;

  -- إضافة حقل polar_customer_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'polar_customer_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN polar_customer_id TEXT;
  END IF;

  -- إضافة حقل subscription_period_end
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_period_end'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_period_end TIMESTAMPTZ;
  END IF;
END $$;
