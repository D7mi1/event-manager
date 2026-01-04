import { Sparkles, Briefcase } from 'lucide-react';

interface Props {
  eventType: 'social' | 'business' | null;
  setEventType: (type: 'social' | 'business') => void;
  onNext: () => void;
}

export function EventTypeStep({ eventType, setEventType, onNext }: Props) {
  return (
    <div className="animate-in fade-in slide-in-from-right duration-300">
      <h1 className="text-3xl font-black mb-2">ما نوع مناسبتك؟ ✨</h1>
      <p className="text-white/40 mb-8 text-sm">سنقوم بتخصيص التصميم بناءً على اختيارك.</p>
      
      <div className="space-y-4">
        <button 
          onClick={() => { setEventType('social'); onNext(); }} 
          className={`w-full p-6 rounded-3xl border transition-all text-right flex items-center gap-4 group ${eventType === 'social' ? 'border-[#C19D65] bg-[#C19D65]/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/5'}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#C19D65]/10 flex items-center justify-center text-[#C19D65]">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="font-bold">أفراح ومناسبات اجتماعية</p>
            <p className="text-xs text-white/30 mt-1">دعوات زفاف، خطوبة، تخرج</p>
          </div>
        </button>

        <button 
          onClick={() => { setEventType('business'); onNext(); }} 
          className={`w-full p-6 rounded-3xl border transition-all text-right flex items-center gap-4 group ${eventType === 'business' ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/5'}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="font-bold">أعمال ومؤتمرات</p>
            <p className="text-xs text-white/30 mt-1">ندوات، ورش عمل، اجتماعات</p>
          </div>
        </button>
      </div>
    </div>
  );
}   