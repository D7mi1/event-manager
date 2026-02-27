-- ============================================================================
-- Event Team Members Table - جدول فريق الفعالية
-- ============================================================================
--
-- الوصف / Description:
--   ينشئ جدول event_team_members الذي يسمح لمنظم الفعالية بدعوة أعضاء فريق
--   (مصور، مستقبل، إلخ) مع تحديد صلاحيات كل عضو حسب دوره.
--
--   Creates the event_team_members table that allows event organizers to invite
--   team members (photographer, receptionist, etc.) with role-based permissions.
--
-- طريقة التشغيل / How to Run:
--   1. افتح لوحة تحكم Supabase الخاصة بمشروعك
--      Open your Supabase project dashboard
--   2. اذهب إلى SQL Editor من القائمة الجانبية
--      Go to SQL Editor from the sidebar
--   3. انسخ محتوى هذا الملف بالكامل والصقه في المحرر
--      Copy the entire contents of this file and paste into the editor
--   4. اضغط "Run" لتنفيذ الاستعلام
--      Click "Run" to execute the query
--
-- ملاحظة / Note:
--   هذا السكربت آمن للتشغيل عدة مرات (Idempotent) - يستخدم IF NOT EXISTS
--   و DROP POLICY IF EXISTS لتجنب الأخطاء عند إعادة التشغيل.
--
--   This script is safe to run multiple times (idempotent) - it uses
--   IF NOT EXISTS and DROP POLICY IF EXISTS to avoid errors on re-run.
--
-- المرجع / Reference:
--   lib/teams/index.ts - TypeScript schema and team logic
-- ============================================================================


-- ============================================================================
-- 1. إنشاء الجدول / Create the Table
-- ============================================================================
-- الجدول الرئيسي لإدارة أعضاء فريق الفعالية
-- Main table for managing event team members

CREATE TABLE IF NOT EXISTS event_team_members (
  -- المعرف الفريد / Unique identifier
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- معرف الفعالية - يحذف السجلات تلقائياً عند حذف الفعالية
  -- Event ID - cascade deletes when event is removed
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- معرف المستخدم (يُملأ عند قبول الدعوة وتسجيل الدخول)
  -- User ID (filled when the invite is accepted and user is logged in)
  user_id UUID REFERENCES auth.users(id),

  -- البريد الإلكتروني للعضو المدعو
  -- Email of the invited team member
  email VARCHAR(255) NOT NULL,

  -- الدور: viewer, scanner, etc. (راجع lib/permissions)
  -- Role: viewer, scanner, etc. (see lib/permissions)
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',

  -- حالة العضوية: invited = تم الدعوة، active = قبل الدعوة، removed = تمت إزالته
  -- Membership status: invited = pending, active = accepted, removed = removed
  status VARCHAR(20) NOT NULL DEFAULT 'invited',

  -- من قام بالدعوة (صاحب الفعالية عادةً)
  -- Who sent the invitation (usually the event owner)
  invited_by UUID NOT NULL REFERENCES auth.users(id),

  -- وقت إرسال الدعوة
  -- When the invitation was sent
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- وقت قبول الدعوة (يبقى NULL حتى يقبل العضو)
  -- When the invitation was accepted (NULL until accepted)
  joined_at TIMESTAMP WITH TIME ZONE,

  -- منع تكرار دعوة نفس البريد لنفس الفعالية
  -- Prevent duplicate invitations for the same email on the same event
  UNIQUE(event_id, email)
);


-- ============================================================================
-- 2. تفعيل أمان الصفوف / Enable Row Level Security (RLS)
-- ============================================================================
-- RLS يضمن أن كل مستخدم يرى فقط البيانات المسموح له بها
-- RLS ensures each user can only access data they are authorized to see

ALTER TABLE event_team_members ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 3. سياسات الأمان / RLS Policies
-- ============================================================================

-- سياسة 1: صاحب الفعالية يمكنه فعل أي شيء بفريقه
-- Policy 1: Event owner can do everything with their event's team
-- (عرض، إضافة، تعديل، حذف أعضاء الفريق)
-- (select, insert, update, delete team members)
DROP POLICY IF EXISTS team_owner_all ON event_team_members;
CREATE POLICY team_owner_all ON event_team_members
  FOR ALL USING (
    event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
  );

-- سياسة 2: عضو الفريق يمكنه رؤية سجله الخاص فقط
-- Policy 2: Team member can only view their own membership record
DROP POLICY IF EXISTS team_member_select ON event_team_members;
CREATE POLICY team_member_select ON event_team_members
  FOR SELECT USING (user_id = auth.uid());


-- ============================================================================
-- 4. الفهارس لتحسين الأداء / Indexes for Performance
-- ============================================================================
-- هذه الفهارس تسرّع عمليات البحث الشائعة
-- These indexes speed up common query patterns

-- البحث بمعرف الفعالية (عرض فريق فعالية معينة)
-- Lookup by event ID (show team for a specific event)
CREATE INDEX IF NOT EXISTS idx_team_members_event_id
  ON event_team_members(event_id);

-- البحث بمعرف المستخدم (عرض الفعاليات التي ينتمي إليها المستخدم)
-- Lookup by user ID (show events a user is part of)
CREATE INDEX IF NOT EXISTS idx_team_members_user_id
  ON event_team_members(user_id);

-- البحث بالبريد الإلكتروني (التحقق من الدعوات عند تسجيل الدخول)
-- Lookup by email (check pending invitations on login)
CREATE INDEX IF NOT EXISTS idx_team_members_email
  ON event_team_members(email);


-- ============================================================================
-- 5. تحديثات جدول الملفات الشخصية / Profiles Table Updates
-- ============================================================================
-- إضافة أعمدة مطلوبة لنظام الاشتراكات والفوترة
-- Add columns needed for the subscription and billing system

-- نوع الخطة: free, pro, enterprise
-- Plan type: free, pro, enterprise
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_id VARCHAR(20) DEFAULT 'free';

-- اسم الشركة (للفواتير التجارية)
-- Company name (for business invoices)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);

-- الرقم الضريبي (للفواتير التجارية)
-- Tax number (for business invoices)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_number VARCHAR(50);

-- معرف الاشتراك في Polar
-- Polar subscription ID
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(100);

-- حالة الاشتراك: active, canceled, revoked, past_due
-- Subscription status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(30);

-- معرف العميل في Polar (للـ Customer Portal)
-- Polar customer ID (for Customer Portal access)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS polar_customer_id VARCHAR(100);

-- تاريخ نهاية فترة الاشتراك الحالية
-- Current subscription period end date
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMP WITH TIME ZONE;
