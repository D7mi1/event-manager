'use client';

import { useState } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { Settings, Lock, Copy, Check, Loader2 } from 'lucide-react';
import { useSWRConfig } from 'swr';
import * as Sentry from '@sentry/nextjs';

export default function ScannerAccessCard({ eventId, currentPin }: { eventId: string, currentPin: string }) {
  const { mutate } = useSWRConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [newPin, setNewPin] = useState(currentPin);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const scannerLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/scan/${eventId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scannerLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdatePin = async () => {
    // التحقق من المدخلات
    if (newPin.length !== 4) return;
    if (!eventId) {
      alert("خطأ: رقم الحفل غير موجود");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('events')
        .update({ pin: newPin })
        .eq('id', eventId.trim());

      if (error) throw error;

      // تحديث البيانات وعرض رسالة النجاح
      mutate(`event-${eventId}`);
      setIsEditing(false);
      alert('تم تحديث الرمز بنجاح ✅');

    } catch (err: any) {
      // تسجيل الخطأ في Sentry للمراقبة الخلفية
      Sentry.captureException(err);
      
      // عرض رسالة خطأ واضحة للمستخدم
      const msg = err.message || 'حدث خطأ غير متوقع';
      alert(`فشل التحديث: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#18181B] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col">
      
      {/* القسم العلوي: الرابط */}
      <div className="p-8 text-center bg-[#18181B] z-10 relative">
        <h3 className="font-bold text-lg mb-4 text-[#C19D65] flex items-center justify-center gap-2">
           رابط الماسح الضوئي
        </h3>
        <div className="p-4 bg-black/40 rounded-2xl mb-4 font-mono text-xs text-white/50 break-all border border-white/5 shadow-inner select-all dir-ltr">
          {scannerLink}
        </div>
        <button 
          onClick={handleCopy} 
          className="w-full py-4 bg-[#C19D65] text-black font-black rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C19D65]/10"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? 'تم النسخ' : 'نسخ رابط الـ Scanner'}
        </button>
      </div>

      {/* خط فاصل */}
      <div className="h-[1px] bg-white/5 w-full"></div>

      {/* القسم السفلي: الـ PIN */}
      <div className="p-6 bg-white/[0.02]">
        <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className={`p-3 rounded-2xl transition-all border ${isEditing ? 'bg-[#C19D65] text-black border-[#C19D65]' : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'}`}
            >
              <Settings size={20} />
            </button>

            <div className="flex flex-col items-end px-4">
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">رمز الدخول (PIN)</p>
              <div className="flex gap-2" dir="ltr">
                {(isEditing ? '****' : currentPin).split('').map((char, i) => (
                  <span key={i} className="w-8 h-10 bg-black/60 rounded-lg flex items-center justify-center font-mono text-xl font-black text-white border border-white/10 shadow-lg">
                    {char}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-12 h-12 bg-[#C19D65]/10 rounded-2xl flex items-center justify-center text-[#C19D65] border border-[#C19D65]/20">
              <Lock size={20} />
            </div>
        </div>

        {isEditing && (
          <div className="mt-6 pt-6 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
            <input 
              type="text" 
              inputMode="numeric" 
              maxLength={4} 
              value={newPin} 
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-black/60 border border-[#C19D65]/50 rounded-2xl py-4 text-center text-3xl font-mono font-bold text-[#C19D65] focus:border-[#C19D65] outline-none transition-all shadow-inner" 
              placeholder="0000" 
            />
            <button 
              onClick={handleUpdatePin} 
              disabled={loading || newPin.length < 4} 
              className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-200 disabled:opacity-50 shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'حفظ التحديث'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}