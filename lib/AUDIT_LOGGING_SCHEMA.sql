/**
 * 🗄️ Audit Logging Database Schema
 * 
 * SQL statements to create audit logging tables in Supabase PostgreSQL
 * 
 * تشغيل هذه الـ statements في Supabase SQL Editor
 */

-- ============================================
-- 1. Create audit_logs table
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES public.attendees(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failure', 'suspicious')),
  details JSONB DEFAULT NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. Create indexes for better query performance
-- ============================================

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_event_id_idx ON public.audit_logs(event_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_status_idx ON public.audit_logs(status);
CREATE INDEX IF NOT EXISTS audit_logs_ip_address_idx ON public.audit_logs(ip_address);

-- ============================================
-- 3. Create alerts table
-- ============================================

CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_name VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  related_audit_log_id UUID REFERENCES public.audit_logs(id) ON DELETE CASCADE,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 4. Create indexes for alerts
-- ============================================

CREATE INDEX IF NOT EXISTS alerts_created_at_idx ON public.alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS alerts_severity_idx ON public.alerts(severity);
CREATE INDEX IF NOT EXISTS alerts_rule_name_idx ON public.alerts(rule_name);
CREATE INDEX IF NOT EXISTS alerts_is_acknowledged_idx ON public.alerts(is_acknowledged);

-- ============================================
-- 5. Row Level Security (RLS) Policies
-- ============================================

-- تفعيل RLS على audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: يمكن فقط للـ admins رؤية audit logs
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: تطبيق يمكنها إنشاء audit logs
CREATE POLICY "audit_logs_insert_service" ON public.audit_logs
  FOR INSERT
  WITH CHECK (true); -- السماح للـ service بالإدراج

-- تفعيل RLS على alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Policy: يمكن فقط للـ admins رؤية alerts
CREATE POLICY "alerts_admin_only" ON public.alerts
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 6. Audit trigger function
-- ============================================

CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    action,
    user_id,
    status,
    details
  ) VALUES (
    TG_TABLE_NAME || '_' || TG_OP,
    auth.uid(),
    'success',
    jsonb_build_object(
      'old_record', to_jsonb(OLD),
      'new_record', to_jsonb(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. Functions for audit log queries
-- ============================================

-- دالة للحصول على آخر activity لـ user معين
CREATE OR REPLACE FUNCTION get_user_activity(p_user_id UUID, p_limit INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  action VARCHAR,
  status VARCHAR,
  created_at TIMESTAMP,
  details JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT al.id, al.action, al.status, al.created_at, al.details
  FROM public.audit_logs al
  WHERE al.user_id = p_user_id
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- دالة للحصول على suspicious activity
CREATE OR REPLACE FUNCTION get_suspicious_activity(p_minutes INT DEFAULT 60)
RETURNS TABLE (
  id UUID,
  action VARCHAR,
  user_id UUID,
  ip_address INET,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT al.id, al.action, al.user_id, al.ip_address, al.created_at
  FROM public.audit_logs al
  WHERE al.status = 'suspicious'
    AND al.created_at > NOW() - (p_minutes || ' minutes')::INTERVAL
  ORDER BY al.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- دالة للحصول على failed attempts
CREATE OR REPLACE FUNCTION get_failed_attempts(p_action VARCHAR, p_minutes INT DEFAULT 30)
RETURNS TABLE (
  ip_address INET,
  attempt_count INT,
  last_attempt TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT al.ip_address, COUNT(*)::INT, MAX(al.created_at)
  FROM public.audit_logs al
  WHERE al.action = p_action
    AND al.status = 'failure'
    AND al.created_at > NOW() - (p_minutes || ' minutes')::INTERVAL
  GROUP BY al.ip_address
  ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. Grant permissions
-- ============================================

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.alerts TO authenticated;

-- ============================================
-- Notes:
-- ============================================

/*
تعليمات الاستخدام:

1. نسخ جميع الـ SQL statements أعلاه

2. افتح Supabase Dashboard

3. اذهب إلى SQL Editor

4. اختر قاعدة البيانات الخاصة بك

5. الصق الـ statements وشغّلها

6. تحقق من الـ Tables:
   - audit_logs
   - alerts

7. استخدم في التطبيق:
   import { auditLogger } from '@/lib/audit-logger';
   
   await auditLogger.logSuccess('action_name', {
     userId: 'user-id',
     ipAddress: 'ip-address'
   });

8. لمراجعة السجلات:
   - ادخل Supabase Dashboard
   - اذهب إلى audit_logs table
   - صفّي حسب الـ action أو status

9. للحصول على الإحصائيات:
   SELECT action, status, COUNT(*) as count
   FROM public.audit_logs
   WHERE created_at > NOW() - INTERVAL '24 hours'
   GROUP BY action, status;
*/
