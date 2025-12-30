'use client';

import { useState } from 'react';
import { supabase } from '@/app/utils/supabase/client'; 
import { 
  Sparkles, Briefcase, Calendar, MapPin, 
  Type, Eye, Link as LinkIcon, Loader2, ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewEventWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [eventType, setEventType] = useState<'social' | 'business' | null>('social');
  const [selectedColor, setSelectedColor] = useState('#C19D65');

  const [eventDetails, setEventDetails] = useState({ 
    name: '', 
    date: '', 
    locationName: '', 
    locationLink: '',
    groomName: '', 
    brideName: '', 
    companyLogo: null as string | null,
  });

  // ✅ 1. دالة للحصول على تاريخ اليوم بصيغة YYYY-MM-DD
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleCreateEvent = async () => {
    if (!eventDetails.name || !eventDetails.date) {
      alert('الرجاء إدخال اسم الفعالية والتاريخ');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يرجى تسجيل الدخول');

      const { data, error } = await supabase
        .from('events')
        .insert([{
            user_id: user.id,
            name: eventDetails.name,
            date: eventDetails.date,
            type: eventType,
            status: 'active',
            guests_count: 0,
            location_name: eventDetails.locationName,
            location_link: eventDetails.locationLink,
            theme_color: selectedColor,
            groom_name: eventType === 'social' ? eventDetails.groomName : null,
            bride_name: eventType === 'social' ? eventDetails.brideName : null,
            company_logo: eventType === 'business' ? eventDetails.companyLogo : null,
        }])
        .select()
        .single();

      if (error) throw error;
      router.push('/dashboard'); 
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white font-sans flex" dir="rtl">
      
      {/* القسم الأيمن: الفورم */}
      <div className="w-full lg:w-1/2 p-8 pt-24 overflow-y-auto h-screen scrollbar-hide">
        <div className="max-w-md mx-auto">
          
          <button onClick={() => router.back()} className="flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors text-sm font-bold">
            <ArrowRight size={16} /> إلغاء وعودة
          </button>

          <div className="flex items-center gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#C19D65]' : 'bg-white/10'}`} style={step >= s ? { backgroundColor: selectedColor } : {}}></div>
            ))}
          </div>

          <div className="min-h-[400px]">
            {/* Step 1: Event Type */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right duration-300">
                <h1 className="text-3xl font-black mb-2">ما نوع مناسبتك؟ ✨</h1>
                <p className="text-white/40 mb-8 text-sm">سنقوم بتخصيص التصميم بناءً على اختيارك.</p>
                <div className="space-y-4">
                  <button onClick={() => { setEventType('social'); setSelectedColor('#C19D65'); nextStep(); }} className={`w-full p-6 rounded-3xl border transition-all text-right flex items-center gap-4 group ${eventType === 'social' ? 'border-[#C19D65] bg-[#C19D65]/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/5'}`}>
                    <div className="w-12 h-12 rounded-2xl bg-[#C19D65]/10 flex items-center justify-center text-[#C19D65]"><Sparkles size={24} /></div>
                    <div>
                      <p className="font-bold">أفراح ومناسبات اجتماعية</p>
                      <p className="text-xs text-white/30 mt-1">دعوات زفاف، خطوبة، تخرج</p>
                    </div>
                  </button>
                  <button onClick={() => { setEventType('business'); setSelectedColor('#3B82F6'); nextStep(); }} className={`w-full p-6 rounded-3xl border transition-all text-right flex items-center gap-4 group ${eventType === 'business' ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/5'}`}>
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Briefcase size={24} /></div>
                    <div>
                      <p className="font-bold">أعمال ومؤتمرات</p>
                      <p className="text-xs text-white/30 mt-1">ندوات، ورش عمل، اجتماعات</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Details - Here is the Date Update */}
            {step === 2 && (
              <div className="animate-in slide-in-from-left duration-300 space-y-5">
                <h1 className="text-3xl font-black mb-2">التفاصيل الأساسية 📝</h1>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50">عنوان الفعالية</label>
                  <input type="text" value={eventDetails.name} onChange={(e) => setEventDetails({...eventDetails, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-white/30 transition-colors" placeholder="اكتب العنوان هنا..." style={{ caretColor: selectedColor }} autoFocus />
                </div>

                {eventType === 'social' && (
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-xs font-bold text-white/50">اسم العريس</label>
                       <input type="text" value={eventDetails.groomName} onChange={(e) => setEventDetails({...eventDetails, groomName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-white/30" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-bold text-white/50">اسم العروس</label>
                       <input type="text" value={eventDetails.brideName} onChange={(e) => setEventDetails({...eventDetails, brideName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-white/30" />
                     </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* ✅ 2. حقل التاريخ المطور */}
                  <div className="space-y-2 relative group">
                    <label className="text-xs font-bold text-white/50">التاريخ</label>
                    <div className="relative">
                      {/* الأيقونة المخصصة */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 group-focus-within:text-white transition-colors">
                        <Calendar size={18} />
                      </div>
                      <input 
                        type="date"
                        // ✅ المنطق: منع اختيار تواريخ سابقة
                        min={getTodayDate()} 
                        value={eventDetails.date} 
                        onChange={(e) => setEventDetails({...eventDetails, date: e.target.value})} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 outline-none appearance-none transition-all focus:border-opacity-50 cursor-pointer text-white/90 placeholder-transparent"
                        style={{ 
                          // ✅ التصميم: إجبار التقويم على الوضع الليلي + لون الحدود المخصص
                          colorScheme: 'dark',
                          borderColor: eventDetails.date ? selectedColor : 'rgba(255,255,255,0.1)'
                        }} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50">المكان</label>
                    <div className="relative">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                            <MapPin size={18} />
                        </div>
                        <input type="text" value={eventDetails.locationName} onChange={(e) => setEventDetails({...eventDetails, locationName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 outline-none focus:border-white/30" placeholder="اسم القاعة..." />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button onClick={prevStep} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold">السابق</button>
                  <button onClick={nextStep} style={{ backgroundColor: selectedColor }} className="px-8 py-3 rounded-xl text-black font-black hover:scale-105 transition-all">التالي</button>
                </div>
              </div>
            )}

            {/* Step 3: Colors & Preview */}
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
                   <p className="text-xs text-white/40 leading-relaxed">
                     البيانات التي أدخلتها تظهر الآن على الشاشة اليسرى. تأكد من صحة النصوص والألوان قبل النشر.
                   </p>
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
      </div>

      {/* القسم الأيسر: المعاينة الحية */}
      <div className="hidden lg:flex w-1/2 bg-[#0F0F12] border-r border-white/5 relative items-center justify-center p-10 overflow-hidden">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 transition-colors duration-1000" style={{ backgroundColor: selectedColor }}></div>

        <div className="relative w-[380px] h-[750px] bg-black rounded-[3rem] border-[8px] border-[#2A2A2E] shadow-2xl overflow-hidden z-10 transition-transform duration-500 hover:scale-[1.02]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#2A2A2E] rounded-b-2xl z-20"></div>

          <div className="w-full h-full bg-[#050505] relative overflow-hidden flex flex-col">
            <div className="h-2/5 w-full relative transition-colors duration-700" style={{ backgroundColor: selectedColor }}>
               <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#050505]"></div>
               <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#050505] rounded-full p-2 flex items-center justify-center shadow-2xl">
                 <div className="w-full h-full rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                    {eventType === 'business' ? <Briefcase style={{ color: selectedColor }} /> : <Sparkles style={{ color: selectedColor }} />}
                 </div>
               </div>
            </div>

            <div className="flex-1 px-6 pt-14 text-center pb-8 overflow-y-auto">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 animate-pulse">دعوة خاصة</p>
              
              {eventType === 'social' && (eventDetails.groomName || eventDetails.brideName) && (
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-white">{eventDetails.groomName || 'اسم العريس'}</h2>
                  <span className="text-xs text-white/30 my-1 block">&</span>
                  <h2 className="text-xl font-bold text-white">{eventDetails.brideName || 'اسم العروس'}</h2>
                </div>
              )}

              <h1 className="text-2xl font-black text-white leading-tight mb-8">
                {eventDetails.name || 'عنوان المناسبة...'}
              </h1>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4 mb-8 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-right">
                   <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Calendar size={14} className="opacity-70"/></div>
                   <div>
                      <p className="text-[9px] text-white/30 uppercase">التاريخ</p>
                      <p className="text-xs font-bold text-white/90">{eventDetails.date || '---'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                   <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><MapPin size={14} className="opacity-70"/></div>
                   <div>
                      <p className="text-[9px] text-white/30 uppercase">الموقع</p>
                      <p className="text-xs font-bold text-white/90">{eventDetails.locationName || '---'}</p>
                   </div>
                </div>
              </div>

              <div className="border border-dashed border-white/10 rounded-xl p-4 w-32 mx-auto opacity-40 mb-4">
                 <div className="w-full aspect-square bg-white/10 rounded"></div>
              </div>
              <p className="text-[9px] text-white/30">أبرز هذا الكود عند الدخول</p>

            </div>

            <div className="p-6 pt-0">
               <div style={{ backgroundColor: selectedColor }} className="w-full py-3 rounded-xl font-bold text-black text-center text-sm shadow-lg">
                  تسجيل الحضور
               </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 text-white/20 text-xs font-mono tracking-widest">
           LIVE PREVIEW MODE
        </div>
      </div>
    </div>
  );
}