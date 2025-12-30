'use client';
import { useState, useEffect } from 'react';
import { useEventStore } from '@/store/eventStore';
import { X, MessageCircle, Save, MapPin, Bell } from 'lucide-react';

export function MessageConfigModal() {
  const { isMessageModalOpen, toggleMessageModal, messageSettings, updateMessageSettings } = useEventStore();
  
  // حالة محلية للنموذج
  const [settings, setSettings] = useState(messageSettings);

  // تحديث الحالة عند فتح المودال
  useEffect(() => {
    setSettings(messageSettings);
  }, [messageSettings, isMessageModalOpen]);

  if (!isMessageModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#18181B] w-full max-w-lg rounded-3xl border border-white/10 p-6 animate-in zoom-in relative shadow-2xl">
        <button onClick={() => toggleMessageModal(false)} className="absolute top-4 left-4 text-white/40 hover:text-white"><X size={20}/></button>

        <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
          <MessageCircle className="text-[#C19D65]" size={20}/> تخصيص الرسائل
        </h3>
        <p className="text-xs text-white/40 mb-6">تحكم في الرسائل التلقائية التي تصل للضيوف</p>

        <div className="space-y-6">
          
          {/* 1. رسالة قبل 24 ساعة */}
          <div className={`p-4 rounded-2xl border transition-all ${settings.reminder.enabled ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5 opacity-50'}`}>
            <div className="flex justify-between items-center mb-3">
               <div className="flex items-center gap-2">
                  <Bell size={16} className={settings.reminder.enabled ? "text-[#C19D65]" : "text-gray-500"}/>
                  <label className="text-sm font-bold text-white">رسالة التذكير (قبل 24 ساعة)</label>
               </div>
               
               {/* زر التفعيل/التعطيل */}
               <button 
                  onClick={() => setSettings({ ...settings, reminder: { ...settings.reminder, enabled: !settings.reminder.enabled } })}
                  className={`w-10 h-6 rounded-full flex items-center p-1 transition-all ${settings.reminder.enabled ? 'bg-[#C19D65]' : 'bg-white/10'}`}
               >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.reminder.enabled ? 'translate-x-0' : '-translate-x-4'}`}></div>
               </button>
            </div>
            
            {settings.reminder.enabled && (
               <textarea 
                 rows={3} 
                 value={settings.reminder.text}
                 onChange={(e) => setSettings({ ...settings, reminder: { ...settings.reminder, text: e.target.value } })}
                 className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-[#C19D65] text-white placeholder-white/20" 
                 placeholder="اكتب نص الرسالة هنا..."
               />
            )}
            {!settings.reminder.enabled && <p className="text-xs text-white/30 italic">هذه الرسالة معطلة ولن يتم إرسالها.</p>}
          </div>

          {/* 2. رسالة قبل 1 ساعة */}
          <div className={`p-4 rounded-2xl border transition-all ${settings.location.enabled ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5 opacity-50'}`}>
            <div className="flex justify-between items-center mb-3">
               <div className="flex items-center gap-2">
                  <MapPin size={16} className={settings.location.enabled ? "text-green-500" : "text-gray-500"}/>
                  <label className="text-sm font-bold text-white">رسالة الوصول (قبل 1 ساعة)</label>
               </div>
               
               <button 
                  onClick={() => setSettings({ ...settings, location: { ...settings.location, enabled: !settings.location.enabled } })}
                  className={`w-10 h-6 rounded-full flex items-center p-1 transition-all ${settings.location.enabled ? 'bg-green-500' : 'bg-white/10'}`}
               >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.location.enabled ? 'translate-x-0' : '-translate-x-4'}`}></div>
               </button>
            </div>

            {settings.location.enabled && (
               <textarea 
                 rows={2} 
                 value={settings.location.text}
                 onChange={(e) => setSettings({ ...settings, location: { ...settings.location, text: e.target.value } })}
                 className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-green-500 text-white placeholder-white/20"
                 placeholder="مثلاً: فتحنا الأبواب، رابط الدخول..." 
               />
            )}
            {!settings.location.enabled && <p className="text-xs text-white/30 italic">هذه الرسالة معطلة ولن يتم إرسالها.</p>}
          </div>
          
          <button 
            onClick={() => updateMessageSettings(settings)} 
            className="w-full bg-white text-black font-bold py-3 rounded-xl mt-4 flex justify-center items-center gap-2 hover:bg-gray-200 transition-colors"
          >
            <Save size={18}/> حفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
}