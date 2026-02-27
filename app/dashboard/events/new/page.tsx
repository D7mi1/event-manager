'use client';

import { useState } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// استدعاء المكونات الفرعية
import { EventTypeStep } from './_components/EventTypeStep';
import { EventDetailsStep } from './_components/EventDetailsStep';
import { AIAssistantStep } from './_components/AIAssistantStep';
import { EventPreview } from './_components/EventPreview';

export default function NewEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  
  // تخزين البيانات
  const [eventType, setEventType] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [eventDetails, setEventDetails] = useState({
    name: '',
    date: '',
    locationName: '',
    organizerName: '',
    image_url: null,
    invitationText: ''
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // التحقق قبل الانتقال من الخطوة 2 إلى 3
  const handleNextFromDetails = () => {
    if (!eventDetails.name.trim()) {
      toast.warning('الرجاء كتابة اسم الفعالية');
      return;
    }
    if (!eventDetails.date) {
      toast.warning('الرجاء اختيار تاريخ الفعالية');
      return;
    }
    if (!eventDetails.locationName.trim()) {
      toast.warning('الرجاء تحديد مكان الفعالية');
      return;
    }
    nextStep();
  };

  // دالة الحفظ النهائية
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
        organizer_name: eventDetails.organizerName || null,
        invitation_text: eventDetails.invitationText,
      }]);

      if (error) throw error;
      router.push('/dashboard'); 
    } catch (err: any) {
      toast.error('خطأ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white font-sans flex" dir="rtl">
      
      {/* القسم الأيمن: نموذج الإدخال */}
      <div className="w-full lg:w-1/2 p-6 lg:p-12 overflow-y-auto h-screen scrollbar-hide pt-20 lg:pt-12">
        <div className="max-w-md mx-auto relative">
          
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors text-sm font-bold"
          >
            <ArrowRight size={16} /> إلغاء وعودة
          </button>

          {/* شريط التقدم - 4 خطوات الآن */}
          <div className="flex items-center gap-2 mb-10">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  step >= s ? 'bg-current' : 'bg-white/10'
                }`} 
                style={{ color: step >= s ? selectedColor : undefined }}
              />
            ))}
          </div>

          <div className="min-h-[400px]">
            {/* الخطوة 1: اختيار النوع */}
            {step === 1 && (
              <EventTypeStep
                eventType={eventType}
                setEventType={(t) => { setEventType(t); }}
                onNext={nextStep}
              />
            )}

            {/* الخطوة 2: التفاصيل */}
            {step === 2 && eventType && (
              <EventDetailsStep 
                eventType={eventType} 
                details={eventDetails} 
                setDetails={setEventDetails} 
                selectedColor={selectedColor} 
                onNext={handleNextFromDetails}
                onBack={prevStep} 
              />
            )}

            {/* ✨ الخطوة 3: مساعد الذكاء الاصطناعي (جديد!) */}
            {step === 3 && eventType && (
              <AIAssistantStep
                eventType={eventType}
                eventDetails={eventDetails}
                setEventDetails={setEventDetails}
                selectedColor={selectedColor}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}

            {/* الخطوة 4: اللمسات الأخيرة */}
            {step === 4 && (
              <div className="animate-in slide-in-from-left duration-300 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: selectedColor + '20' }}
                  >
                    <Sparkles size={24} style={{ color: selectedColor }} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black">اللمسات الأخيرة</h1>
                    <p className="text-sm text-white/40">اختر الثيم المناسب</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-white/50 mb-3 block">
                    لون الثيم
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      '#C19D65', 
                      '#3B82F6', 
                      '#8B5CF6', 
                      '#EC4899', 
                      '#10B981', 
                      '#F59E0B'
                    ].map((color) => (
                      <button 
                        key={color} 
                        onClick={() => setSelectedColor(color)} 
                        className={`w-12 h-12 rounded-full border-2 transition-all ${
                          selectedColor === color 
                            ? 'border-white scale-110 shadow-lg' 
                            : 'border-transparent opacity-40 hover:opacity-100'
                        }`} 
                        style={{ backgroundColor: color }} 
                      />
                    ))}
                  </div>
                </div>

                {/* ملخص سريع */}
                <div 
                  className="bg-gradient-to-br from-white/5 to-transparent p-5 rounded-3xl border mt-6"
                  style={{ borderColor: selectedColor + '20' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: selectedColor + '30' }}
                    >
                      <Eye size={16} style={{ color: selectedColor }} />
                    </div>
                    <span className="font-bold text-sm">ملخص الفعالية</span>
                  </div>
                  
                  <div className="space-y-2 text-xs text-white/60">
                    <p>📅 {eventDetails.date}</p>
                    <p>📍 {eventDetails.locationName}</p>
                    {eventDetails.invitationText && (
                      <p className="text-white/40 text-[10px] mt-3 line-clamp-2">
                        ✨ تم توليد نص الدعوة بالذكاء الاصطناعي
                      </p>
                    )}
                    {eventDetails.image_url && (
                      <p className="text-white/40 text-[10px]">
                        🖼️ تم توليد صورة مخصصة
                      </p>
                    )}
                  </div>
                </div>

                {/* أزرار التنقل */}
                <div className="flex justify-between pt-6">
                  <button 
                    onClick={prevStep} 
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors"
                  >
                    السابق
                  </button>
                  <button 
                    onClick={handleCreateEvent} 
                    disabled={loading} 
                    style={{ backgroundColor: selectedColor }} 
                    className="px-8 py-3 rounded-xl text-black font-black hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        جاري النشر...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        نشر الفعالية
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* زر المعاينة العائم */}
        <button 
          onClick={() => setShowMobilePreview(true)}
          className="lg:hidden fixed bottom-6 left-6 w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 transition-transform active:scale-95"
        >
          <Eye size={24} />
        </button>
      </div>

      {/* القسم الأيسر: المعاينة */}
      <EventPreview 
        eventType={eventType} 
        details={eventDetails} 
        color={selectedColor} 
      />

      {/* القسم العائم: المعاينة (جوال) */}
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
