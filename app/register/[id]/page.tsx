'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, Calendar, MapPin, AlertCircle,
  Heart, Briefcase, User, Mail,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/app/utils/supabase/client';
import * as Sentry from '@sentry/nextjs'; // ✅ تتبع الأخطاء

// ✅ استيراد الأدوات الجديدة (الكاش والتحقق)
import { useEventWithCache } from '@/hooks/useEventWithCache';
import { RegistrationSchema } from '@/app/utils/schemas';
import { validateData } from '@/app/utils/schemas';

// بيانات دول الخليج
const GULF_COUNTRIES = [
  { name: 'السعودية', code: '966', flag: '🇸🇦', digits: 9, placeholder: '5xxxxxxxx' },
  { name: 'الإمارات', code: '971', flag: '🇦🇪', digits: 9, placeholder: '5xxxxxxxx' },
  { name: 'الكويت', code: '965', flag: '🇰🇼', digits: 8, placeholder: 'xxxxxxxx' },
  { name: 'قطر', code: '974', flag: '🇶🇦', digits: 8, placeholder: 'xxxxxxxx' },
  { name: 'عمان', code: '968', flag: '🇴🇲', digits: 8, placeholder: 'xxxxxxxx' },
  { name: 'البحرين', code: '973', flag: '🇧🇭', digits: 8, placeholder: 'xxxxxxxx' },
];

interface PageProps { params: Promise<{ id: string }>; }

export default function RegistrationPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // ✅ 1. استخدام SWR للكاش (سرعة تحميل فورية)
  // بدلاً من useEffect و useState المعقدة
  const { event, isLoading, isError } = useEventWithCache(id);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form Data
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [selectedCountry, setSelectedCountry] = useState(GULF_COUNTRIES[0]);
  
  // ✅ تخزين أخطاء التحقق القادمة من Zod
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Theme Logic
  const isWedding = event?.type !== 'business';
  const themeColor = isWedding ? '#C19D65' : '#3B82F6';
  const themeBg = isWedding ? 'bg-[#C19D65]' : 'bg-blue-600';

  // ✅ 2. دالة التحقق باستخدام Zod
  const validateForm = () => {
    // تجهيز البيانات للتحقق (دمج مفتاح الدولة مع الرقم)
    const fullPhone = selectedCountry.code + formData.phone;
    
    // استخدام دالة validateData المساعدة التي بنيناها
    const result = validateData(RegistrationSchema, {
      name: formData.name,
      email: formData.email,
      phone: fullPhone
    });

    if (!result.success && result.errors) {
      setValidationErrors(result.errors);
      return false;
    }

    setValidationErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // تنفيذ التحقق قبل الإرسال
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const fullPhone = selectedCountry.code + formData.phone;

      // إرسال البيانات
      const { data: guest, error: insertError } = await supabase
        .from('attendees')
        .insert([{
          event_id: id,
          name: formData.name,
          email: formData.email,
          phone: fullPhone,
          status: 'confirmed'
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      if (!guest) throw new Error('فشل في إنشاء التذكرة');

      // توجيه للتذكرة
      router.push(`/t/${guest.id}`);

    } catch (err) {
      console.error(err);
      
      // ✅ 3. تسجيل الخطأ في Sentry (للمراقبة)
      Sentry.captureException(err, {
        extra: { eventId: id, formData },
        tags: { section: 'registration' }
      });

      const errorMsg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';
      setSubmitError(errorMsg);
      setSubmitting(false);
    }
  };

  // Loading State
  if (isLoading) return <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center"><Loader2 className="animate-spin text-[#C19D65]" /></div>;
  
  // Error State (SWR Error)
  if (isError || !event) return <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center text-white">الفعالية غير موجودة أو حدث خطأ في الاتصال</div>;

  return (
    <div className="min-h-screen bg-[#0A0A0C] font-sans relative flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[var(--theme)]/20 to-transparent pointer-events-none" style={{ '--theme': themeColor } as any}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className={`w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center text-white shadow-2xl ${themeBg}`}>
            {isWedding ? <Heart size={36} fill="white" /> : <Briefcase size={36} />}
          </div>
          <h1 className="text-3xl font-black text-white mb-2">{event.name}</h1>
          <div className="flex justify-center gap-4 text-xs text-white/60 font-bold">
            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(event.date).toLocaleDateString('ar-SA')}</span>
            <span className="flex items-center gap-1"><MapPin size={14} /> {event.location_name || 'الموقع'}</span>
          </div>
        </div>

        {/* Global Error Alert */}
        {submitError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-400">{submitError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#18181B]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[3rem] space-y-6 shadow-2xl">

          {/* الاسم */}
          <div className="space-y-2">
            <label className="text-xs text-white/40 mr-4 font-bold">الاسم الثلاثي</label>
            <div className="relative group">
              <User className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={18} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                // ✅ عرض الخطأ إن وجد في validationErrors
                className={`w-full bg-black/40 border rounded-2xl py-4 pr-12 pl-12 text-white outline-none transition-all ${validationErrors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[var(--theme)]'}`}
                placeholder="الاسم كما هو في البطاقة"
                style={{ '--theme': themeColor } as any}
              />
            </div>
            {validationErrors.name && <p className="text-[10px] text-red-400 mr-4 mt-1 animate-in slide-in-from-top-1">{validationErrors.name}</p>}
          </div>

          {/* الجوال */}
          <div className="space-y-2">
            <label className="text-xs text-white/40 mr-4 font-bold">رقم الجوال</label>
            <div className={`flex flex-row-reverse bg-black/40 border rounded-2xl overflow-hidden transition-all ${validationErrors.phone ? 'border-red-500/50 focus-within:border-red-500' : 'border-white/10 focus-within:border-[var(--theme)]'}`} style={{ '--theme': themeColor } as any}>
              
              {/* القائمة المنسدلة */}
              <div className="relative w-28 border-r border-white/10 shrink-0">
                <select
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => setSelectedCountry(GULF_COUNTRIES[e.target.selectedIndex])}
                >
                  {GULF_COUNTRIES.map((c, i) => <option key={i} value={i} className="text-black">{c.name}</option>)}
                </select>
                <div className="w-full h-full flex items-center justify-center text-xs gap-2 pointer-events-none">
                  <span>{selectedCountry.flag}</span>
                  <span className="dir-ltr font-mono font-bold">+{selectedCountry.code}</span>
                </div>
              </div>

              {/* حقل الإدخال */}
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={selectedCountry.placeholder}
                className="flex-1 bg-transparent py-4 px-4 text-white text-right outline-none font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal placeholder:text-right dir-ltr"
              />
            </div>
            {validationErrors.phone && <p className="text-[10px] text-red-400 mr-4 mt-1 animate-in slide-in-from-top-1">{validationErrors.phone}</p>}
          </div>

          {/* الإيميل */}
          <div className="space-y-2">
            <label className="text-xs text-white/40 mr-4 font-bold">البريد الإلكتروني <span className="text-[10px] opacity-50">(لاستلام التذكرة)</span></label>
            <div className="relative group">
              <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={18} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full bg-black/40 border rounded-2xl py-4 pr-12 pl-12 text-white outline-none transition-all text-left ${validationErrors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[var(--theme)]'}`}
                placeholder="name@example.com"
                style={{ '--theme': themeColor } as any}
              />
            </div>
            {validationErrors.email && <p className="text-[10px] text-red-400 mr-4 mt-1 animate-in slide-in-from-top-1">{validationErrors.email}</p>}
          </div>

          {/* زر الإرسال */}
          <button type="submit" disabled={submitting} className="w-full py-5 rounded-2xl font-black text-lg text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: themeColor }}>
            {submitting ? <Loader2 className="animate-spin" /> : 'تأكيد الحضور والحصول على التذكرة'}
          </button>
        </form>
        
        <p className="text-center text-[10px] text-white/20 mt-8 tracking-widest uppercase">Powered by Meras Platform © 2025</p>
      </div>
    </div>
  );
}