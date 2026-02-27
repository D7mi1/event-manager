import { Heart, GraduationCap, Briefcase, Presentation, Users, Megaphone, PartyPopper, Sparkles } from 'lucide-react';

interface Props {
  eventType: string | null;
  setEventType: (type: string) => void;
  onNext: () => void;
}

export function EventTypeStep({ eventType, setEventType, onNext }: Props) {
  const types = [
    { id: 'wedding', icon: Heart, label: 'زفاف', desc: 'حفلات زفاف، ملكة، خطوبة', category: 'social' },
    { id: 'graduation', icon: GraduationCap, label: 'تخرّج', desc: 'حفلات تخرّج، تكريم أكاديمي', category: 'social' },
    { id: 'social', icon: PartyPopper, label: 'مناسبة اجتماعية', desc: 'أعياد ميلاد، عزائم، تجمعات عائلية', category: 'social' },
    { id: 'conference', icon: Presentation, label: 'مؤتمر', desc: 'مؤتمرات، منتديات، قمم', category: 'business' },
    { id: 'workshop', icon: Users, label: 'ورشة عمل', desc: 'ورش تدريبية، ندوات، سمينارات', category: 'business' },
    { id: 'exhibition', icon: Megaphone, label: 'معرض', desc: 'معارض تجارية، حفلات إطلاق', category: 'business' },
    { id: 'business', icon: Briefcase, label: 'فعالية أعمال', desc: 'اجتماعات، حفلات تكريم، افتتاحات', category: 'business' },
    { id: 'other', icon: Sparkles, label: 'أخرى', desc: 'أي فعالية لم تجدها في القائمة', category: 'other' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-right duration-300">
      <h1 className="text-3xl font-black mb-2">ما نوع فعاليتك؟</h1>
      <p className="text-white/40 mb-8 text-sm">سنقوم بتخصيص التصميم بناءً على اختيارك.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => { setEventType(type.id); onNext(); }}
            className={`w-full p-5 rounded-2xl border transition-all text-right flex items-center gap-4 group ${eventType === type.id ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/5'}`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${type.category === 'social' ? 'bg-pink-500/10 text-pink-400' : type.category === 'business' ? 'bg-blue-500/10 text-blue-500' : 'bg-white/10 text-white/60'}`}>
              <type.icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm">{type.label}</p>
              <p className="text-xs text-white/30 mt-0.5 truncate">{type.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
