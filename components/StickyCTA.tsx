'use client';
import { ArrowLeft } from 'lucide-react';

export default function StickyCTA({ isWedding }: { isWedding: boolean }) {
  return (
    <div className="fixed bottom-8 left-6 right-6 z-50 md:hidden">
      <button className={`w-full py-4 rounded-2xl font-bold text-white shadow-2xl flex items-center justify-center gap-3 transition-transform active:scale-95 ${
        isWedding ? 'bg-[#C19D65]' : 'bg-[#2563EB]'
      }`}>
        <span>{isWedding ? "صمم دعوات فرحك" : "ابدأ تنظيم مؤتمرك"}</span>
        <ArrowLeft size={20} />
      </button>
    </div>
  );
}