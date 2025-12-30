'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeatureSlider from '@/components/FeatureSlider';
import StickyCTA from '@/components/StickyCTA';

export default function Home() {
  const [isWedding, setIsWedding] = useState(true);

  return (
    <main className="min-h-screen relative bg-[#0F0F12] overflow-hidden transition-colors duration-1000 selection:bg-primary-500/30 text-right" dir="rtl">
      
      {/* 1. طبقة الخيوط الضوئية (الخلفية التقنية) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke={isWedding ? "#C19D65" : "#2563EB"} strokeWidth="0.2" strokeOpacity="0.2" className="transition-colors duration-1000" />
          </pattern>
          <g className="glow-line">
            {[...Array(6)].map((_, i) => (
              <line key={i} x1="-10%" y1={`${15 * i}%`} x2="110%" y2={`${15 * i + 10}%`} stroke={isWedding ? "#C19D65" : "#2563EB"} className="transition-colors duration-1000 animate-fiber" style={{ animationDelay: `${i * 1.2}s`, strokeDasharray: '150 400' }} />
            ))}
          </g>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        <Navbar isWedding={isWedding} />
        
        {/* 2. قسم الهيرو (صياغة بيعية Benefit-driven) */}
        <HeroSection isWedding={isWedding} onToggle={setIsWedding} />
        
        {/* 3. شريط المميزات (حلول للمشكلات الحقيقية) */}
        <FeatureSlider isWedding={isWedding} />

        {/* 4. قسم "كيف يعمل مِراس؟" (إزالة الخوف التقني) */}
        <section className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white leading-tight">
              رحلتك مع <span className={isWedding ? "text-[#C19D65]" : "text-blue-500"}>مِراس</span> في 3 خطوات
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { id: '01', t: 'أنشئ مناسبتك', d: 'أدخل التفاصيل وارفع قائمة الضيوف في ثوانٍ.' },
                { id: '02', t: 'أرسل الدعوات', d: 'تصل رسائل واتساب بباركود خاص وتصميم فخم.' },
                { id: '03', t: 'نظّم الدخول', d: 'بضغطة زر عند البوابة، ودّع طوابير الانتظار.' }
              ].map((step) => (
                <div key={step.id} className="relative group text-center">
                  <div className={`text-7xl font-black mb-4 opacity-5 transition-colors duration-500 ${isWedding ? "group-hover:text-[#C19D65] opacity-10" : "group-hover:text-blue-500 opacity-10"}`}>{step.id}</div>
                  <h3 className="text-xl font-bold mb-2 text-white">{step.t}</h3>
                  <p className="text-white/60 text-sm leading-relaxed max-w-[200px] mx-auto">{step.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. قسم الأسعار (Pricing & Conversion) */}
        <section className="py-32 px-6 relative overflow-hidden bg-white/[0.01]">
          <div className="max-w-7xl mx-auto text-center mb-20">
            <h2 className="text-4xl font-bold mb-6 text-white">باقات شفافة تناسب احتياجك</h2>
            <p className="text-white/40 max-w-xl mx-auto">اختر الباقة التي تناسب حجم مناسبتك وابدأ فوراً.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-end">
            
            {/* باقة شخصية - زر مفرغ لتقليل الـ CTR عليها */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] flex flex-col transition-all">
              <h3 className="text-xl font-bold mb-2 text-white/80">شخصية</h3>
              <div className="text-4xl font-bold mb-8 text-white/40">مجانية</div>
              <ul className="space-y-4 mb-12 flex-1 text-sm text-white/50">
                <li>✓ مناسبة واحدة</li>
                <li>✓ قارئ باركود واحد</li>
                <li>✓ إرسال عبر الإيميل</li>
              </ul>
              <button className="w-full py-4 rounded-2xl border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-all text-xs">ابدأ مجاناً</button>
            </div>

            {/* باقة متطورة - (The Money Maker) زر مصمت وتصميم بارز */}
            <div className={`p-[2px] rounded-[3rem] transition-all duration-700 scale-105 transform shadow-2xl ${isWedding ? 'bg-gradient-to-b from-[#C19D65] to-transparent shadow-[#C19D65]/20' : 'bg-gradient-to-b from-blue-500 to-transparent shadow-blue-500/20'}`}>
              <div className="bg-[#121215] p-10 rounded-[2.9rem] h-full flex flex-col">
                <div className={`text-black text-[10px] font-bold px-4 py-1.5 rounded-full w-fit mb-4 ${isWedding ? 'bg-[#C19D65]' : 'bg-blue-500'}`}>الأكثر طلباً</div>
                <h3 className="text-2xl font-bold mb-2 text-white">متطورة</h3>
                <div className={`text-5xl font-bold mb-8 ${isWedding ? 'text-[#C19D65]' : 'text-blue-500'}`}>59 <span className="text-lg opacity-40">ريال</span></div>
                <ul className="space-y-4 mb-12 flex-1 text-sm text-white/80">
                  <li>✓ مناسبات متعددة متزامنة</li>
                  <li>✓ أكثر من قارئ باركود</li>
                  <li>✓ إيميلات تلقائية</li>
                </ul>
                <button className={`w-full py-5 rounded-2xl font-black transition-all text-black text-lg ${isWedding ? 'bg-[#C19D65] hover:bg-[#A4824E]' : 'bg-blue-500 hover:bg-blue-600'}`}>اشترك الآن</button>
              </div>
            </div>

            {/* باقة احترافية */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] flex flex-col transition-all">
              <h3 className="text-xl font-bold mb-2 text-white/80">احترافية</h3>
              <div className={`text-4xl font-bold mb-8 ${isWedding ? 'text-[#C19D65]' : 'text-blue-500'}`}>149 <span className="text-sm opacity-40">ريال</span></div>
              <ul className="space-y-4 mb-12 flex-1 text-sm text-white/50">
                <li>✓ ربط رقم الواتساب الخاص</li>
                <li>✓ إرسال مباشر من هاتفك</li>
                <li>✓ إزالة شعار مِراس</li>
              </ul>
              <button className="w-full py-4 rounded-2xl border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-all">اختر الباقة</button>
            </div>
          </div>
        </section>

        {/* 6. قسم الأسئلة الشائعة (بناء الثقة) */}
        <section className="py-24 px-6 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16 text-white leading-tight">لديك استفسار؟ <br/> <span className="text-white/40 text-lg font-normal">إليك ما يسأل عنه المنظمون عادةً</span></h2>
            <div className="space-y-8">
              {[
                { q: "هل أحتاج طابعة باركود؟", a: "إطلاقاً، أي هاتف ذكي يعمل كقارئ باركود احترافي عبر تطبيقنا." },
                { q: "هل يعمل النظام بدون إنترنت؟", a: "نعم، يدعم مِراس المزامنة التلقائية فور توفر الاتصال لضمان عدم توقف الدخول." },
                { q: "كيف تصل الدعوات للضيوف؟", a: "عبر رسائل واتساب نصية تحتوي على رابط الكرت والباركود الخاص بكل ضيف." }
              ].map((faq, i) => (
                <div key={i} className="group cursor-pointer">
                  <h4 className={`text-lg font-bold mb-3 transition-colors ${isWedding ? "group-hover:text-[#C19D65]" : "group-hover:text-blue-500"}`}>{faq.q}</h4>
                  <p className="text-white/50 text-sm leading-relaxed border-r-2 border-white/10 pr-4">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. التذييل (Footer) الاحترافي */}
        <footer className="py-16 px-6 bg-black/40 border-t border-white/5 text-center">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
             <div className="flex gap-8 mb-8 text-sm text-white/30 font-bold">
                <a href="#" className="hover:text-white transition-colors">المميزات</a>
                <a href="#" className="hover:text-white transition-colors">الباقات</a>
                <a href="#" className="hover:text-white transition-colors">الأسئلة الشائعة</a>
             </div>
             <p className="text-white/10 text-xs">© 2025 مِـراس. صُنع بكل فخر لتنظيم فعاليات تليق بك.</p>
          </div>
        </footer>
      </div>

      <StickyCTA isWedding={isWedding} />
    </main>
  );
}