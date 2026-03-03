'use client';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEventStore } from '@/lib/stores/eventStore';
import { X, MessageCircle, Save, MapPin, Bell, Loader2 } from 'lucide-react';
import { MessageConfigFormSchema, type MessageConfigFormInput } from '@/lib/schemas';

export function MessageConfigModal() {
  const { isMessageModalOpen, toggleMessageModal, messageSettings, updateMessageSettings } = useEventStore();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { isSubmitting },
  } = useForm<MessageConfigFormInput>({
    resolver: zodResolver(MessageConfigFormSchema),
    defaultValues: messageSettings,
  });

  // تحديث القيم عند فتح المودال
  useEffect(() => {
    if (isMessageModalOpen) {
      reset(messageSettings);
    }
  }, [messageSettings, isMessageModalOpen, reset]);

  if (!isMessageModalOpen) return null;

  const reminderEnabled = watch('reminder.enabled');
  const locationEnabled = watch('location.enabled');

  const onSubmit = async (data: MessageConfigFormInput) => {
    await updateMessageSettings(data);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#18181B] w-full max-w-lg rounded-3xl border border-white/10 p-6 animate-in zoom-in relative shadow-2xl">
        <button onClick={() => toggleMessageModal(false)} className="absolute top-4 left-4 text-white/40 hover:text-white"><X size={20}/></button>

        <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
          <MessageCircle className="text-[#C19D65]" size={20}/> تخصيص الرسائل
        </h3>
        <p className="text-xs text-white/40 mb-6">تحكم في الرسائل التلقائية التي تصل للضيوف</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* 1. رسالة قبل 24 ساعة */}
          <div className={`p-4 rounded-2xl border transition-all ${reminderEnabled ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5 opacity-50'}`}>
            <div className="flex justify-between items-center mb-3">
               <div className="flex items-center gap-2">
                  <Bell size={16} className={reminderEnabled ? "text-[#C19D65]" : "text-gray-500"}/>
                  <label className="text-sm font-bold text-white">رسالة التذكير (قبل 24 ساعة)</label>
               </div>

               <Controller
                 name="reminder.enabled"
                 control={control}
                 render={({ field }) => (
                   <button
                     type="button"
                     onClick={() => field.onChange(!field.value)}
                     className={`w-10 h-6 rounded-full flex items-center p-1 transition-all ${field.value ? 'bg-[#C19D65]' : 'bg-white/10'}`}
                   >
                     <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${field.value ? 'translate-x-0' : '-translate-x-4'}`}></div>
                   </button>
                 )}
               />
            </div>

            {reminderEnabled && (
               <textarea
                 rows={3}
                 {...register('reminder.text')}
                 className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-[#C19D65] text-white placeholder-white/20"
                 placeholder="اكتب نص الرسالة هنا..."
               />
            )}
            {!reminderEnabled && <p className="text-xs text-white/30 italic">هذه الرسالة معطلة ولن يتم إرسالها.</p>}
          </div>

          {/* 2. رسالة قبل 1 ساعة */}
          <div className={`p-4 rounded-2xl border transition-all ${locationEnabled ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5 opacity-50'}`}>
            <div className="flex justify-between items-center mb-3">
               <div className="flex items-center gap-2">
                  <MapPin size={16} className={locationEnabled ? "text-green-500" : "text-gray-500"}/>
                  <label className="text-sm font-bold text-white">رسالة الوصول (قبل 1 ساعة)</label>
               </div>

               <Controller
                 name="location.enabled"
                 control={control}
                 render={({ field }) => (
                   <button
                     type="button"
                     onClick={() => field.onChange(!field.value)}
                     className={`w-10 h-6 rounded-full flex items-center p-1 transition-all ${field.value ? 'bg-green-500' : 'bg-white/10'}`}
                   >
                     <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${field.value ? 'translate-x-0' : '-translate-x-4'}`}></div>
                   </button>
                 )}
               />
            </div>

            {locationEnabled && (
               <textarea
                 rows={2}
                 {...register('location.text')}
                 className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-green-500 text-white placeholder-white/20"
                 placeholder="مثلاً: فتحنا الأبواب، رابط الدخول..."
               />
            )}
            {!locationEnabled && <p className="text-xs text-white/30 italic">هذه الرسالة معطلة ولن يتم إرسالها.</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black font-bold py-3 rounded-xl mt-4 flex justify-center items-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <><Loader2 className="animate-spin" size={18}/> جاري الحفظ...</> : <><Save size={18}/> حفظ الإعدادات</>}
          </button>
        </form>
      </div>
    </div>
  );
}
