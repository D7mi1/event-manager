'use client';
import { useDroppable } from '@dnd-kit/core';
import { Users, Armchair } from 'lucide-react'; // أضفنا أيقونة Armchair للصفوف

// تعريف الخصائص التي يستقبلها المكون
interface Props {
  id: string;
  name: string;
  guests: any[];
  capacity: number;
  shape: 'round' | 'theater'; // 👈 خاصية جديدة مهمة جداً
}

export function DroppableTable({ id, name, guests = [], capacity, shape = 'round' }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: { type: 'TABLE' } // هذا ما يجعله قابلاً للإفلات عليه
  });

  // --- إعدادات التصميم بناءً على الشكل ---
  
  // 1. الحاوية الأساسية: الدائري له حجم ثابت، الصفوف تتمدد
  const containerStyle = shape === 'round' 
    ? "w-48 h-48 rounded-full" 
    : "w-auto h-auto rounded-xl p-4 min-w-[120px]"; // Theater Style

  // 2. الأيقونة المناسبة في الوسط
  const Icon = shape === 'round' ? Users : Armchair;
  
  // 3. حساب عدد الأعمدة لنمط الصفوف (مثلاً 5 كراسي في الصف)
  // يمكن جعل هذا الرقم ديناميكياً لاحقاً، نثبته على 5 للتبسيط الآن
  const gridColumns = 5; 

  return (
    <div ref={setNodeRef} 
      className={`relative border-2 transition-all duration-300 m-8 flex flex-col items-center justify-center
        ${containerStyle}
        ${isOver ? 'border-[#C19D65] bg-[#C19D65]/10 scale-105 shadow-[0_0_20px_rgba(193,157,101,0.3)]' : 'border-white/10 bg-[#18181B]'}
      `}
    >
      {/* --- رأس الطاولة/القسم --- */}
      <div className={`text-center mb-2 ${shape === 'round' ? 'absolute' : ''}`}>
        <h3 className="font-bold text-white text-sm flex items-center justify-center gap-1">
            <Icon size={14} className="text-[#C19D65]"/> {name}
        </h3>
        <span className="text-[10px] text-white/40">{guests.length}/{capacity}</span>
      </div>


      {/* --- 🔄 الرسم بناءً على الشكل --- */}

      {/* الحالة 1: طاولة دائرية (الكود السابق) */}
      {shape === 'round' && (
        <div className="relative w-full h-full flex items-center justify-center">
           {guests.length === 0 && <Icon size={24} className="text-white/20 absolute" />}
           {guests.map((guest: any, index: number) => {
             const angle = (index / capacity) * 2 * Math.PI;
             // تقليل القطر قليلاً ليتناسب مع الحجم الجديد
             const x = Math.cos(angle) * 85; 
             const y = Math.sin(angle) * 85;
             return <SeatMarker key={index} x={x} y={y} guest={guest} shape="round" />;
          })}
        </div>
      )}

      {/* الحالة 2: صفوف (مسرح) - جديد 🆕 */}
      {shape === 'theater' && (
        <div className="grid gap-2 mt-2" style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}>
           {/* نقوم بإنشاء مصفوفة فارغة بعدد الكراسي الكلي (capacity)
             لكي نرسم الكراسي الفارغة والممتلئة معاً في شبكة
           */}
           {Array.from({ length: capacity }).map((_, index) => {
             // نحاول العثور على ضيف لهذا الكرسي (بناءً على الترتيب)
             const guest = guests[index]; 
             return (
               <SeatMarker 
                 key={index} 
                 guest={guest} 
                 shape="theater" 
                 seatNumber={index + 1} // رقم الكرسي الظاهري
               />
             );
           })}
        </div>
      )}

    </div>
  );
}

// --- مكون فرعي: شكل الكرسي (نقطة أو مربع) ---
const SeatMarker = ({ x, y, guest, shape, seatNumber }: any) => {
    const isRound = shape === 'round';
    
    const baseStyle = isRound 
        ? "absolute w-8 h-8 rounded-full border-2 shadow-lg" // ستايل الدائري
        : "relative w-8 h-8 rounded border flex text-[10px]"; // ستايل المربع

    const positionStyle = isRound ? { transform: `translate(${x}px, ${y}px)` } : {};
    
    const colorStyle = guest 
        ? 'bg-blue-500 text-white border-[#18181B]' // كرسي محجوز
        : 'bg-white/5 text-white/20 border-white/10'; // كرسي فارغ

    return (
      <div className={`${baseStyle} items-center justify-center font-bold ${colorStyle}`} style={positionStyle} title={guest?.name}>
        {guest ? guest.name.charAt(0) : (seatNumber || '')}
      </div>
    );
};