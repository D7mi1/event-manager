'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import {
  Plus, Calendar, Users, BarChart3, Clock,
  Settings, Zap, Bell, CheckCircle2, Crown,
  ArrowUpRight, Sparkles, Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SubscriptionTracker from '@/app/components/SubscriptionTracker';
import { Event, Attendee } from '@/types';
import { PLANS, type PlanId } from '@/lib/billing/plans';

// مكون التحميل الهيكلي
const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-8 w-64 bg-white/5 rounded-xl"></div>
      <div className="h-10 w-32 bg-white/5 rounded-xl"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-white/5 rounded-[2rem]"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 h-64 bg-white/5 rounded-[2.5rem]"></div>
      <div className="h-64 bg-white/5 rounded-[2.5rem]"></div>
    </div>
  </div>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [themeColor, setThemeColor] = useState('#C19D65');
  const [stats, setStats] = useState({
    activeEvents: 0,
    totalGuests: 0,
    confirmedGuests: 0,
    allEventsCount: 0
  });

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<PlanId>('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        setUserName(profile.full_name);
        if (profile.interest === 'business') setThemeColor('#3B82F6');
        // جلب الخطة الفعلية
        if (profile.plan_id && profile.plan_id in PLANS) {
          setCurrentPlanId(profile.plan_id as PlanId);
        }
        if (profile.subscription_status) {
          setSubscriptionStatus(profile.subscription_status);
        }
      }

      // جلب كل الفعاليات
      const { data: events } = await supabase
        .from('events')
        .select('*, attendees(status, created_at)')
        .order('date', { ascending: true }); // ترتيب تصاعدي (الأقرب أولاً)

      if (events) {
        const totalGuests = events.reduce((acc, e) => acc + (e.attendees?.length || 0), 0);
        const confirmed = events.reduce((acc, e: any) => acc + (e.attendees?.filter((a: Attendee) => a.status === 'confirmed').length || 0), 0);
        const active = events.filter(e => e.status === 'active').length;

        // محاكاة التنبيهات
        let allAttendees: any[] = [];
        events.forEach(e => {
          if (e.attendees) {
            e.attendees.forEach((a: any) => allAttendees.push({ ...a, eventName: e.name }));
          }
        });
        const recentActivity = allAttendees
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);

        setStats({ activeEvents: active, totalGuests, confirmedGuests: confirmed, allEventsCount: events.length });

        // ✅ التغيير هنا: نضع كل الفعاليات بدون قص (slice)
        setAllEvents(events);
        setNotifications(recentActivity);
      }

      setTimeout(() => setLoading(false), 800);
    };

    fetchData();
  }, []);

  const getDaysLeft = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    // إذا كان التاريخ في الماضي نعرض 0 أو رقم سالب
    return days;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-6 pt-24 pb-20 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto"><DashboardSkeleton /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-6 pt-24 pb-20 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black mb-1">مرحباً، <span style={{ color: themeColor }}>{userName}</span> 👋</h1>
            <p className="text-white/40 text-sm font-medium">
              لديك {stats.allEventsCount} فعاليات في سجلك.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/settings" aria-label="الإعدادات" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors relative">
              <Settings size={20} aria-hidden="true" />
            </Link>
            <button aria-label="التنبيهات" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors relative">
              <Bell size={20} aria-hidden="true" />
              {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
            </button>
            <Link href="/dashboard/events/new" style={{ backgroundColor: themeColor }} className="text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(193,157,101,0.3)]">
              <Plus size={18} /> إنشاء فعالية
            </Link>
          </div>
        </div>

        {/* 1. Stats Panorama */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0F0F12]/80 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-colors group">
            <Calendar className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">الفعاليات النشطة</p>
            <h3 className="text-3xl font-black mt-1">{stats.activeEvents}</h3>
          </div>
          <div className="bg-[#0F0F12]/80 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-colors group">
            <Users className="text-green-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">إجمالي الضيوف</p>
            <h3 className="text-3xl font-black mt-1">{stats.totalGuests}</h3>
          </div>
          <div className="bg-[#0F0F12]/80 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-colors group">
            <CheckCircle2 className="text-purple-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">نسبة التأكيد</p>
            <h3 className="text-3xl font-black mt-1">
              {stats.totalGuests > 0 ? Math.round((stats.confirmedGuests / stats.totalGuests) * 100) : 0}%
            </h3>
          </div>
          <div className="bg-gradient-to-br from-[#0F0F12] to-[#1A1A1D] border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group">
            <Crown className="text-[#C19D65] mb-4 group-hover:rotate-12 transition-transform" size={24} />
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">الباقة الحالية</p>
            <h3 className="text-lg font-black mt-1 text-[#C19D65]">{PLANS[currentPlanId].nameAr}</h3>
            {subscriptionStatus && subscriptionStatus !== 'active' && (
              <span className="text-[10px] text-amber-400 font-bold">
                {subscriptionStatus === 'canceled' ? 'ملغاة' : subscriptionStatus === 'past_due' ? 'متأخرة' : subscriptionStatus}
              </span>
            )}
            <div className="flex items-center gap-2 mt-2">
              {currentPlanId === 'free' ? (
                <Link href="/pricing" className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-bold">ترقية</Link>
              ) : (
                <Link href="/dashboard/settings?tab=billing" className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-bold">إدارة الاشتراك</Link>
              )}
              <span className="text-white/10">|</span>
              <Link href="/dashboard/settings?tab=billing" className="text-[10px] text-white/30 hover:text-white/50 transition-colors font-bold">الفوترة</Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 2. Left Column: All Events List */}
          <div className="lg:col-span-2 space-y-6">

            <h2 className="text-xl font-bold flex items-center gap-2"><Clock size={20} className="text-white/40" /> كل الفعاليات (للتعديل والإدارة)</h2>

            {/* ✅ الحاوية (Scrollable Container) */}
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {allEvents.length > 0 ? (
                allEvents.map((event) => {
                  const daysLeft = getDaysLeft(event.date);
                  const isPast = daysLeft < 0;

                  return (
                    <div key={event.id} className={`bg-[#0F0F12] border ${isPast ? 'border-white/5 opacity-60' : 'border-white/10'} rounded-[2.5rem] p-6 relative overflow-hidden shadow-xl group hover:border-white/20 transition-all`}>
                      {/* شريط ملون جانبي */}
                      <div className={`absolute right-0 top-0 h-full w-2 ${event.type === 'business' ? 'bg-blue-500' : 'bg-[#C19D65]'}`}></div>

                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 px-4">
                        <div>
                          <div className="flex gap-2 mb-3">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${event.type === 'business' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-[#C19D65]/10 text-[#C19D65] border-[#C19D65]/20'}`}>
                              {event.type === 'business' ? 'أعمال' : 'مناسبة اجتماعية'}
                            </span>

                            {/* حالة التاريخ */}
                            {isPast ? (
                              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-red-500/10 border border-red-500/10 text-red-400">
                                منتهية
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50">
                                {daysLeft} أيام متبقية
                              </span>
                            )}
                          </div>
                          <h3 className="text-2xl font-black mb-2">{event.name}</h3>
                          <div className="flex items-center gap-4 text-white/50 text-sm">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(event.date).toLocaleDateString('ar-SA')}</span>
                            <span className="flex items-center gap-1"><Users size={14} /> {event.guests_count || 0} ضيف</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Link href={`/dashboard/events/${event.id}`} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all flex items-center gap-2 border border-white/5">
                            إدارة وتعديل <ArrowUpRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-[#0F0F12] border border-dashed border-white/10 rounded-[2.5rem] p-8 text-center flex flex-col items-center justify-center h-[250px]">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20 mb-4"><Calendar size={32} /></div>
                  <h3 className="font-bold text-lg mb-1">القائمة فارغة</h3>
                  <p className="text-white/40 text-sm mb-6">لم تقم بإنشاء أي فعالية بعد.</p>
                  <Link href="/dashboard/events/new" className="text-[#C19D65] font-bold text-sm underline hover:text-white transition-colors">ابدأ الآن</Link>
                </div>
              )}
            </div>

            {/* Notifications Center */}
            {notifications.length > 0 && (
              <div className="bg-[#0F0F12] border border-white/5 rounded-[2rem] p-6 mt-8">
                <h3 className="text-sm font-bold text-white/50 mb-4 flex items-center gap-2"><Bell size={14} /> آخر النشاطات</h3>
                <div className="space-y-4">
                  {notifications.map((notif, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mt-1 shrink-0">
                        <Plus size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">انضمام ضيف جديد</p>
                        <p className="text-xs text-white/40">تم تسجيل <span className="text-white">{notif.name || 'ضيف'}</span> في فعالية {notif.eventName}</p>
                      </div>
                      <span className="mr-auto text-[10px] text-white/20">{new Date(notif.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Right Column: Subscription & Quick Templates */}
          <div className="space-y-6">

            <SubscriptionTracker />

            <h2 className="text-xl font-bold flex items-center gap-2"><Zap size={20} className="text-white/40" /> قوالب سريعة</h2>
            <div className="space-y-3">
              <button onClick={() => router.push('/dashboard/events/new?template=wedding')} className="w-full p-4 bg-[#0F0F12] border border-white/5 hover:border-[#C19D65]/50 hover:bg-[#C19D65]/5 rounded-2xl flex items-center gap-4 transition-all group text-right">
                <div className="w-12 h-12 rounded-xl bg-[#C19D65]/10 flex items-center justify-center text-[#C19D65] group-hover:scale-110 transition-transform"><Sparkles size={20} /></div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-[#C19D65] transition-colors">حفل زفاف ملكي</h4>
                  <p className="text-[10px] text-white/40 mt-1">قالب جاهز بعبارات ترحيبية رسمية وتصاميم ذهبية</p>
                </div>
              </button>

              <button onClick={() => router.push('/dashboard/events/new?template=conference')} className="w-full p-4 bg-[#0F0F12] border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-2xl flex items-center gap-4 transition-all group text-right">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform"><Briefcase size={20} /></div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-blue-500 transition-colors">مؤتمر تقني</h4>
                  <p className="text-[10px] text-white/40 mt-1">يشمل نموذج تسجيل الحضور، وطباعة البطاقات</p>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}