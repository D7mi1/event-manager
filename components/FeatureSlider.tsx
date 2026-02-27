import { Smartphone, QrCode, BarChart3, Send } from 'lucide-react';

export default function FeatureSlider() {
  const features = [
    { icon: Send, title: "دعوات ذكية", desc: "أرسل دعوات مصممة عبر واتساب أو إيميل لكل ضيف تلقائياً." },
    { icon: QrCode, title: "باركود لكل ضيف", desc: "كل ضيف يحصل على باركود فريد لدخول سلس ومنظم." },
    { icon: BarChart3, title: "تتبع الحضور", desc: "تابع من حضر ومن لم يحضر لحظة بلحظة من لوحة التحكم." },
    { icon: Smartphone, title: "إدارة من جوالك", desc: "تحكم كامل في فعاليتك من أي مكان عبر هاتفك." },
  ];

  return (
    <section className="py-20 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => (
            <div key={idx} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] hover:bg-white/[0.07] transition-all duration-500 group">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 transition-all duration-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:scale-110">
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
