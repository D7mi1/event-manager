'use client';
import { useState, useEffect } from 'react';
import { useEventStore } from '@/store/eventStore';
import { generateWhatsAppLink } from '@/app/utils/whatsappHelper';
import { X, Send, SkipForward, CheckCircle2 } from 'lucide-react';

export function WhatsAppQueueModal() {
  const { 
    isQueueModalOpen, 
    toggleQueueModal, 
    attendees, 
    eventDetails, 
    markInviteAsSent 
  } = useEventStore();

  const [queue, setQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isQueueModalOpen) {
      // ⚡️ إصلاح: نأخذ نسخة ثابتة من القائمة عند الفتح فقط
      // ولا نربط التحديث بتغيرات "attendees" لتجنب إعادة الترتيب المزعجة
      const pendingGuests = attendees.filter(a => a.status === 'confirmed');
      setQueue(pendingGuests);
      setCurrentIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQueueModalOpen]); // 👈 أزلنا 'attendees' من هنا لمنع الـ Reset

  if (!isQueueModalOpen) return null;

  const currentGuest = queue[currentIndex];
  const progress = queue.length > 0 ? Math.round(((currentIndex) / queue.length) * 100) : 0;
  const isFinished = currentIndex >= queue.length;

  const handleSend = async () => {
    if (!currentGuest) return;

    // 1. فتح رابط الواتساب
    const link = generateWhatsAppLink(
       currentGuest.phone, 
       currentGuest.name, 
       eventDetails?.name || "دعوة خاصة", 
       currentGuest.id
    );
    window.open(link, '_blank');

    // 2. تحديث الحالة في الخلفية (بدون التأثير على القائمة الحالية)
    markInviteAsSent(currentGuest.id);

    // 3. الانتقال للتالي
    setCurrentIndex(prev => prev + 1);
  };

  const handleSkip = () => {
    // الانتقال للتالي بدون تحديث الحالة
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#18181B] w-full max-w-md rounded-3xl border border-white/10 p-6 animate-in zoom-in relative shadow-2xl">
        
        <button onClick={() => toggleQueueModal(false)} className="absolute top-4 left-4 text-white/40 hover:text-white">
            <X size={20}/>
        </button>

        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
           <Send className="text-[#25D366]" size={24}/> طابور الإرسال السريع
        </h3>

        {/* حالة الانتهاء */}
        {isFinished || queue.length === 0 ? (
           <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle2 size={40} className="text-green-500"/>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                 {queue.length === 0 ? 'لا توجد دعوات معلقة' : 'انتهت المهمة! 🎉'}
              </h4>
              <p className="text-white/50 text-sm mb-6">
                 {queue.length === 0 ? 'جميع المدعوين (Confirmed) تم إرسال الدعوة لهم.' : 'تم الانتهاء من القائمة الحالية.'}
              </p>
              <button onClick={() => toggleQueueModal(false)} className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 text-white font-bold transition-all">
                 إغلاق النافذة
              </button>
           </div>
        ) : (
           /* عرض بطاقة الضيف */
           <div>
              <div className="flex justify-between text-xs text-white/40 mb-2 font-mono">
                 <span>الضيف {currentIndex + 1} من {queue.length}</span>
                 <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
                 <div className="h-full bg-[#25D366] transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>

              <div className="bg-black/30 border border-white/10 rounded-2xl p-6 text-center mb-8">
                 <p className="text-xs text-[#C19D65] font-bold uppercase tracking-widest mb-2">{currentGuest.category || 'GENERAL'}</p>
                 <h2 className="text-3xl font-bold text-white mb-2">{currentGuest.name}</h2>
                 <p className="text-xl text-white/50 font-mono dir-ltr">{currentGuest.phone}</p>
              </div>

              <div className="space-y-3">
                 <button 
                    onClick={handleSend}
                    className="w-full py-4 bg-[#25D366] text-black font-black text-lg rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)]"
                 >
                    <Send size={20}/> إرسال عبر واتساب
                 </button>
                 
                 <button 
                    onClick={handleSkip}
                    className="w-full py-3 bg-transparent text-white/40 font-bold hover:text-white hover:bg-white/5 rounded-2xl transition-all flex items-center justify-center gap-2"
                 >
                    <SkipForward size={18}/> تخطي هذا الضيف
                 </button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}