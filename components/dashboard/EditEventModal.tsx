'use client';
import { useState, useEffect } from 'react';
import { useEventStore } from '@/store/eventStore';
import { X, Save, Edit3 } from 'lucide-react';

export function EditEventModal() {
  const { isEditEventModalOpen, toggleEditEventModal, eventDetails, updateEventDetails } = useEventStore();
  const [form, setForm] = useState({ name: '', location_name: '' });

  // تعبئة البيانات عند الفتح
  useEffect(() => {
    if (eventDetails) {
      setForm({ name: eventDetails.name || '', location_name: eventDetails.location_name || '' });
    }
  }, [eventDetails, isEditEventModalOpen]);

  if (!isEditEventModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#18181B] w-full max-w-sm rounded-3xl border border-white/10 p-6 animate-in zoom-in relative">
        <button onClick={() => toggleEditEventModal(false)} className="absolute top-4 left-4 text-white/40 hover:text-white"><X size={20}/></button>
        
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Edit3 size={20}/> تعديل بيانات الحفل</h3>
        
        <div className="space-y-4">
          <div>
             <label className="text-xs text-white/50 block mb-1">اسم الحفل</label>
             <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 outline-none focus:border-[#C19D65] text-white" />
          </div>
          <div>
             <label className="text-xs text-white/50 block mb-1">الموقع (اسم القاعة)</label>
             <input type="text" value={form.location_name} onChange={e => setForm({...form, location_name: e.target.value})} 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 outline-none focus:border-[#C19D65] text-white" />
          </div>
          
          <button onClick={() => updateEventDetails(form)} className="w-full bg-[#C19D65] text-black font-bold py-3 rounded-xl hover:brightness-110 flex justify-center items-center gap-2">
             <Save size={18}/> حفظ التعديلات
          </button>
        </div>
      </div>
    </div>
  );
}