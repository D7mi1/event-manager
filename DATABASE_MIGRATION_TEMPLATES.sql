/**
 * SQL Migration for Template Designer System
 * 
 * تشغيل هذا في Supabase SQL Editor:
 * https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql/new
 */

-- 1. جدول القوالب المخصصة للفعاليات
CREATE TABLE IF NOT EXISTS event_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  template_name VARCHAR(50) NOT NULL,
  template_type VARCHAR(20) NOT NULL, -- 'ticket', 'email', 'certificate', 'invitation'
  template_category VARCHAR(20) NOT NULL, -- 'wedding', 'corporate', 'birthday', 'other'
  
  -- Design dimensions
  width INTEGER DEFAULT 400,
  height INTEGER DEFAULT 600,
  background_color VARCHAR(7) DEFAULT '#ffffff',
  background_image_url TEXT,
  
  -- Design elements (JSON)
  elements JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  preview_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT event_templates_event_id_fk FOREIGN KEY (event_id) REFERENCES events(id)
);

-- 2. جدول القوالب المدمجة (Presets)
CREATE TABLE IF NOT EXISTS template_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(20) NOT NULL, -- 'wedding', 'corporate', 'birthday'
  template_type VARCHAR(20) NOT NULL, -- 'ticket', 'email', 'certificate'
  
  -- Design JSON
  design_json JSONB NOT NULL,
  thumbnail_url TEXT,
  
  -- Styling
  colors JSONB DEFAULT '[]'::jsonb,
  fonts JSONB DEFAULT '[]'::jsonb,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(name, category)
);

-- 3. جدول سجل التعديلات
CREATE TABLE IF NOT EXISTS template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES event_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  
  -- Previous state
  elements_before JSONB,
  elements_after JSONB,
  
  changed_by UUID REFERENCES auth.users(id),
  change_description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. جدول الصور المرفوعة
CREATE TABLE IF NOT EXISTS template_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES event_templates(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  image_url TEXT NOT NULL,
  image_name VARCHAR(255),
  file_size INTEGER,
  
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Indexes للأداء
CREATE INDEX idx_event_templates_event_id ON event_templates(event_id);
CREATE INDEX idx_event_templates_template_type ON event_templates(template_type);
CREATE INDEX idx_template_presets_category ON template_presets(category);
CREATE INDEX idx_template_versions_template_id ON template_versions(template_id);
CREATE INDEX idx_template_images_template_id ON template_images(template_id);

-- 6. RLS Policies

-- للمستخدم: يرى فقط قوالب فعالياته
CREATE POLICY "Users see their own event templates"
  ON event_templates
  FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    )
  );

-- يمكن تحديث قوالس فعالياته فقط
CREATE POLICY "Users update own templates"
  ON event_templates
  FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    )
  );

-- يمكن حذف قوالس فعالياته فقط
CREATE POLICY "Users delete own templates"
  ON event_templates
  FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    )
  );

-- الجميع يرى القوالب العامة
CREATE POLICY "Everyone sees public presets"
  ON template_presets
  FOR SELECT
  USING (is_active = true);

-- Enable RLS
ALTER TABLE event_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_images ENABLE ROW LEVEL SECURITY;

-- Triggers للـ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_templates_updated_at
  BEFORE UPDATE ON event_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert preset templates
INSERT INTO template_presets (name, description, category, template_type, design_json, thumbnail_url, colors, fonts, is_active)
VALUES
  (
    'Traditional Islamic Wedding',
    'تصميم زفاف إسلامي تقليدي فاخر',
    'wedding',
    'ticket',
    '{
      "background": "#ffffff",
      "border": {"color": "#8B0000", "width": 5},
      "pattern": "islamic"
    }'::jsonb,
    'https://via.placeholder.com/200x300?text=Traditional+Islamic',
    '["#8B0000", "#FFD700", "#FFFFFF"]'::jsonb,
    '["GE Dinar One", "Droid Arabic Naskh"]'::jsonb,
    true
  ),
  (
    'Modern Elegant Wedding',
    'تصميم زفاف حديث أنيق',
    'wedding',
    'ticket',
    '{
      "background": "#f5f5f5",
      "border": {"color": "#2F4F4F", "width": 3},
      "style": "minimal"
    }'::jsonb,
    'https://via.placeholder.com/200x300?text=Modern+Elegant',
    '["#2F4F4F", "#C0C0C0", "#FFFFFF"]'::jsonb,
    '["Cairo", "Almarai"]'::jsonb,
    true
  ),
  (
    'Luxury Gold Wedding',
    'ذهبي فاخر',
    'wedding',
    'ticket',
    '{
      "background": "#2F4F4F",
      "accent": "#D4AF37",
      "style": "luxury"
    }'::jsonb,
    'https://via.placeholder.com/200x300?text=Luxury+Gold',
    '["#D4AF37", "#2F4F4F", "#FFFFFF"]'::jsonb,
    '["GE Dinar One", "Droid Arabic Kufi"]'::jsonb,
    true
  );
