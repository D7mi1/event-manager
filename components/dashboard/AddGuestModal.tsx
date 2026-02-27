'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEventStore } from '@/store/eventStore';
import { Plus, X, Loader2 } from 'lucide-react';
import { AddGuestFormSchema, type AddGuestFormInput } from '@/lib/schemas';

export function AddGuestModal() {
  const { isAddModalOpen, toggleAddModal, addGuest } = useEventStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddGuestFormInput>({
    resolver: zodResolver(AddGuestFormSchema),
    defaultValues: { name: '', phone: '', category: 'GENERAL' },
  });

  if (!isAddModalOpen) return null;

  const onSubmit = async (data: AddGuestFormInput) => {
    await addGuest(data);
    reset();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#18181B] w-full max-w-sm rounded-3xl border border-white/10 p-6 animate-in zoom-in relative">
        <button onClick={() => toggleAddModal(false)} className="absolute top-4 left-4 text-white/40 hover:text-white"><X size={20}/></button>

        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus size={20}/> إضافة مدعو جديد</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="الاسم الثلاثي"
              {...register('name')}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 outline-none focus:border-[#C19D65] text-white"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <input
              type="tel"
              placeholder="رقم الجوال (9665...)"
              {...register('phone')}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 outline-none focus:border-[#C19D65] dir-ltr text-right text-white"
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <select
              {...register('category')}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 outline-none focus:border-[#C19D65] appearance-none text-white"
            >
              <option value="GENERAL">ضيف عام</option>
              <option value="VIP">VIP (كبار الشخصيات)</option>
              <option value="FAMILY">أهل العرس</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#C19D65] text-black font-bold py-3 rounded-xl hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <><Loader2 className="animate-spin" size={18}/> جاري الحفظ...</> : 'حفظ وإضافة'}
          </button>
        </form>
      </div>
    </div>
  );
}
