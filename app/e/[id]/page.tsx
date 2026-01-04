'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { Sparkles, Send, Briefcase, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GuestRSVP({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // الحالة (State)
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  // بيانات النموذج
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '', 
    companions: 0,
    organization: '', // نجمعها في الواجهة (يمكنك إضافتها للقاعدة لاحقاً إذا أردت)
    jobTitle: ''
  });

  // جلب بيانات الفعالية
  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setEvent(data);
      }
      setLoading(false);
    };

    fetchEvent();
  }, [id]);

  const isWedding = event?.type === 'social';

  // إعدادات الثيم (ألوان وظلال)
  const theme = {
    primary: isWedding ? '#C19D65' : '#3B82F6',
    button: isWedding ? 'bg-[#C19D65] hover:bg-[#A4824E]' : 'bg-blue-600 hover:bg-blue-700',
    text: isWedding ? 'text-[#C19D65]' : 'text-blue-500',
    shadow: isWedding ? 'shadow-[#C19D65]/20' : 'shadow-blue-500/20'
  };

  // ✅ دالة توليد كود التذكرة العشوائي
  const generateTicketCode = () => {
    return 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // ✅ معالجة الإرسال (محدثة لإصلاح الأخطاء)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // تجهيز البيانات للإرسال
      const insertPayload = {
        event_id: id,
        guest_name: formData.name,
        status: 'confirmed',
        ticket_code: generateTicketCode(), // توليد الكود تلقائياً
        phone: formData.phone,             // إرسال رقم الجوال
        companions: formData.companions,   // إرسال عدد المرافقين
        email: formData.email || null,     // إرسال الإيميل (أو null إذا كان فارغاً)
      };

      const { data, error } = await supabase
        .from('tickets')
        .insert([insertPayload])
        .select()
        .single();

      if (error) {
        // طباعة تفاصيل الخطأ في الكونسول للمطور
        console.error('Supabase Insert Error:', JSON.stringify(error, null, 2));
        throw error;
      }

      setTicketId(data.id);
      setSubmitted(true);

    } catch (err: any) {
      console.error('Catch Error:', err);
      // عرض رسالة خطأ واضحة للمستخدم
      alert('حدث خطأ أثناء التسجيل: ' + (err.message || 'يرجى التأكد من البيانات والمحاولة مرة أخرى'));
    } finally {
      setSubmitting(false);
    }
  };

  // شاشات التحميل والخطأ
  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center text-white">
      <Loader2 className="animate-spin text-white/50" size={40} />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center text-white/50">
      عذراً، الفعالية غير موجودة.
    </div>
  );

  // --- شاشة النجاح ---
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-6 text-center text-white relative overflow-hidden" dir="rtl">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] blur-[150px] opacity-20 pointer-events-none transition-colors duration-1000 ${isWedding ? 'bg-[#C19D65]' : 'bg-blue-600'}`}></div>
        
        <div className="max-w-md w-full bg-white/[0.02] border border-white/10 p-12 rounded-[3.5rem] backdrop-blur-3xl animate-in zoom-in duration-500 relative z-10">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 ${isWedding ? 'bg-[#C19D65]/20 text-[#C19D65]' : 'bg-blue-500/20 text-blue-500'}`}>
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black mb-4">تم تأكيد حضورك!</h2>
          <p className="text-white/40 mb-10 leading-relaxed">شكراً لك {formData.name}، تم إصدار تذكرتك بنجاح.</p>
          <button onClick={() => router.push(`/t/${ticketId}`)} className="w-full py-5 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2">
             عرض التذكرة والباركود
          </button>
        </div>
      </div>
    );
  }

  // --- شاشة النموذج الرئيسية ---
  return (
    <div className="min-h-screen bg-[#0A0A0C] relative overflow-hidden flex items-center justify-center p-6 text-right" dir="rtl">
      
      {/* الخلفية المضيئة */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] blur-[150px] opacity-20 pointer-events-none transition-colors duration-1000 ${isWedding ? 'bg-[#C19D65]' : 'bg-blue-600'}`}></div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
          
          {/* 🔥 الإطار المضيء المدمج (الشعار أو الأيقونة) */}
          <div className={`relative w-28 h-28 mx-auto mb-8 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-1000 group ${theme.button} ${theme.shadow}`}>
             {event.image_url ? (
               <div className="w-full h-full rounded-[2rem] overflow-hidden bg-black/20 p-3 relative">
                  {/* طبقة خلفية ضبابية */}
                  <img src={event.image_url} className="absolute inset-0 w-full h-full object-cover blur-md opacity-50" alt=""/>
                  {/* الشعار الأصلي */}
                  <img src={event.image_url} alt="Logo" className="relative w-full h-full object-contain z-10 drop-shadow-lg transform transition-transform group-hover:scale-105" />
               </div>
             ) : (
               <div className="text-white">
                  {isWedding ? <Sparkles size={40} /> : <Briefcase size={40} />}
               </div>
             )}
          </div>
          
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight drop-shadow-lg">{event.name}</h1>
          
          <p className="text-white/60 text-lg font-medium">
            {isWedding 
              ? `نتشرف بدعوتكم لحضور حفل ${event.groom_name || ''} و ${event.bride_name || ''}` 
              : 'يرجى تسجيل بياناتك لإصدار بطاقة الدخول'}
          </p>
          
          <div className="mt-6 inline-flex items-center gap-4 text-xs font-bold text-white/80 bg-white/10 backdrop-blur-md border border-white/10 py-3 px-6 rounded-full shadow-lg">
            <span>📅 {event.date}</span>
            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            <span>📍 {event.location_name}</span>
          </div>
        </div>

        {/* نموذج البيانات */}
        <form onSubmit={handleSubmit} className="space-y-8 bg-black/40 border border-white/10 p-10 md:p-14 rounded-[4rem] backdrop-blur-xl shadow-2xl">
          <div className="space-y-6">
            
            {/* الاسم الكامل */}
            <div className="group">
              <label className="block text-sm font-bold text-white/60 mb-3 mr-2 group-focus-within:text-white transition-colors">الاسم الكامل</label>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="أدخل اسمك كما في الهوية" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-white/30 transition-all text-lg placeholder:text-white/20" />
            </div>

            {/* رقم الجوال */}
            <div className="group">
              <label className="block text-sm font-bold text-white/60 mb-3 mr-2 group-focus-within:text-white transition-colors">رقم الجوال</label>
              <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="05xxxxxxxx" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-white/30 transition-all text-lg text-left placeholder:text-white/20" dir="ltr" />
            </div>

            {isWedding ? (
              // --- خيار الزواج ---
              <div className="animate-in fade-in duration-500">
                <label className="block text-sm font-bold text-white/60 mb-3 mr-2 italic">عدد المرافقين</label>
                <div className="grid grid-cols-4 gap-4 text-center">
                  {[0, 1, 2, 3].map((num) => (
                    <button key={num} type="button" onClick={() => setFormData({...formData, companions: num})} className={`py-4 rounded-xl border transition-all text-white font-bold ${formData.companions === num ? 'bg-[#C19D65] border-[#C19D65]' : 'bg-white/5 border-white/10 hover:border-[#C19D65]'}`}>
                      {num === 0 ? 'بمفردي' : num}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // --- خيار الأعمال ---
              <div className="animate-in fade-in duration-500 space-y-6">
                {/* الإيميل للأعمال فقط */}
                <div>
                  <label className="block text-sm font-bold text-white/60 mb-3 mr-2">البريد الإلكتروني المهني</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    placeholder="name@company.com" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-blue-500 transition-all text-lg placeholder:text-white/20 text-left" 
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white/60 mb-3 mr-2">جهة العمل</label>
                  <input type="text" value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-blue-500 transition-all text-lg" />
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting} className={`w-full py-6 rounded-2xl text-black font-black text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed ${theme.button} ${theme.shadow}`}>
            {submitting ? <Loader2 className="animate-spin" /> : (<><Send size={24} /> تأكيد الحضور الآن</>)}
          </button>

          <p className="text-center text-[10px] text-white/20 tracking-widest uppercase">تأمين البيانات بواسطة مِـراس © 2025</p>
        </form>
      </div>
    </div>
  );
}