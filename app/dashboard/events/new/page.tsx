'use client';

import { useState } from 'react';
import { supabase } from '@/app/utils/supabase/client'; 
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Eye } from 'lucide-react';

// استدعاء المكونات الفرعية
import { EventTypeStep } from './_components/EventTypeStep';
import { EventDetailsStep } from './_components/EventDetailsStep';
import { EventPreview } from './_components/EventPreview';

export default function NewEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  
  // تخزين البيانات
  const [eventType, setEventType] = useState<'social' | 'business' | null>('social');
  const [selectedColor, setSelectedColor] = useState('#C19D65');
  const [eventDetails, setEventDetails] = useState({ 
    name: '', 
    date: '', 
    locationName: '', 
    groomName: '', 
    brideName: '', 
    image_url: null 
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // ✅ دالة جديدة: التحقق قبل الانتقال من الخطوة 2 إلى 3
  const handleNextFromDetails = () => {
    if (!eventDetails.name.trim()) {
      alert('الرجاء كتابة اسم الفعالية');
      return;
    }
    if (!eventDetails.date) {
      alert('الرجاء اختيار تاريخ الفعالية');
      return;
    }
    if (!eventDetails.locationName.trim()) {
      alert('الرجاء تحديد مكان الفعالية');
      return;
    }
    
    // إذا كانت البيانات سليمة، انتقل للخطوة التالية
    nextStep();
  };

  // دالة الحفظ النهائية (لم تعد بحاجة لتحقق لأننا تأكدنا سابقاً، لكن تركناها للاحتياط)
  const handleCreateEvent = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يرجى تسجيل الدخول');

      const { error } = await supabase.from('events').insert([{
          user_id: user.id,
          name: eventDetails.name,
          date: eventDetails.date,
          type: eventType,
          status: 'active',
          location_name: eventDetails.locationName,
          image_url: eventDetails.image_url,
          theme_color: selectedColor,
          groom_name: eventType === 'social' ? eventDetails.groomName : null,
          bride_name: eventType === 'social' ? eventDetails.brideName : null,
      }]);

      if (error) throw error;
      router.push('/dashboard'); 
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white font-sans flex" dir="rtl">
      
      {/* 🟢 القسم الأيمن: نموذج الإدخال */}
      <div className="w-full lg:w-1/2 p-6 lg:p-12 overflow-y-auto h-screen scrollbar-hide pt-20 lg:pt-12">
        <div className="max-w-md mx-auto relative">
          
          <button onClick={() => router.back()} className="flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors text-sm font-bold">
            <ArrowRight size={16} /> إلغاء وعودة
          </button>

          {/* شريط التقدم */}
          <div className="flex items-center gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-current' : 'bg-white/10'}`} style={{ color: step >= s ? selectedColor : undefined }}></div>
            ))}
          </div>

          <div className="min-h-[400px]">
            {/* الخطوة 1: اختيار النوع */}
            {step === 1 && (
              <EventTypeStep 
                eventType={eventType} 
                setEventType={(t) => { setEventType(t); setSelectedColor(t === 'social' ? '#C19D65' : '#3B82F6'); }} 
                onNext={nextStep} 
              />
            )}

            {/* الخطوة 2: التفاصيل (هنا التغيير) */}
            {step === 2 && eventType && (
              <EventDetailsStep 
                eventType={eventType} 
                details={eventDetails} 
                setDetails={setEventDetails} 
                selectedColor={selectedColor} 
                onNext={handleNextFromDetails} // ✅ ربطنا الدالة الجديدة هنا بدلاً من nextStep المباشرة
                onBack={prevStep} 
              />
            )}

            {/* الخطوة 3: اللمسات الأخيرة */}
            {step === 3 && (
              <div className="animate-in slide-in-from-left duration-300 space-y-6">
                <h1 className="text-3xl font-black mb-2">اللمسات الأخيرة 🎨</h1>
                <div>
                  <label className="text-xs font-bold text-white/50 mb-3 block">لون الثيم</label>
                  <div className="flex gap-3 flex-wrap">
                    {['#C19D65', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'].map((color) => (
                      <button key={color} onClick={() => setSelectedColor(color)} className={`w-12 h-12 rounded-full border-2 transition-all ${selectedColor === color ? 'border-white scale-110' : 'border-transparent opacity-40 hover:opacity-100'}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white/5 to-transparent p-5 rounded-3xl border border-white/5 mt-6">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500"><Eye size={16} /></div>
                      <span className="font-bold text-sm">المعاينة نشطة</span>
                   </div>
                   <p className="text-xs text-white/40 leading-relaxed">تأكد من شكل الدعوة قبل النشر.</p>
                </div>

                <div className="flex justify-between pt-6">
                  <button onClick={prevStep} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold">السابق</button>
                  <button onClick={handleCreateEvent} disabled={loading} style={{ backgroundColor: selectedColor }} className="px-8 py-3 rounded-xl text-black font-black hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'نشر الفعالية'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 👁️ زر المعاينة العائم */}
        <button 
          onClick={() => setShowMobilePreview(true)}
          className="lg:hidden fixed bottom-6 left-6 w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 transition-transform active:scale-95"
        >
          <Eye size={24} />
        </button>

      </div>

      {/* 🟢 القسم الأيسر: المعاينة */}
      <EventPreview eventType={eventType} details={eventDetails} color={selectedColor} />

      {/* 🟢 القسم العائم: المعاينة (جوال) */}
      {showMobilePreview && (
        <EventPreview 
          eventType={eventType} 
          details={eventDetails} 
          color={selectedColor} 
          isMobileOpen={true}
          onClose={() => setShowMobilePreview(false)}
        />
      )}

    </div>
  );
}