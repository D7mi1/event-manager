import { Sparkles, Briefcase, Calendar, MapPin, X } from 'lucide-react';

interface Props {
  eventType: 'social' | 'business' | null;
  details: any;
  color: string;
  isMobileOpen?: boolean; 
  onClose?: () => void;
}

export function EventPreview({ eventType, details, color, isMobileOpen = false, onClose }: Props) {
  
  const containerClasses = isMobileOpen 
    ? "fixed inset-0 z-50 bg-[#0A0A0C] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-300" 
    : "hidden lg:flex w-1/2 bg-[#0F0F12] border-r border-white/5 relative items-center justify-center p-10 overflow-hidden sticky top-0 h-screen";

  return (
    <div className={containerClasses}>
        
        {/* زر إغلاق (للجوال) */}
        {isMobileOpen && (
          <button onClick={onClose} className="absolute top-6 left-6 p-3 bg-white/10 rounded-full text-white z-50 hover:bg-white/20 transition-colors">
            <X size={24} />
          </button>
        )}

        {/* خلفية ضبابية */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 transition-colors duration-1000 pointer-events-none" style={{ backgroundColor: color }}></div>

        {/* إطار الجوال */}
        <div className={`relative bg-black rounded-[3rem] border-[8px] border-[#2A2A2E] shadow-2xl overflow-hidden z-10 transition-transform duration-500 ${isMobileOpen ? 'w-full h-[85vh] max-w-[380px]' : 'w-[380px] h-[750px] hover:scale-[1.02]'}`}>
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#2A2A2E] rounded-b-2xl z-20"></div>

          <div className="w-full h-full bg-[#050505] relative overflow-hidden flex flex-col">
            
            {/* 1. الغلاف العلوي (خلفية فقط) */}
            <div className="h-2/5 w-full relative transition-colors duration-700 overflow-hidden" style={{ backgroundColor: color }}>
               {details.image_url ? (
                 <img src={details.image_url} className="w-full h-full object-cover opacity-80" alt="Cover" />
               ) : (
                 <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#050505]"></div>
               )}
            </div>

            {/* 🔥 تصحيح الأيقونة: وضعناها هنا (خارج الغلاف) لتكون فوق الجميع ولا تقص */}
            {/* top-[40%] لأن ارتفاع الغلاف 2/5 أي 40% */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#050505] rounded-full p-2 flex items-center justify-center shadow-2xl z-30">
                 <div className="w-full h-full rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                    {eventType === 'business' ? <Briefcase style={{ color: color }} /> : <Sparkles style={{ color: color }} />}
                 </div>
            </div>

            {/* 2. محتوى التذكرة */}
            <div className="flex-1 px-6 pt-14 text-center pb-8 overflow-y-auto scrollbar-hide">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 animate-pulse">دعوة خاصة</p>
              
              {eventType === 'social' && (details.groomName || details.brideName) && (
                <div className="mb-4 animate-in slide-in-from-bottom duration-500 delay-100">
                  <h2 className="text-xl font-bold text-white">{details.groomName || 'اسم العريس'}</h2>
                  <span className="text-xs text-white/30 my-1 block">&</span>
                  <h2 className="text-xl font-bold text-white">{details.brideName || 'اسم العروس'}</h2>
                </div>
              )}

              <h1 className="text-2xl font-black text-white leading-tight mb-8 animate-in slide-in-from-bottom duration-500 delay-200">
                {details.name || 'عنوان المناسبة...'}
              </h1>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4 mb-8 backdrop-blur-sm animate-in slide-in-from-bottom duration-500 delay-300">
                <div className="flex items-center gap-3 text-right">
                   <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Calendar size={14} className="opacity-70"/></div>
                   <div>
                      <p className="text-[9px] text-white/30 uppercase">التاريخ</p>
                      <p className="text-xs font-bold text-white/90">{details.date || '---'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                   <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><MapPin size={14} className="opacity-70"/></div>
                   <div>
                      <p className="text-[9px] text-white/30 uppercase">الموقع</p>
                      <p className="text-xs font-bold text-white/90">{details.locationName || '---'}</p>
                   </div>
                </div>
              </div>

              {/* QR Code وهمي */}
              <div className="border border-dashed border-white/10 rounded-xl p-4 w-32 mx-auto opacity-40 mb-4">
                 <div className="w-full aspect-square bg-white/10 rounded flex items-center justify-center text-[8px] text-white/30">QR CODE</div>
              </div>
            </div>

            <div className="p-6 pt-0">
               <div style={{ backgroundColor: color }} className="w-full py-3 rounded-xl font-bold text-black text-center text-sm shadow-lg">
                  تأكيد الحضور
               </div>
            </div>
          </div>
        </div>
    </div>
  );
}