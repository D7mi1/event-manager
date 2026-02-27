'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Mail,
  Shield,
  Loader2,
  Crown,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  inviteTeamMember,
  getTeamMembers,
  removeTeamMember,
  updateTeamMemberRole,
} from '@/app/actions/teamActions';
import type { TeamMember, InviteTeamMemberInput } from '@/lib/teams';
import { TEAM_ROLES } from '@/lib/teams';
import type { Role } from '@/lib/permissions';

// ——— Props ———

interface TeamManagerProps {
  eventId: string;
  isOwner: boolean;
}

// ——— Status helpers ———

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  invited: {
    label: 'مدعو',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
  },
  active: {
    label: 'نشط',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
  },
  removed: {
    label: 'تمت الإزالة',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.invited;
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

// ——— Component ———

export default function TeamManager({ eventId, isOwner }: TeamManagerProps) {
  // State
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>(TEAM_ROLES[0].value);

  // ——— Data fetching ———

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const result = await getTeamMembers(eventId);
    if (result.success) {
      setMembers(result.data);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // ——— Invite handler ———

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = inviteEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return;
    }

    setInviting(true);
    const input: InviteTeamMemberInput = {
      eventId,
      email: trimmedEmail,
      role: inviteRole,
    };

    const result = await inviteTeamMember(input);
    if (result.success) {
      toast.success('تم إرسال الدعوة بنجاح');
      setInviteEmail('');
      setInviteRole(TEAM_ROLES[0].value);
      await fetchMembers();
    } else {
      toast.error(result.error);
    }
    setInviting(false);
  };

  // ——— Remove handler ———

  const handleRemove = async (memberId: string) => {
    setRemovingId(memberId);
    const result = await removeTeamMember(eventId, memberId);
    if (result.success) {
      toast.success('تم إزالة العضو');
      setConfirmRemoveId(null);
      await fetchMembers();
    } else {
      toast.error(result.error);
    }
    setRemovingId(null);
  };

  // ——— Role update handler ———

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    setUpdatingRoleId(memberId);
    const result = await updateTeamMemberRole(eventId, memberId, newRole);
    if (result.success) {
      toast.success('تم تحديث الدور');
      await fetchMembers();
    } else {
      toast.error(result.error);
    }
    setUpdatingRoleId(null);
  };

  // ——— Date formatter ———

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  // ——— Render ———

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center text-[#3B82F6] border border-[#3B82F6]/20">
            <Users size={20} />
          </div>
          فريق العمل
        </h2>
        <span className="text-sm text-white/40">
          {members.length} {members.length === 1 ? 'عضو' : 'أعضاء'}
        </span>
      </div>

      {/* Invite Form - only for owners */}
      {isOwner && (
        <div className="bg-[#18181B] rounded-[2rem] border border-white/10 p-6">
          <h3 className="text-base font-bold text-[#C19D65] mb-4 flex items-center gap-2">
            <UserPlus size={18} />
            دعوة عضو جديد
          </h3>

          <form onSubmit={handleInvite} className="space-y-4">
            {/* Email input */}
            <div>
              <label className="block text-xs text-white/40 mb-2 font-bold">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-white/30 pointer-events-none"
                />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="example@email.com"
                  disabled={inviting}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pr-10 pl-4 outline-none focus:border-[#C19D65] text-white placeholder:text-white/20 text-sm disabled:opacity-50 transition-colors"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Role select */}
            <div>
              <label className="block text-xs text-white/40 mb-2 font-bold">
                الدور
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                disabled={inviting}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-[#C19D65] text-white text-sm appearance-none disabled:opacity-50 transition-colors"
              >
                {TEAM_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label} - {role.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="w-full bg-[#3B82F6] text-white font-bold py-3 rounded-xl hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {inviting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  إرسال الدعوة
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Members List */}
      <div className="bg-[#18181B] rounded-[2rem] border border-white/10 overflow-hidden">
        {/* List header */}
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shield size={18} className="text-[#C19D65]" />
            أعضاء الفريق
          </h3>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-white/40">
            <Loader2 className="animate-spin mb-3" size={28} />
            <p className="text-sm">جاري تحميل الفريق...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && members.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-white/30">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Users size={28} />
            </div>
            <p className="text-sm font-bold mb-1">لا يوجد أعضاء بعد</p>
            <p className="text-xs text-white/20">
              {isOwner
                ? 'ابدأ بدعوة أعضاء فريقك للفعالية'
                : 'لم يتم إضافة أعضاء فريق لهذه الفعالية'}
            </p>
          </div>
        )}

        {/* Members */}
        {!loading && members.length > 0 && (
          <div className="divide-y divide-white/5">
            {members.map((member) => (
              <div
                key={member.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
              >
                {/* Avatar / Icon */}
                <div className="w-10 h-10 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] shrink-0 border border-[#3B82F6]/20">
                  <Mail size={16} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p
                      className="text-sm font-bold text-white truncate"
                      dir="ltr"
                    >
                      {member.email}
                    </p>
                    <StatusBadge status={member.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/30">
                    <span className="flex items-center gap-1">
                      <Crown size={12} className="text-[#C19D65]" />
                      {TEAM_ROLES.find((r) => r.value === member.role)?.label ??
                        member.role}
                    </span>
                    <span>
                      دُعي في {formatDate(member.invitedAt)}
                    </span>
                  </div>
                </div>

                {/* Actions - only for owners */}
                {isOwner && (
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Role dropdown */}
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.id, e.target.value as Role)
                      }
                      disabled={updatingRoleId === member.id}
                      className="bg-black/40 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white outline-none focus:border-[#C19D65] appearance-none disabled:opacity-50 transition-colors"
                    >
                      {TEAM_ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>

                    {updatingRoleId === member.id && (
                      <Loader2
                        className="animate-spin text-[#3B82F6]"
                        size={16}
                      />
                    )}

                    {/* Remove button with confirmation */}
                    {confirmRemoveId === member.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRemove(member.id)}
                          disabled={removingId === member.id}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 disabled:opacity-50 transition-colors"
                        >
                          {removingId === member.id ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            'تأكيد'
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmRemoveId(null)}
                          className="px-3 py-1.5 bg-white/5 text-white/40 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRemoveId(member.id)}
                        className="p-2 rounded-lg bg-white/5 text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-colors border border-white/5 hover:border-red-500/20"
                        title="إزالة العضو"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Read-only notice for non-owners */}
      {!isOwner && (
        <p className="text-center text-xs text-white/20">
          عرض للقراءة فقط - يمكن لمنظم الفعالية فقط إدارة الفريق
        </p>
      )}
    </div>
  );
}
