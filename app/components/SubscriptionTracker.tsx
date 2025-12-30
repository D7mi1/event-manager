'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { Crown, Zap, MessageCircle, Users, AlertTriangle, Lock, ArrowUpRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionTracker() {
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<any>(null);

  useEffect(() => {
    const fetchSub = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        // إذا لم يوجد سجل، نضع قيم افتراضية للباقة المجانية
        setSub(data || { 
          plan_tier: 'free', 
          guests_limit: 50, guests_used: 0,
          messages_limit: 0, messages_used: 0,
          renews_at: new Date(Date.now() + 30*24*60*60*1000).toISOString()
        });
      }
      setLoading(false);
    };
    fetchSub();
  }, []);

  if (loading) return <div className="h-48 bg-white/5 rounded-[2rem] animate-pulse"></div>;

  // حساب النسب المئوية
  const guestPercentage = Math.min((sub.guests_used / sub.guests_limit) * 100, 100);
  const isApproachingLimit = guestPercentage >= 80;
  const isFreePlan = sub.plan_tier === 'free';

  // تحديد اللون بناءً على الاستهلاك
  const getProgressColor = () => {
    if (guestPercentage >= 90) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    if (guestPercentage >= 75) return 'bg-orange-500';
    return 'bg-[#C19D65]'; // اللون الذهبي الافتراضي
  };

  return (
    <div className="bg-gradient-to-br from-[#1A1A1D] to-[#0F0F12] border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group">
      
      {/* خلفية جمالية */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C19D65]/5 rounded-full blur-[50px] pointer-events-none"></div>

      {/* رأس البطاقة */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2">
            <Zap size={18} className="text-[#C19D65]" />
            إحصائيات الباقة
          </h3>
          <p className="text-[10px] text-white/40 mt-1">
            تجديد الرصيد: {new Date(sub.renews_at).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/60">
          {sub.plan_tier === 'free' ? 'Personal Plan' : sub.plan_tier === 'pro' ? 'PRO Plan' : 'Developed'}
        </div>
      </div>

      {/* 1. عداد الضيوف (Guest Credits) */}
      <div className="mb-6 relative z-10">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-white/60 flex items-center gap-1"><Users size={12}/> رصيد الضيوف</span>
          <span className="text-white font-bold">{sub.guests_used} <span className="text-white/30">/ {sub.guests_limit}</span></span>
        </div>
        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${getProgressColor()}`} 
            style={{ width: `${guestPercentage}%` }}
          ></div>
        </div>
        
        {/* رسالة التنبيه الذكية (Upsell Trigger) */}
        {isApproachingLimit && isFreePlan && (
          <div className="mt-3 flex items-start gap-2 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
             <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
             <div>
               <p className="text-[10px] font-bold text-red-400 leading-tight">لقد اقتربت من الحد الأقصى!</p>
               <p className="text-[9px] text-red-400/60 mt-1">رقِ باقتك الآن لضمان دخول جميع ضيوفك بلا توقف.</p>
             </div>
             <Link href="/dashboard/settings" className="mr-auto text-[9px] bg-red-500 text-white px-2 py-1 rounded font-bold hover:bg-red-600">ترقية</Link>
          </div>
        )}
      </div>

      {/* 2. الرسائل (WhatsApp/SMS) - حالة القفل للباقة المجانية */}
      <div className={`relative p-4 rounded-xl border border-white/5 ${isFreePlan ? 'bg-white/[0.02]' : 'bg-transparent'}`}>
        
        {/* طبقة التعتيم (Blur Overlay) للباقة المجانية */}
        {isFreePlan && (
          <div className="absolute inset-0 backdrop-blur-[2px] bg-[#0A0A0C]/40 z-20 flex flex-col items-center justify-center rounded-xl transition-all group-hover:backdrop-blur-[1px]">
             <div className="bg-[#1A1A1D] p-2 rounded-full border border-white/10 mb-2 shadow-xl">
               <Lock size={14} className="text-[#C19D65]" />
             </div>
             <p className="text-[10px] font-bold text-white/80">ميزة باقة المحترفين</p>
             <p className="text-[9px] text-white/40">تفعيل رسائل الواتساب</p>
          </div>
        )}

        <div className="flex justify-between text-xs mb-2 opacity-60">
          <span className="flex items-center gap-1"><MessageCircle size={12}/> دعوات واتساب</span>
          <span>{sub.messages_used} / {sub.messages_limit || '∞'}</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden opacity-60">
           <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(sub.messages_used / (sub.messages_limit || 1)) * 100}%` }}></div>
        </div>
      </div>

      {/* زر الترقية العام */}
      {isFreePlan && (
        <Link 
          href="/dashboard/settings"
          className="mt-6 w-full py-3 bg-[#C19D65] hover:bg-[#b08d55] text-black rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-[0_4px_20px_rgba(193,157,101,0.2)]"
        >
          <Crown size={14} /> ترقية الحساب بالكامل
        </Link>
      )}

    </div>
  );
}