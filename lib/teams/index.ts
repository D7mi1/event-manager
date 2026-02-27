/**
 * نظام فريق الفعالية - Event Teams
 * ====================================
 * يتيح لمنظم الفعالية دعوة أعضاء فريق (مصور، مستقبل، إلخ)
 * كل عضو يحصل على صلاحيات حسب دوره
 *
 * SQL Schema المطلوب في Supabase:
 *
 * ```sql
 * CREATE TABLE event_team_members (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
 *   user_id UUID REFERENCES auth.users(id),
 *   email VARCHAR(255) NOT NULL,
 *   role VARCHAR(50) NOT NULL DEFAULT 'viewer',
 *   status VARCHAR(20) NOT NULL DEFAULT 'invited',
 *   invited_by UUID NOT NULL REFERENCES auth.users(id),
 *   invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
 *   joined_at TIMESTAMP WITH TIME ZONE,
 *   UNIQUE(event_id, email)
 * );
 *
 * -- RLS
 * ALTER TABLE event_team_members ENABLE ROW LEVEL SECURITY;
 *
 * -- Owner can manage team
 * CREATE POLICY team_owner_manage ON event_team_members
 *   FOR ALL USING (
 *     event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
 *   );
 *
 * -- Team members can view their own record
 * CREATE POLICY team_member_view ON event_team_members
 *   FOR SELECT USING (user_id = auth.uid());
 * ```
 */

import type { Role } from '@/lib/permissions';

export type TeamMemberStatus = 'invited' | 'active' | 'removed';

export interface TeamMember {
  id: string;
  eventId: string;
  userId: string | null;
  email: string;
  role: Role;
  status: TeamMemberStatus;
  invitedBy: string;
  invitedAt: string;
  joinedAt: string | null;
}

export interface InviteTeamMemberInput {
  eventId: string;
  email: string;
  role: Role;
}

/**
 * قائمة الأدوار المتاحة مع أوصافها بالعربي
 */
export const TEAM_ROLES: { value: Role; label: string; description: string }[] = [
  {
    value: 'scanner',
    label: 'فريق الاستقبال',
    description: 'يمكنه فحص التذاكر ورؤية قائمة الحضور',
  },
  {
    value: 'viewer',
    label: 'مشاهد',
    description: 'يمكنه رؤية تفاصيل الفعالية وقائمة الحضور فقط',
  },
];

/**
 * التحقق من صلاحية المستخدم على فعالية
 * يُرجع الدور إذا كان له صلاحية، أو null
 */
export async function getUserEventRole(
  supabase: any,
  userId: string,
  eventId: string
): Promise<Role | null> {
  // 1. التحقق: هل هو صاحب الفعالية؟
  const { data: event } = await supabase
    .from('events')
    .select('user_id')
    .eq('id', eventId)
    .single();

  if (event?.user_id === userId) {
    return 'owner';
  }

  // 2. التحقق: هل هو عضو في الفريق؟
  const { data: member } = await supabase
    .from('event_team_members')
    .select('role, status')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (member) {
    return member.role as Role;
  }

  return null;
}
