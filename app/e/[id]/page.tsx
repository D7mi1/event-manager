'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import NextImage from 'next/image';
import { Send, Briefcase, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
    organization: '',
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

  // إعدادات الثيم
  const theme = {
    primary: event?.theme_color || '#3B82F6',
    button: 'bg-blue-600 hover:bg-blue-700',
    text: 'text-blue-500',
    shadow: 'shadow-blue-500/20'
  };

  // ✅ دالة توليد كود التذكرة العشوائي
  const generateTicketCode = () => {
    return 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // ✅ معالجة الإرسال (محدثة لإصلاح الأخطاء)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // ✅ التحقق من صحة البيانات (Validation)

    // 1. الاسم
    if (!formData.name.trim()) {
      toast.warning('فضلا، أدخل الاسم الكامل');
      setSubmitting(false);
      return;
    }

    // 2. رقم الجوال (سعودي: يبدأ بـ 05 ويتكون من 10 أرقام)
    const saudiPhoneRegex = /^05\d{8}$/;
    if (!saudiPhoneRegex.test(formData.phone)) {
      toast.warning('رقم الجوال غير صحيح. يجب أن يبدأ بـ 05 ويتكون من 10 أرقام (مثال: 055xxxxxxx)');
      setSubmitting(false);
      return;
    }

    // 3. البريد الإلكتروني مطلوب
    if (!formData.email) {
      toast.warning('البريد الإلكتروني مطلوب');
      setSubmitting(false);
      return;
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.warning('صيغة البريد الإلكتروني غير صحيحة');
        setSubmitting(false);
        return;
      }
    }

    try {
      // تجهيز البيانات للإرسال
      // تجهيز البيانات للإرسال (متوافق مع جدول attendees)
      const insertPayload = {
        event_id: id,
        name: formData.name,       // كان guest_name
        status: 'confirmed',
        // ticket_code: generateTicketCode(), // سنعتمد على التوليد التلقائي في القاعدة أو نلغيه إذا لم يكن موجوداً
        phone: formData.phone,
        // companions: formData.companions, // تأكد إن العمود موجود، أو خزنه في seats
        email: formData.email || null,
        updated_at: new Date().toISOString()
      };

      // إضافة companions في جدول منفصل أو حقل jsonb إذا لزم الأمر، 
      // لكن للتبسيط سنفترض أن attendees يقبل هذه البيانات أو سنضيفها كملاحظة

      const { data, error } = await supabase
        .from('attendees')
        .insert([insertPayload])
        .select()
        .single();

      if (error) {
        // ✅ معالجة حالة التكرار مباشرة (المستخدم مسجل مسبقاً)
        if (error.code === '23505') {
          const { data: existingTicket } = await supabase
            .from('attendees')
            .select('id')
            .eq('event_id', id)
            .eq('phone', formData.phone)
            .single();

          if (existingTicket) {
            setTicketId(existingTicket.id);
            setSubmitted(true);
            return;
          }
        }

        console.error('Supabase Insert Error:', JSON.stringify(error, null, 2));
        throw error;
      }

      setTicketId(data.id);
      setSubmitted(true);

    } catch (err: any) {
      console.error('Catch Error:', JSON.stringify(err, null, 2));
      // عرض رسالة خطأ واضحة للمستخدم
      toast.error('حدث خطأ أثناء التسجيل: ' + (err.message || 'يرجى التأكد من البيانات والمحاولة مرة أخرى'));
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] blur-[150px] opacity-20 pointer-events-none bg-blue-600"></div>

        <div className="max-w-md w-full bg-white/[0.02] border border-white/10 p-12 rounded-[3.5rem] backdrop-blur-3xl animate-in zoom-in duration-500 relative z-10">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 bg-blue-500/20 text-blue-500">
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] blur-[150px] opacity-20 pointer-events-none transition-colors duration-1000 bg-blue-600"></div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">

          {/* 🔥 الإطار المضيء المدمج (الشعار أو الأيقونة) */}
          <div className={`relative w-28 h-28 mx-auto mb-8 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-1000 group ${theme.button} ${theme.shadow}`}>
            {event.image_url ? (
              <div className="w-full h-full rounded-[2rem] overflow-hidden bg-black/20 p-3 relative">
                {/* طبقة خلفية ضبابية */}
                <NextImage
                  src={event.image_url}
                  fill
                  className="absolute inset-0 object-cover blur-md opacity-50"
                  alt={`${event.name} - خلفية`}
                />
                {/* الشعار الأصلي */}
                <NextImage
                  src={event.image_url}
                  alt={`${event.name} - شعار`}
                  fill
                  className="relative object-contain z-10 drop-shadow-lg transform transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
            ) : (
              <div className="text-white">
                <Briefcase size={40} />
              </div>
            )}
          </div>

          <h1 className="text-4xl font-black text-white mb-4 tracking-tight drop-shadow-lg">{event.name}</h1>

          <p className="text-white/60 text-lg font-medium">
            يرجى تسجيل بياناتك لإصدار بطاقة الدخول
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
              <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="أدخل اسمك كما في الهوية" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-white/30 transition-all text-lg placeholder:text-white/20" />
            </div>

            {/* رقم الجوال */}
            <div className="group">
              <label className="block text-sm font-bold text-white/60 mb-3 mr-2 group-focus-within:text-white transition-colors">رقم الجوال</label>
              <input required type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="05xxxxxxxx" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-white/30 transition-all text-lg text-left placeholder:text-white/20" dir="ltr" />
            </div>

            {/* البريد الإلكتروني المهني */}
            <div className="group">
              <label className="block text-sm font-bold text-white/60 mb-3 mr-2 group-focus-within:text-white transition-colors">البريد الإلكتروني المهني</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-blue-500 transition-all text-lg placeholder:text-white/20 text-left"
                dir="ltr"
              />
            </div>

            {/* جهة العمل */}
            <div className="group">
              <label className="block text-sm font-bold text-white/60 mb-3 mr-2 group-focus-within:text-white transition-colors">جهة العمل</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="اسم الشركة أو المؤسسة"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-blue-500 transition-all text-lg placeholder:text-white/20"
              />
            </div>

            {/* المسمى الوظيفي */}
            <div className="group">
              <label className="block text-sm font-bold text-white/60 mb-3 mr-2 group-focus-within:text-white transition-colors">المسمى الوظيفي</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="مثال: مدير التسويق"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-blue-500 transition-all text-lg placeholder:text-white/20"
              />
            </div>
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