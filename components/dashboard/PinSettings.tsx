'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase/client';
import { Settings, Lock, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/query-keys';
import { toast } from 'sonner';
import * as Sentry from '@sentry/nextjs';
import { PinUpdateFormSchema, type PinUpdateFormInput } from '@/lib/schemas';

export default function PinSettings({ eventId, currentPin }: { eventId: string, currentPin: string }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PinUpdateFormInput>({
    resolver: zodResolver(PinUpdateFormSchema),
    defaultValues: { newPin: currentPin },
  });

  const onSubmit = async (data: PinUpdateFormInput) => {
    try {
      const { error: updateError } = await supabase
        .from('events')
        .update({ pin_hash: data.newPin })
        .eq('id', eventId);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
      setIsEditing(false);
      toast.success('تم تحديث رمز الدخول بنجاح');
    } catch (err) {
      Sentry.captureException(err);
      toast.error('فشل التحديث، يرجى المحاولة لاحقاً');
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
          onClick={() => { setIsEditing(!isEditing); reset({ newPin: currentPin }); }}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
        >
          <Settings size={18} className="text-white/60" />
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 pt-6 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-2">
            <label className="text-[10px] text-white/30 mr-2">أدخل الرمز الجديد</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              {...register('newPin')}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '');
                e.target.value = cleaned;
                register('newPin').onChange(e);
              }}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 text-center text-2xl font-mono font-bold text-[#C19D65] focus:border-[#C19D65] outline-none transition-all"
              placeholder="0000"
            />
          </div>

          {errors.newPin && <p className="text-[10px] text-red-400 text-center font-bold">{errors.newPin.message}</p>}

          <div className="flex gap-2">
             <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[#C19D65] text-black rounded-xl font-black text-sm hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-[#C19D65]/10"
              >
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'حفظ التغيير'}
              </button>
              <button
                type="button"
                onClick={() => { setIsEditing(false); }}
                className="px-4 py-3 bg-white/5 text-white/60 rounded-xl text-sm font-bold hover:bg-white/10"
              >
                إلغاء
              </button>
          </div>
        </form>
      )}
    </div>
  );
}
