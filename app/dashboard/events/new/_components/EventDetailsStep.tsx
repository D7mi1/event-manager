import { useState } from 'react';
import { Calendar, MapPin, Loader2, Info } from 'lucide-react';
import { uploadEventImage } from '@/app/utils/storage'; 

interface Props {
  eventType: 'social' | 'business';
  details: any;
  setDetails: (data: any) => void;
  selectedColor: string;
  onNext: () => void;
  onBack: () => void;
}

export function EventDetailsStep({ eventType, details, setDetails, selectedColor, onNext, onBack }: Props) {
  const [isUploading, setIsUploading] = useState(false);

  // دالة التعامل مع رفع الصورة (محدثة مع التحقق)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];

    // 1. التحقق من الحجم (مثلاً 5 ميجا)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      alert('حجم الصورة كبير جداً! يرجى اختيار صورة أقل من 5 ميجابايت.');
      return;
    }

    // 2. التحقق من النوع
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صحيح (PNG, JPG).');
      return;
    }

    setIsUploading(true);
    const publicUrl = await uploadEventImage(file);
    
    if (publicUrl) {
      setDetails({ ...details, image_url: publicUrl }); 
    } else {
        // في حال فشل الرفع رغم التحقق
        alert('حدث خطأ أثناء الاتصال بالسيرفر، تأكد من اتصالك بالإنترنت');
    }
    
    setIsUploading(false);
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  return (
    <div className="animate-in slide-in-from-left duration-300 space-y-5">
      <h1 className="text-3xl font-black mb-2">التفاصيل الأساسية 📝</h1>
      
      {/* --- قسم رفع الصورة --- */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-white/80">
          {eventType === 'business' ? 'شعار الشركة / الفعالية' : 'صورة الدعوة (اختياري)'}
        </label>
        
        <div className="flex items-start gap-4">
          <div className="relative group w-full">
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp" // تقييد الأنواع في المتصفح
              onChange={handleLogoUpload}
              disabled={isUploading}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-3 file:px-4
                file:rounded-xl file:border-0
                file:text-xs file:font-bold
                file:bg-white/5 file:text-white
                hover:file:bg-white/10 cursor-pointer border border-white/10 rounded-xl bg-white/[0.02]"
            />
            
            {/* تعليمات الصورة - الجزء الذي طلبته ✅ */}
            <div className="flex items-center gap-2 mt-2 text-[10px] text-white/40">
                <Info size={12} />
                <span>الحد الأقصى 5MB • الصيغ (PNG, JPG) • الأبعاد المقترحة (1200x600)</span>
            </div>

            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl z-10">
                <Loader2 className="animate-spin text-[#C19D65]" size={20} />
              </div>
            )}
          </div>

          {/* المعاينة */}
          {details.image_url && (
            <div className="relative flex-shrink-0">
              <img 
                src={details.image_url} 
                alt="Preview" 
                className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-lg"
              />
              <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-sm">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* --- باقي الحقول --- */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-white/50">عنوان الفعالية</label>
        <input type="text" value={details.name} onChange={(e) => setDetails({...details, name: e.target.value})} 
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-white/30 transition-colors" 
          placeholder="مثال: حفل زفاف..." style={{ caretColor: selectedColor }} 
        />
      </div>

      {eventType === 'social' && (
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
             <label className="text-xs font-bold text-white/50">العريس</label>
             <input type="text" value={details.groomName} onChange={(e) => setDetails({...details, groomName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-white/30" />
           </div>
           <div className="space-y-2">
             <label className="text-xs font-bold text-white/50">العروس</label>
             <input type="text" value={details.brideName} onChange={(e) => setDetails({...details, brideName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-white/30" />
           </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 relative group">
          <label className="text-xs font-bold text-white/50">التاريخ</label>
          <div className="relative">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><Calendar size={18} /></div>
            <input type="date" min={getTodayDate()} value={details.date} onChange={(e) => setDetails({...details, date: e.target.value})} 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 outline-none cursor-pointer text-white/90"
              style={{ colorScheme: 'dark' }} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/50">المكان</label>
          <div className="relative">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><MapPin size={18} /></div>
              <input type="text" value={details.locationName} onChange={(e) => setDetails({...details, locationName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 outline-none focus:border-white/30" placeholder="اسم القاعة..." />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button onClick={onBack} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold">السابق</button>
        <button onClick={onNext} style={{ backgroundColor: selectedColor }} className="px-8 py-3 rounded-xl text-black font-black hover:scale-105 transition-all">التالي</button>
      </div>
    </div>
  );
}