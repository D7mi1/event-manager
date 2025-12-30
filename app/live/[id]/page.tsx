'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import {
   Users, CheckCircle2, QrCode, Clock, Loader2,
   Activity, MapPin, Calendar
} from 'lucide-react';

interface PageProps {
   params: Promise<{ id: string }>;
}

export default function LivePage({ params }: PageProps) {
   const { id } = use(params);

   const [loading, setLoading] = useState(true);
   const [event, setEvent] = useState<any>(null);
   const [stats, setStats] = useState({
      total: 0,
      confirmed: 0,
      attended: 0,
      percentage: 0
   });
   const [recentArrivals, setRecentArrivals] = useState<any[]>([]);
   const [themeColor, setThemeColor] = useState('#C19D65');

   // Helper to calculate stats
   const updateStats = async () => {
      const { data: attendees } = await supabase.from('attendees').select('status, attended').eq('event_id', id);
      if (attendees) {
         const total = attendees.length;
         const confirmed = attendees.filter(a => a.status === 'confirmed').length;
         const attended = attendees.filter(a => a.attended).length;
         const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

         setStats({ total, confirmed, attended, percentage });
      }
   };

   // --- Fetch Initial Data ---
   useEffect(() => {
      const fetchData = async () => {
         // 1. Event Details
         const { data: eventData } = await supabase.from('events').select('*').eq('id', id).single();
         if (eventData) {
            setEvent(eventData);
            setThemeColor(eventData.type === 'business' ? '#3B82F6' : '#C19D65');
         }

         // 2. Initial Stats
         await updateStats();
         setLoading(false);
      };

      fetchData();

      // 3. Realtime Subscription (The Magic ✨)
      const channel = supabase
         .channel('live-stats')
         .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'attendees', filter: `event_id=eq.${id}` },
            async (payload) => {
               // عند حدوث أي تغيير (دخول ضيف، تسجيل جديد)، نحدث الإحصائيات
               await updateStats();

               // إذا تم تسجيل حضور شخص (Update attended = true)، نضيفه لقائمة الوصول الحديث
               if (payload.eventType === 'UPDATE' && payload.new.attended && !payload.old.attended) {
                  setRecentArrivals(prev => [payload.new, ...prev].slice(0, 5)); // Keep last 5
               }
            }
         )
         .subscribe();

      return () => { supabase.removeChannel(channel); };
   }, [id]); // updateStats depends on id which is already in dependency array



   if (loading) return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
         <Loader2 className="animate-spin mb-4" size={40} style={{ color: themeColor }} />
         <p className="text-sm opacity-50 tracking-widest uppercase">جاري الاتصال بالبث المباشر...</p>
      </div>
   );

   if (!event) return <div className="min-h-screen bg-black text-white flex items-center justify-center">الفعالية غير موجودة</div>;

   return (
      <div className="min-h-screen bg-black text-white font-sans overflow-hidden relative selection:bg-white/20" dir="rtl">

         {/* Background Ambience */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
         <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[var(--theme-color)] to-transparent opacity-10 pointer-events-none" style={{ '--theme-color': themeColor } as any}></div>

         {/* --- Header --- */}
         <div className="relative z-10 p-8 flex justify-between items-start border-b border-white/10 bg-black/50 backdrop-blur-md">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]"></div>
                  <span className="text-xs font-bold tracking-widest uppercase opacity-70">Live Dashboard</span>
               </div>
               <h1 className="text-4xl font-black tracking-tight">{event.name}</h1>
            </div>

            <div className="text-left opacity-60 text-sm hidden md:block">
               <div className="flex items-center gap-2 justify-end mb-1">
                  <Calendar size={14} />
                  <span>{new Date(event.date).toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
               </div>
               <div className="flex items-center gap-2 justify-end">
                  <MapPin size={14} />
                  <span>{event.location_name || 'موقع الفعالية'}</span>
               </div>
            </div>
         </div>

         {/* --- Main Stats Grid --- */}
         <div className="relative z-10 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1: Attended (Hero) */}
            <div className="lg:col-span-2 bg-[#121212] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
               <div className="absolute right-0 top-0 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-opacity group-hover:opacity-30" style={{ backgroundColor: themeColor }}></div>

               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4 opacity-70">
                     <QrCode size={20} />
                     <span className="text-sm font-bold uppercase tracking-wider">الحضور الفعلي</span>
                  </div>
                  <div className="flex items-end gap-4">
                     <span className="text-8xl font-black tracking-tighter leading-none" style={{ color: themeColor }}>
                        {stats.attended}
                     </span>
                     <span className="text-xl font-bold mb-4 opacity-50">/ {stats.total} ضيف</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-white/10 rounded-full mt-8 overflow-hidden">
                     <div
                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        style={{ width: `${stats.percentage}%`, backgroundColor: themeColor }}
                     ></div>
                  </div>
                  <p className="text-right text-xs mt-2 opacity-40">نسبة الحضور {stats.percentage}%</p>
               </div>
            </div>

            {/* Card 2: Total Registered */}
            <div className="bg-[#121212] border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-white/20 transition-colors">
               <div className="flex items-center justify-between opacity-70 mb-4">
                  <Users size={24} />
                  <span className="text-xs font-bold uppercase tracking-wider">المسجلين</span>
               </div>
               <span className="text-5xl font-black text-white">{stats.total}</span>
               <p className="text-xs text-white/40 mt-2">إجمالي قاعدة البيانات</p>
            </div>

            {/* Card 3: Pending */}
            <div className="bg-[#121212] border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-white/20 transition-colors">
               <div className="flex items-center justify-between opacity-70 mb-4">
                  <Clock size={24} />
                  <span className="text-xs font-bold uppercase tracking-wider">المتوقع وصولهم</span>
               </div>
               <span className="text-5xl font-black text-white">{Math.max(0, stats.total - stats.attended)}</span>
               <p className="text-xs text-white/40 mt-2">لم يتم تحضيرهم بعد</p>
            </div>
         </div>

         {/* --- Live Feed (Recent Arrivals) --- */}
         <div className="relative z-10 px-8 pb-8">
            <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Activity size={16} /> آخر الواصلين
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
               {recentArrivals.length > 0 ? recentArrivals.map((guest, idx) => (
                  <div key={guest.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-right fade-in duration-500 fill-mode-backwards" style={{ animationDelay: `${idx * 100}ms` }}>
                     <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 border border-green-500/20">
                        <CheckCircle2 size={16} />
                     </div>
                     <div className="overflow-hidden">
                        <p className="font-bold text-sm truncate">{guest.name}</p>
                        <p className="text-[10px] opacity-40">وصل للتو</p>
                     </div>
                  </div>
               )) : (
                  <div className="col-span-full py-8 text-center border border-dashed border-white/10 rounded-2xl text-white/20 text-sm">
                     بانتظار وصول أول ضيف...
                  </div>
               )}
            </div>
         </div>

      </div>
   );
}