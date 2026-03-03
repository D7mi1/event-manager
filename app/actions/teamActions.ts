'use server';

import { createClient } from '@/lib/supabase/server';
import { type ActionResult, withAuthAction, actionError, actionSuccess, actionOk } from '@/lib/actions/action-result';
import type { InviteTeamMemberInput, TeamMember } from '@/lib/teams';
import type { Role } from '@/lib/permissions';

/**
 * دعوة عضو جديد لفريق الفعالية
 */
export async function inviteTeamMember(
  input: InviteTeamMemberInput
): Promise<ActionResult<{ id: string }>> {
  return withAuthAction(async (userId) => {
    const supabase = await createClient();

    // 1. التحقق من أن المستخدم هو صاحب الفعالية
    const { data: event } = await supabase
      .from('events')
      .select('id, user_id, name')
      .eq('id', input.eventId)
      .single();

    if (!event) throw new Error('الفعالية غير موجودة');
    if (event.user_id !== userId) throw new Error('ليس لديك صلاحية لدعوة أعضاء');

    // 2. التحقق من أن العضو غير مدعو مسبقاً
    const { data: existing } = await supabase
      .from('event_team_members')
      .select('id, status')
      .eq('event_id', input.eventId)
      .eq('email', input.email.toLowerCase())
      .single();

    if (existing && existing.status !== 'removed') {
      throw new Error('هذا البريد مدعو مسبقاً لهذه الفعالية');
    }

    // 3. إنشاء الدعوة
    const { data: member, error } = await supabase
      .from('event_team_members')
      .upsert({
        event_id: input.eventId,
        email: input.email.toLowerCase(),
        role: input.role,
        status: 'invited',
        invited_by: userId,
        invited_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw new Error('فشل إنشاء الدعوة: ' + error.message);

    return { id: member.id };
  });
}

/**
 * جلب أعضاء فريق فعالية
 */
export async function getTeamMembers(
  eventId: string
): Promise<ActionResult<TeamMember[]>> {
  return withAuthAction(async (userId) => {
    const supabase = await createClient();

    // التحقق من صلاحية الوصول
    const { data: event } = await supabase
      .from('events')
      .select('user_id')
      .eq('id', eventId)
      .single();

    if (!event) throw new Error('الفعالية غير موجودة');
    if (event.user_id !== userId) throw new Error('ليس لديك صلاحية');

    const { data: members, error } = await supabase
      .from('event_team_members')
      .select('*')
      .eq('event_id', eventId)
      .neq('status', 'removed')
      .order('invited_at', { ascending: false });

    if (error) throw new Error('فشل جلب الأعضاء');

    return (members || []).map((m: any) => ({
      id: m.id,
      eventId: m.event_id,
      userId: m.user_id,
      email: m.email,
      role: m.role as Role,
      status: m.status,
      invitedBy: m.invited_by,
      invitedAt: m.invited_at,
      joinedAt: m.joined_at,
    }));
  });
}

/**
 * إزالة عضو من فريق الفعالية
 */
export async function removeTeamMember(
  eventId: string,
  memberId: string
): Promise<ActionResult<void>> {
  return withAuthAction(async (userId) => {
    const supabase = await createClient();

    // التحقق من الصلاحية
    const { data: event } = await supabase
      .from('events')
      .select('user_id')
      .eq('id', eventId)
      .single();

    if (!event || event.user_id !== userId) {
      throw new Error('ليس لديك صلاحية');
    }

    const { error } = await supabase
      .from('event_team_members')
      .update({ status: 'removed' })
      .eq('id', memberId)
      .eq('event_id', eventId);

    if (error) throw new Error('فشل إزالة العضو');

    return undefined as void;
  });
}

/**
 * تغيير دور عضو في الفريق
 */
export async function updateTeamMemberRole(
  eventId: string,
  memberId: string,
  newRole: Role
): Promise<ActionResult<void>> {
  return withAuthAction(async (userId) => {
    const supabase = await createClient();

    const { data: event } = await supabase
      .from('events')
      .select('user_id')
      .eq('id', eventId)
      .single();

    if (!event || event.user_id !== userId) {
      throw new Error('ليس لديك صلاحية');
    }

    const { error } = await supabase
      .from('event_team_members')
      .update({ role: newRole })
      .eq('id', memberId)
      .eq('event_id', eventId);

    if (error) throw new Error('فشل تحديث الدور');

    return undefined as void;
  });
}
