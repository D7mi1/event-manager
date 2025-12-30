'use client';

import { useState } from 'react';
import { Sparkles, Send, MapPin, Calendar, Users, Briefcase } from 'lucide-react';

export default function GuestRSVP({ params }: { params: { id: string } }) {
  // ملاحظة للمبرمج: في الواقع، يتم جلب isWedding من قاعدة البيانات بناءً على params.id
  const [isWedding, setIsWedding] = useState(true); 
  const [submitted, setSubmitted] = useState(false);

  const theme = {
    primary: isWedding ? '#C19D65' : '#3B82F6',
    button: isWedding ? 'bg-[#C19D65] hover:bg-[#A4824E]' : 'bg-blue-600 hover:bg-blue-700',
    text: isWedding ? 'text-[#C19D65]' : 'text-blue-500',
    shadow: isWedding ? 'shadow-[#C19D65]/20' : 'shadow-blue-500/20'
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-6 text-center text-white" dir="rtl">
        <div className="max-w-md w-full bg-white/[0.02] border border-white/10 p-12 rounded-[3.5rem] backdrop-blur-3xl animate-in zoom-in duration-500">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-8 text-green-500">
            <Sparkles size={40} />
          </div>
          <h2 className="text-3xl font-black mb-4">تم تأكيد حضورك!</h2>
          <p className="text-white/40 mb-10 leading-relaxed">شكراً لك، ستصلك تذكرة الدخول والباركود عبر الواتساب فور مراجعة الطلب.</p>
          <button className="w-full py-5 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all">العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] relative overflow-hidden flex items-center justify-center p-6 text-right" dir="rtl">
      {/* طبقة الإضاءة الديناميكية */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] blur-[150px] opacity-20 pointer-events-none transition-colors duration-1000 ${isWedding ? 'bg-[#C19D65]' : 'bg-blue-600'}`}></div>

      <div className="max-w-2xl w-full relative z-10">
        {/* رأس النموذج */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className={`w-20 h-20 rounded-[2rem] mx-auto mb-8 flex items-center justify-center text-white shadow-2xl transition-all duration-1000 ${theme.button} ${theme.shadow}`}>
             {isWedding ? <Sparkles size={35} /> : <Briefcase size={35} />}
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">تأكيد الحضور</h1>
          <p className="text-white/40 text-lg">{isWedding ? 'نتشرف بدعوتكم لمشاركتنا ليلة العمر' : 'يرجى تسجيل بياناتك لإصدار بطاقة الدخول للمؤتمر'}</p>
        </div>

        {/* نموذج البيانات الذكي (RSVP Form) */}
        <form 
          onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} 
          className="space-y-8 bg-white/[0.02] border border-white/10 p-10 md:p-14 rounded-[4rem] backdrop-blur-2xl shadow-2xl"
        >
          {/* الحقول الأساسية لجميع الباقات */}
          <div className="space-y-6">
            <div className="group">
              <label className="block text-sm font-bold text-white/40 mb-3 mr-2 group-focus-within:text-white transition-colors">الاسم الكامل</label>
              <input 
                required 
                type="text" 
                placeholder="أدخل اسمك كما في الهوية" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-white/30 transition-all text-lg" 
              />
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-white/40 mb-3 mr-2 group-focus-within:text-white transition-colors">رقم الجوال</label>
              <input 
                required 
                type="tel" 
                placeholder="05xxxxxxxx" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none transition-all text-lg text-left" 
                dir="ltr"
              />
            </div>

            {/* منطق التبديل حسب نوع المناسبة */}
            {isWedding ? (
              <div className="animate-in fade-in duration-500">
                <label className="block text-sm font-bold text-white/40 mb-3 mr-2 italic">عدد المرافقين</label>
                <div className="grid grid-cols-4 gap-4 text-center">
                  {[0, 1, 2, 3].map((num) => (
                    <button 
                      key={num} 
                      type="button" 
                      className="py-4 rounded-xl border border-white/10 bg-white/5 hover:border-[#C19D65] hover:text-[#C19D65] transition-all text-white font-bold"
                    >
                      {num === 0 ? 'بمفردي' : num}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-white/40 mb-3 mr-2">جهة العمل / الشركة</label>
                  <input type="text" placeholder="اسم المنظمة" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-blue-500 transition-all text-lg" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/40 mb-3 mr-2">المسمى الوظيفي</label>
                  <input type="text" placeholder="مثلاً: مدير تنفيذي" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-blue-500 transition-all text-lg" />
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className={`w-full py-6 rounded-2xl text-black font-black text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${theme.button} ${theme.shadow}`}
          >
            <Send size={24} />
            تأكيد الحضور الآن
          </button>

          <p className="text-center text-[10px] text-white/20 tracking-widest uppercase">
            تأمين البيانات بواسطة مِـراس © 2025
          </p>
        </form>
      </div>
    </div>
  );
}