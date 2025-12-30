'use client';
import { useState } from 'react';
import { useEventStore } from '@/store/eventStore';
import { Plus, X } from 'lucide-react';

export function AddGuestModal() {
  const { isAddModalOpen, toggleAddModal, addGuest } = useEventStore();
  const [form, setForm] = useState({ name: '', phone: '', category: 'GENERAL' });
  const [loading, setLoading] = useState(false);

  if (!isAddModalOpen) return null;

  const handleSubmit = async () => {
    if (!form.name || !form.phone) return alert('البيانات ناقصة');
    setLoading(true);
    await addGuest(form);
    setLoading(false);
    setForm({ name: '', phone: '', category: 'GENERAL' });
  };

  return (
     <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#18181B] w-full max-w-sm rounded-3xl border border-white/10 p-6 animate-in zoom-in relative">
           <button onClick={() => toggleAddModal(false)} className="absolute top-4 left-4 text-white/40 hover:text-white"><X size={20}/></button>
           
           <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus size={20}/> إضافة مدعو جديد</h3>
           <div className="space-y-4">
              <input type="text" placeholder="الاسم الثلاثي" value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
                 className="w-full bg-black/40 border border-white/10 rounded-xl p-3 outline-none focus:border-[#C19D65] text-white" />
              <input type="tel" placeholder="رقم الجوال (9665...)" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} 
                 className="w-full bg-black/40 border border-white/10 rounded-xl p-3 outline-none focus:border-[#C19D65] dir-ltr text-right text-white" />
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                 className="w-full bg-black/40 border border-white/10 rounded-xl p-3 outline-none focus:border-[#C19D65] appearance-none text-white">
                 <option value="GENERAL">ضيف عام</option>
                 <option value="VIP">VIP (كبار الشخصيات)</option>
                 <option value="FAMILY">أهل العرس</option>
              </select>
              <button disabled={loading} onClick={handleSubmit} className="w-full bg-[#C19D65] text-black font-bold py-3 rounded-xl hover:brightness-110 disabled:opacity-50">
                 {loading ? 'جاري الحفظ...' : 'حفظ وإضافة'}
              </button>
           </div>
        </div>
     </div>
  );
}