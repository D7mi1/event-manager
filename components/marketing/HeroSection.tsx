'use client';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative pt-40 pb-20 px-6 min-h-[80vh] flex flex-col items-center justify-center text-center">
      {/* الضوء الخلفي */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none bg-blue-600"></div>

      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-8xl font-bold text-white leading-tight">
        أدر <span className="text-blue-500">فعالياتك</span> باحترافية
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/40 text-lg mt-6 max-w-2xl">
        من حفلات الزفاف والتخرّج إلى المؤتمرات والمعارض — نظّم، أرسل الدعوات، وتابع الحضور بتقنية QR ذكية
      </motion.p>

      {/* أزرار CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 mt-10">
        <a href="/login" className="px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]">
          ابدأ تنظيم فعاليتك
        </a>
        <a href="/pricing" className="px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-300 border border-white/20 text-white/80 hover:bg-white/5 hover:text-white">
          تصفح الباقات
        </a>
      </motion.div>
    </section>
  );
}
