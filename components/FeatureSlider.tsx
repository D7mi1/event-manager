import { Smartphone, QrCode, BarChart3, ShieldCheck, Heart, Users, CalendarCheck, Presentation } from 'lucide-react';

export default function FeatureSlider({ isWedding }: { isWedding: boolean }) {
  // محتوى ديناميكي بناءً على الاختيار
  const features = isWedding ? [
    { icon: Heart, title: "دعوات العائلة", desc: "أرسل كرت الزواج عبر واتساب بلمسة فخمة." },
    { icon: QrCode, title: "تنظيم الدخول", desc: "باركود خاص لكل ضيف يمنع الازدحام." },
    { icon: Users, title: "إدارة الطاولات", desc: "توزيع ذكي للضيوف حسب المجموعات." },
    { icon: CalendarCheck, title: "تذكير آلي", desc: "رسائل تذكير قبل ليلة العمر بـ 24 ساعة." },
  ] : [
    { icon: Presentation, title: "تسجيل المؤتمرات", desc: "نظام تسجيل احترافي للمشاركين والشركاء." },
    { icon: QrCode, title: "طباعة البطاقات", desc: "إصدار بطاقات التعريف (Badges) فور الوصول." },
    { icon: BarChart3, title: "تقارير الحضور", desc: "إحصائيات دقيقة للحضور والغياب لحظياً." },
    { icon: Smartphone, title: "تطبيق المنظم", desc: "تحكم كامل في الفعالية من جوالك." },
  ];

  return (
    <section className="py-20 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => (
            <div key={idx} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] hover:bg-white/[0.07] transition-all duration-500 group">
              <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 transition-all duration-500 ${
                isWedding ? 'text-[#C19D65] shadow-[0_0_15px_rgba(193,157,101,0.2)]' : 'text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
              } group-hover:scale-110`}>
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white transition-colors duration-500">{item.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}