'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEventStore } from '@/lib/stores/eventStore';
import { X, Save, Edit3, Loader2 } from 'lucide-react';
import { EditEventFormSchema, type EditEventFormInput } from '@/lib/schemas';

export function EditEventModal() {
  const { isEditEventModalOpen, toggleEditEventModal, eventDetails, updateEventDetails } = useEventStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditEventFormInput>({
    resolver: zodResolver(EditEventFormSchema),
    defaultValues: { name: '', location_name: '' },
  });

  // تعبئة البيانات عند الفتح
  useEffect(() => {
    if (eventDetails && isEditEventModalOpen) {
      reset({
        name: eventDetails.name || '',
        location_name: eventDetails.location_name || '',
      });
    }
  }, [eventDetails, isEditEventModalOpen, reset]);

  if (!isEditEventModalOpen) return null;

  const onSubmit = async (data: EditEventFormInput) => {
    await updateEventDetails(data);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#18181B] w-full max-w-sm rounded-3xl border border-white/10 p-6 animate-in zoom-in relative">
        <button onClick={() => toggleEditEventModal(false)} className="absolute top-4 left-4 text-white/40 hover:text-white"><X size={20}/></button>

        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Edit3 size={20}/> تعديل بيانات الحفل</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs text-white/50 block mb-1">اسم الحفل</label>
            <input
              type="text"
              {...register('name')}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 outline-none focus:border-[#C19D65] text-white"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">الموقع (اسم القاعة)</label>
            <input
              type="text"
              {...register('location_name')}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 outline-none focus:border-[#C19D65] text-white"
            />
            {errors.location_name && <p className="text-red-400 text-xs mt-1">{errors.location_name.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#C19D65] text-black font-bold py-3 rounded-xl hover:brightness-110 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isSubmitting ? <><Loader2 className="animate-spin" size={18}/> جاري الحفظ...</> : <><Save size={18}/> حفظ التعديلات</>}
          </button>
        </form>
      </div>
    </div>
  );
}
