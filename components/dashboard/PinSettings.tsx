'use client';

import { useState } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { Settings, Lock, Loader2 } from 'lucide-react';
import { useSWRConfig } from 'swr'; // ✅ استيراد صحيح
import * as Sentry from '@sentry/nextjs'; 

export default function PinSettings({ eventId, currentPin }: { eventId: string, currentPin: string }) {
  // ✅ استدعاء الـ Hook داخل جسم المكون
  const { mutate } = useSWRConfig();

  const [isEditing, setIsEditing] = useState(false);
  const [newPin, setNewPin] = useState(currentPin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdatePin = async () => {
    if (newPin.length !== 4) {
      setError("يجب أن يتكون الرمز من 4 أرقام");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('events')
        .update({ pin: newPin })
        .eq('id', eventId);

      if (updateError) throw updateError;
      
      // ✅ تحديث الكاش فوراً لضمان مزامنة البيانات
      mutate(`event-${eventId}`); 
      setIsEditing(false);
      alert('تم تحديث رمز الدخول بنجاح! ✅');
    } catch (err) {
      Sentry.captureException(err);
      setError('فشل التحديث، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#18181B] p-6 rounded-[2rem] border border-white/10 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#C19D65]/10 rounded-xl flex items-center justify-center text-[#C19D65]">
             <Lock size={20} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">رمز الدخول (PIN)</p>
            <p className="text-xl font-mono font-black text-white tracking-[0.3em]">
              {isEditing ? '****' : currentPin}
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
        >
          <Settings size={18} className="text-white/60" />
        </button>
      </div>

      {isEditing && (
        <div className="mt-6 pt-6 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-2">
            <label className="text-[10px] text-white/30 mr-2">أدخل الرمز الجديد</label>
            <input 
              type="text" 
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 text-center text-2xl font-mono font-bold text-[#C19D65] focus:border-[#C19D65] outline-none transition-all"
              placeholder="0000"
            />
          </div>
          
          {error && <p className="text-[10px] text-red-400 text-center font-bold">{error}</p>}
          
          <div className="flex gap-2">
             <button 
                onClick={handleUpdatePin}
                disabled={loading || newPin.length < 4}
                className="flex-1 py-3 bg-[#C19D65] text-black rounded-xl font-black text-sm hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-[#C19D65]/10"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'حفظ التغيير'}
              </button>
              <button 
                onClick={() => {setIsEditing(false); setError(null);}}
                className="px-4 py-3 bg-white/5 text-white/60 rounded-xl text-sm font-bold hover:bg-white/10"
              >
                إلغاء
              </button>
          </div>
        </div>
      )}
    </div>
  );
}