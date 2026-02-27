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
    </section>
  );
}
