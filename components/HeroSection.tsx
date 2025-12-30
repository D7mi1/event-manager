'use client';
import { motion } from 'framer-motion';

export default function HeroSection({ isWedding, onToggle }: any) {
  return (
    <section className="relative pt-40 pb-20 px-6 min-h-[80vh] flex flex-col items-center justify-center text-center">
      {/* الضوء الخلفي المتغير */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none transition-all duration-1000 ${isWedding ? 'bg-[#C19D65]' : 'bg-blue-600'}`}></div>

      <div className="relative z-10 mb-12 p-2 bg-white/5 border border-white/10 rounded-full inline-flex">
        <button onClick={() => onToggle(true)} className={`px-8 py-3 rounded-full text-base font-bold transition-all ${isWedding ? 'bg-[#C19D65] text-white' : 'text-gray-400'}`}>أفراح ✨</button>
        <button onClick={() => onToggle(false)} className={`px-8 py-3 rounded-full text-base font-bold transition-all ${!isWedding ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>أعمال 💼</button>
      </div>

      <motion.h1 key={isWedding ? "w" : "b"} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-8xl font-bold text-white leading-tight">
        {isWedding ? (<>وثّق لحظات <span className="text-[#C19D65]">الفرح</span></>) : (<>أدر مناسبات <span className="text-blue-600">الأعمال</span></>)}
      </motion.h1>
    </section>
  );
}