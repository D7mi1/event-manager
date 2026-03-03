'use client';

import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/marketing/HeroSection';
import FeatureSlider from '@/components/marketing/FeatureSlider';
import StickyCTA from '@/components/marketing/StickyCTA';
import { ArrowUpLeft, Calendar, Tag, Heart, QrCode, Send, ArrowLeft } from 'lucide-react';

export default function Home() {

  const blogPosts = [
    {
      id: 1,
      title: "وداعاً للدعوات الورقية: لماذا الباركود الديناميكي هو المستقبل؟",
      excerpt: "اكتشف كيف يساهم التحول الرقمي في تنظيم حفلات الزفاف والمؤتمرات بسلاسة ودون طوابير.",
      category: "تقنية الفعاليات",
      date: "8 يناير 2025",
      image: "bg-gradient-to-br from-purple-900 to-slate-900"
    },
    {
      id: 2,
      title: "5 نصائح لتنظيم مناسبة لا تُنسى: من الفكرة إلى التنفيذ",
      excerpt: "دليل شامل لتنظيم الزفاف، حفلات التخرّج، والمؤتمرات بكفاءة وتجربة ضيوف مميزة.",
      category: "تنظيم",
      date: "5 يناير 2025",
      image: "bg-gradient-to-br from-slate-800 to-gray-900"
    },
    {
      id: 3,
      title: "أمن المعلومات في الفعاليات: حماية بيانات ضيوفك مسؤولية",
      excerpt: "كيف تضمن منصة مِراس عدم تكرار الدعوات أو دخول غير المدعوين عبر نظام التحقق المشفر.",
      category: "أمان",
      date: "2 يناير 2025",
      image: "bg-gradient-to-br from-blue-900 to-slate-900"
    }
  ];

  return (
    <main className="min-h-screen relative bg-[#0F0F12] overflow-hidden transition-colors duration-1000 selection:bg-blue-500/30 text-right" dir="rtl">

      {/* رابط تخطي إلى المحتوى الرئيسي */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-[100] focus:bg-blue-600 focus:text-white focus:px-6 focus:py-3 focus:rounded-xl focus:font-bold focus:text-sm"
      >
        تخطي إلى المحتوى الرئيسي
      </a>

      {/* الخلفية التقنية */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40" aria-hidden="true">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#2563EB" strokeWidth="0.2" strokeOpacity="0.2" />
          </pattern>
          <g className="glow-line">
            {[...Array(6)].map((_, i) => (
              <line key={i} x1="-10%" y1={`${15 * i}%`} x2="110%" y2={`${15 * i + 10}%`} stroke="#2563EB" className="animate-fiber" style={{ animationDelay: `${i * 1.2}s`, strokeDasharray: '150 400' }} />
            ))}
          </g>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10" id="main-content">
        <Navbar />

        {/* قسم الهيرو */}
        <HeroSection />

        {/* شريط المميزات */}
        <div className="py-10 bg-white/5 border-y border-white/10 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap gap-16 text-white/40 text-sm font-bold items-center">
            <span>💒 حفلات زفاف وتخرّج</span>
            <span>•</span>
            <span>🎤 مؤتمرات وورش عمل</span>
            <span>•</span>
            <span>🎫 دعوات QR ذكية</span>
            <span>•</span>
            <span>📊 تتبع حضور فوري</span>
            <span>•</span>
            <span>🏢 معارض ومنتديات</span>
            <span>•</span>
            <span>💒 حفلات زفاف وتخرّج</span>
            <span>•</span>
            <span>🎤 مؤتمرات وورش عمل</span>
            <span>•</span>
            <span>🎫 دعوات QR ذكية</span>
            <span>•</span>
            <span>📊 تتبع حضور فوري</span>
            <span>•</span>
            <span>🏢 معارض ومنتديات</span>
          </div>
        </div>

        <FeatureSlider />

        {/* قسم الزفاف الذهبي */}
        <section className="py-20 px-6 relative overflow-hidden">
          {/* الضوء الذهبي الخلفي */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-10 pointer-events-none bg-[#C19D65]" aria-hidden="true"></div>

          <div className="max-w-5xl mx-auto relative">
            <div className="bg-gradient-to-l from-[#C19D65]/10 to-transparent border border-[#C19D65]/20 rounded-[2rem] p-10 md:p-14">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 text-center md:text-right">
                  <div className="inline-flex items-center gap-2 bg-[#C19D65]/10 text-[#C19D65] text-xs font-bold px-4 py-2 rounded-full mb-6">
                    <Heart className="w-4 h-4" />
                    حفلات الزفاف
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                    نظّم حفل <span className="text-[#C19D65]">زفافك</span> بكل سهولة
                  </h2>
                  <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-lg">
                    دعوات رقمية أنيقة، تسجيل حضور بـ QR، رسائل واتساب تلقائية، وخريطة مقاعد — كل ما تحتاجه لليلة العمر.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                    <a href="/wedding" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm bg-[#C19D65] text-black hover:bg-[#D4AF7A] transition-all duration-300">
                      تصفح باقات الزفاف
                      <ArrowLeft className="w-4 h-4" />
                    </a>
                    <a href="/pricing?tab=single_event" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm border border-[#C19D65]/30 text-[#C19D65] hover:bg-[#C19D65]/5 transition-all duration-300">
                      الأسعار تبدأ من 149 ر.س
                    </a>
                  </div>
                </div>
                {/* أيقونات المميزات */}
                <div className="grid grid-cols-2 gap-4 shrink-0">
                  {[
                    { icon: Heart, label: 'دعوات أنيقة' },
                    { icon: QrCode, label: 'مسح QR ذكي' },
                    { icon: Send, label: 'رسائل واتساب' },
                    { icon: Calendar, label: 'تنظيم شامل' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-center hover:border-[#C19D65]/20 transition-colors">
                      <item.icon className="w-6 h-6 text-[#C19D65] mx-auto mb-2" />
                      <span className="text-white/60 text-xs font-bold">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* قسم كيف يعمل */}
        <section className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white leading-tight">
              رحلتك مع <span className="text-blue-500">مِراس</span> في 3 خطوات
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { id: '01', t: 'أنشئ فعاليتك', d: 'زفاف، تخرّج، مؤتمر، أو أي مناسبة — أدخل التفاصيل في ثوانٍ.' },
                { id: '02', t: 'أرسل الدعوات', d: 'تصل دعوات واتساب أو إيميل بباركود خاص وتصميم احترافي لكل ضيف.' },
                { id: '03', t: 'نظّم الحضور', d: 'امسح الباركود عند الدخول وتابع الحضور لحظة بلحظة.' }
              ].map((step) => (
                <div key={step.id} className="relative group text-center">
                  <div className="text-7xl font-black mb-4 opacity-5 transition-colors duration-500 group-hover:text-blue-500 opacity-10">{step.id}</div>
                  <h3 className="text-xl font-bold mb-2 text-white">{step.t}</h3>
                  <p className="text-white/60 text-sm leading-relaxed max-w-[200px] mx-auto">{step.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* قسم الأسعار */}
        <section className="py-32 px-6 relative overflow-hidden bg-white/[0.01]">
          <div className="max-w-7xl mx-auto text-center mb-20">
            <h2 className="text-4xl font-bold mb-6 text-white">باقات شفافة تناسب احتياجك</h2>
            <p className="text-white/40 max-w-xl mx-auto">اشتراكات شهرية، باقات فعالية واحدة، أو إضافات حسب الحاجة.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-end">
            {/* باقة مجانية */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] flex flex-col transition-all hover:border-white/10">
              <h3 className="text-xl font-bold mb-2 text-white/80">مجانية</h3>
              <div className="text-4xl font-bold mb-8 text-white/40">0 <span className="text-sm opacity-40">ر.س</span></div>
              <ul className="space-y-4 mb-12 flex-1 text-sm text-white/50">
                <li>✓ فعالية واحدة</li>
                <li>✓ حتى 50 ضيف</li>
                <li>✓ QR تذاكر + مسح</li>
                <li>✓ إرسال عبر الإيميل</li>
              </ul>
              <a href="/login" className="w-full py-4 rounded-2xl border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-all text-sm text-center block">ابدأ مجاناً</a>
            </div>

            {/* باقة المبتدئ - الأكثر طلباً */}
            <div className="p-[2px] rounded-[3rem] transition-all duration-700 scale-105 transform shadow-2xl bg-gradient-to-b from-blue-500 to-transparent shadow-blue-500/20">
              <div className="bg-[#121215] p-10 rounded-[2.9rem] h-full flex flex-col">
                <div className="text-black text-[10px] font-bold px-4 py-1.5 rounded-full w-fit mb-4 bg-blue-500">الأكثر طلباً</div>
                <h3 className="text-2xl font-bold mb-2 text-white">المبتدئ</h3>
                <div className="text-5xl font-bold mb-2 text-blue-500">79 <span className="text-lg opacity-40">ر.س/شهر</span></div>
                <p className="text-white/30 text-xs mb-8">أو 790 ر.س/سنة (وفّر %17)</p>
                <ul className="space-y-4 mb-12 flex-1 text-sm text-white/80">
                  <li>✓ 5 فعاليات + 300 ضيف</li>
                  <li>✓ تحليلات + تصدير Excel</li>
                  <li>✓ 200 رسالة واتساب</li>
                  <li>✓ 50 تصميم AI</li>
                  <li>✓ استبيان بعد الفعالية</li>
                </ul>
                <a href="/pricing" className="w-full py-5 rounded-2xl font-black transition-all text-black text-lg bg-blue-500 hover:bg-blue-600 text-center block">اشترك الآن</a>
              </div>
            </div>

            {/* باقة الاحترافي */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] flex flex-col transition-all hover:border-white/10">
              <h3 className="text-xl font-bold mb-2 text-white/80">الاحترافي</h3>
              <div className="text-4xl font-bold mb-2 text-[#C19D65]">199 <span className="text-sm opacity-40">ر.س/شهر</span></div>
              <p className="text-white/30 text-xs mb-8">أو 1,990 ر.س/سنة (وفّر %17)</p>
              <ul className="space-y-4 mb-12 flex-1 text-sm text-white/50">
                <li>✓ 20 فعالية + 2,000 ضيف</li>
                <li>✓ خريطة مقاعد + هوية مخصصة</li>
                <li>✓ 1,000 واتساب + 200 AI</li>
                <li>✓ شهادات + Wallet Pass</li>
                <li>✓ دعم أولوية</li>
              </ul>
              <a href="/pricing" className="w-full py-4 rounded-2xl border border-[#C19D65]/30 text-[#C19D65] font-bold hover:bg-[#C19D65]/5 transition-all text-sm text-center block">عرض التفاصيل</a>
            </div>
          </div>

          {/* باقة الفعالية الواحدة */}
          <div className="max-w-2xl mx-auto mt-12 text-center">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <p className="text-white/50 text-sm mb-2">تحتاج فعالية واحدة فقط بدون اشتراك؟</p>
              <p className="text-white/70 text-sm">باقات تبدأ من <span className="text-[#C19D65] font-bold">149 ر.س</span> لفعالية واحدة</p>
              <a href="/pricing" className="inline-block mt-3 text-blue-400 text-sm font-bold hover:text-blue-300 transition-colors">تصفح باقات الفعالية الواحدة ←</a>
            </div>
          </div>
        </section>

        {/* قسم المدونة */}
        <section className="py-24 px-6 relative border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">أحدث المقالات والرؤى</h2>
                <p className="text-white/40 max-w-md">اكتشف أحدث التقنيات والنصائح في عالم تنظيم الفعاليات والمناسبات.</p>
              </div>
              <a href="/blog" className="text-sm font-bold flex items-center gap-2 transition-colors text-blue-500 hover:text-blue-400">
                عرض كل المقالات <ArrowUpLeft size={16} aria-hidden="true" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <div key={post.id} className="group bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2">
                  <div className={`h-48 w-full ${post.image} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-500"></div>
                  </div>

                  <div className="p-8">
                    <div className="flex items-center gap-4 text-xs font-bold text-white/30 mb-4">
                      <span className="flex items-center gap-1 text-blue-500">
                        <Tag size={12} /> {post.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {post.date}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-white transition-colors">{post.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed mb-6 line-clamp-2">{post.excerpt}</p>

                    <div className="flex items-center text-sm font-bold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-500">
                      اقرأ المزيد <ArrowUpLeft className="mr-2" size={16} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* قسم الأسئلة الشائعة */}
        <section className="py-24 px-6 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16 text-white leading-tight">لديك استفسار؟ <br /> <span className="text-white/40 text-lg font-normal">إليك ما يسأل عنه منظمو الفعاليات والمناسبات</span></h2>
            <div className="space-y-8">
              {[
                { q: "هل أحتاج أجهزة خاصة لمسح الباركود؟", a: "إطلاقاً، أي هاتف ذكي يعمل كقارئ باركود احترافي سواء كانت فعاليتك زفافاً أو مؤتمراً." },
                { q: "هل تناسب الفعاليات الصغيرة والكبيرة؟", a: "نعم، من حفل تخرّج بـ 30 ضيف إلى مؤتمر بـ 2,000 مشارك — مِراس مصممة لتناسب الجميع." },
                { q: "كيف تصل الدعوات للضيوف؟", a: "عبر رسائل واتساب أو إيميلات تحتوي على دعوة مصممة مع باركود خاص بكل ضيف." },
                { q: "هل يمكنني تخصيص تصميم الدعوة؟", a: "نعم، يوفر مِراس مصمم قوالب يتيح لك اختيار وتخصيص تصميم دعوتك بالكامل." }
              ].map((faq, i) => (
                <div key={i} className="group cursor-pointer">
                  <h4 className="text-lg font-bold mb-3 transition-colors group-hover:text-blue-500">{faq.q}</h4>
                  <p className="text-white/50 text-sm leading-relaxed border-r-2 border-white/10 pr-4">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* التذييل (Footer) */}
        <footer className="py-16 px-6 bg-black/40 border-t border-white/5 text-center">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-8 mb-8 text-sm text-white/30 font-bold">
              <a href="/about" className="hover:text-white transition-colors">من نحن</a>
              <a href="/pricing" className="hover:text-white transition-colors">الأسعار والباقات</a>
              <a href="/contact" className="hover:text-white transition-colors">تواصل معنا</a>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mb-8 text-xs text-white/20">
              <a href="/terms" className="hover:text-white/50 transition-colors">شروط الاستخدام</a>
              <span className="text-white/10">|</span>
              <a href="/privacy" className="hover:text-white/50 transition-colors">سياسة الخصوصية</a>
            </div>
            <p className="text-white/10 text-xs">© {new Date().getFullYear()} مِـراس. المنصة الأولى لتنظيم المناسبات والفعاليات في المملكة.</p>
          </div>
        </footer>
      </div>

      <StickyCTA />
    </main>
  );
}
