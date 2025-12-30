'use client';

import { useRef, use, useState } from 'react';
import { useTicket } from '@/app/hooks/useTicket';
import { QRCodeCanvas } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { 
  Loader2, Download, Calendar, MapPin, 
  Share2, Map, CalendarPlus, Armchair,
  CheckCircle2, XCircle, Send, Heart, PenTool, AlertCircle
} from 'lucide-react';
import { Attendee } from '@/types';
import { supabase } from '@/app/utils/supabase/client';
import { APP_URL } from '@/app/config/constants';
import { validateRequired } from '@/app/utils/validation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TicketPage({ params }: PageProps) {
  const { id } = use(params);
  const { ticket, loading, error, updateTicketStatus } = useTicket(id);

  // Modal States
  const [isRegretModalOpen, setIsRegretModalOpen] = useState(false);
  const [regretReason, setRegretReason] = useState('');
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [memoryText, setMemoryText] = useState('');
  
  // Error states
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  // --- Handlers: RSVP ---
  const handleConfirm = async () => {
    setActionError(null);
    setSubmitting(true);
    try {
      await updateTicketStatus('confirmed');
      setSuccessMessage('تم تأكيد حضورك، شكراً لك! ✨');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'فشل تأكيد الحضور';
      setActionError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setActionError(null);
    if (!regretReason.trim()) {
      setActionError('يرجى كتابة سبب الاعتذار');
      return;
    }

    setSubmitting(true);
    try {
      await updateTicketStatus('declined', regretReason);
      setSuccessMessage('تم تسجيل اعتذارك، شكراً لإشعارك بذلك');
      setIsRegretModalOpen(false);
      setRegretReason('');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'فشل تسجيل الاعتذار';
      setActionError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handler: Memory Wall ---
  const handleSendMemory = async () => {
    setActionError(null);
    
    // استخدام validateRequired للتحقق من الذكرى
    const validationError = validateRequired(memoryText, 'الذكرى');
    if (validationError) {
      setActionError(validationError);
      return;
    }

    if (memoryText.length > 500) {
      setActionError('الذكرى طويلة جداً (الحد الأقصى 500 حرف)');
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from('memories').insert({
        event_id: ticket?.event_id,
        attendee_id: ticket?.id,
        message: memoryText,
      });

      if (insertError) throw new Error(insertError.message);

      setSuccessMessage('وصلت رسالتك الجميلة! شكراً لك ❤️');
      setIsMemoryModalOpen(false);
      setMemoryText('');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'فشل إرسال الذكرى';
      setActionError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handlers: Utilities ---
  const handleDownload = async () => {
    if (!ticketRef.current) {
      setActionError('لم يتم العثور على التذكرة');
      return;
    }

    try {
      setActionError(null);
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        backgroundColor: '#18181B',
        pixelRatio: 3,
        skipAutoScale: true,
      });

      const link = document.createElement('a');
      link.download = `ticket-${ticket?.name || 'meras'}.png`;
      link.href = dataUrl;
      link.click();
      
      setSuccessMessage('تم حفظ التذكرة بنجاح');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'فشل حفظ الصورة';
      setActionError(errorMsg);
      console.error('Download error:', err);
    }
  };

  const openMap = () => {
    if (!ticket?.events?.location_name) {
      setActionError('الموقع غير متوفر');
      return;
    }
    
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      ticket.events.location_name
    )}`;
    window.open(mapsUrl, '_blank');
  };

  const addToCalendar = () => {
    if (!ticket?.events) return;

    const event = ticket.events;
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const startTime = startDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endTime = endDate.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.name
    )}&dates=${startTime}/${endTime}&details=${encodeURIComponent(
      'تذكرة دخول مِراس'
    )}&location=${encodeURIComponent(event.location_name || '')}&sf=true&output=xml`;

    window.open(calendarUrl, '_blank');
  };

  const shareTicket = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: ticket?.events?.name,
          text: `تذكرتي للحضور في ${ticket?.events?.name}`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setSuccessMessage('تم نسخ رابط التذكرة');
        setTimeout(() => setSuccessMessage(null), 2000);
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  // --- Render Conditions ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C19D65]" size={40} />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-4">
        <div className="bg-[#18181B] rounded-2xl border border-red-500/30 p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-500" size={24} />
            <h2 className="text-xl font-bold text-white">خطأ</h2>
          </div>
          <p className="text-white/60 text-sm">
            {error || 'لم يتم العثور على التذكرة'}
          </p>
        </div>
      </div>
    );
  }

  // Theme Setup
  const isBusiness = ticket.events?.type === 'business';
  const theme = {
    color: isBusiness ? '#3B82F6' : '#C19D65',
    bgStyle: isBusiness
      ? 'bg-gradient-to-br from-blue-900 to-black'
      : 'bg-gradient-to-br from-[#2a2a2a] to-black',
    badge: isBusiness ? 'VIP Business' : 'ضيف عزيز',
    primaryBtnText: isBusiness ? 'إضافة للتقويم' : 'موقع الحفل',
    primaryBtnIcon: isBusiness ? CalendarPlus : Map,
    primaryBtnAction: isBusiness ? addToCalendar : openMap,
  };

  const seatInfo = ticket.seats?.[0];
  const showSeatInfo = ticket.events?.has_seating && seatInfo;

  return (
    <div
      className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-4 font-sans overflow-hidden"
      dir="rtl"
    >
      {/* Alert Messages */}
      {actionError && (
        <div className="w-full max-w-[380px] mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-red-400">{actionError}</p>
        </div>
      )}

      {successMessage && (
        <div className="w-full max-w-[380px] mb-4 bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-start gap-3">
          <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-green-400">{successMessage}</p>
        </div>
      )}
      <div 
        ref={ticketRef} 
        className="w-full max-w-[380px] bg-[#18181B] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative flex flex-col mb-6"
      >
        {/* Header */}
        <div className={`h-40 relative flex items-center justify-center overflow-hidden ${theme.bgStyle}`}>
           <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-white" style={{ backgroundImage: 'radial-gradient(circle, transparent 20%, #000 120%)' }}></div>
           <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px]" style={{ backgroundColor: theme.color }}></div>
           <div className="relative z-10 text-center px-4">
              <h1 className="text-2xl font-black mb-1 drop-shadow-md">{ticket.events?.name}</h1>
              <p className="text-[10px] opacity-70 tracking-widest uppercase">تذكرة دخول إلكترونية</p>
           </div>
        </div>

        {/* Body */}
        <div className="flex-1 bg-[#18181B] p-6 text-center relative">
           <div className="absolute -left-4 top-0 w-8 h-8 bg-[#0A0A0C] rounded-full"></div>
           <div className="absolute -right-4 top-0 w-8 h-8 bg-[#0A0A0C] rounded-full"></div>
           <div className="absolute left-4 right-4 top-4 border-t-2 border-dashed border-white/10 opacity-50"></div>

           <div className="mt-6 space-y-2">
              <h2 className="text-2xl font-bold text-white">{ticket.name}</h2>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold border" style={{ borderColor: `${theme.color}40`, color: theme.color, backgroundColor: `${theme.color}10` }}>
                {theme.badge}
              </span>
           </div>

           {/* Seat Info */}
           {showSeatInfo && (
             <div className="mt-6 mx-auto bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between max-w-[200px]">
                <div className="text-right">
                   <p className="text-[9px] text-white/40">القاعة / القسم</p>
                   <p className="text-sm font-bold text-white">{seatInfo.table?.name}</p>
                </div>
                <div className="h-6 w-px bg-white/10"></div>
                <div className="text-left flex items-center gap-2">
                   <div className="text-right">
                      <p className="text-[9px] text-white/40">المقعد</p>
                      <p className="text-lg font-black" style={{ color: theme.color }}>{seatInfo.seat_number}</p>
                   </div>
                   <Armchair size={16} className="text-white/20"/>
                </div>
             </div>
           )}

           {/* QR Code */}
           <div className="my-6 flex justify-center">
              <div className="bg-white p-4 rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                 <QRCodeCanvas value={`https://meras.app/admin/scan/${id}`} size={150} bgColor={"#ffffff"} fgColor={"#000000"} level={"Q"} />
              </div>
           </div>

           {/* Footer Info */}
           <div className="grid grid-cols-2 gap-4 text-xs text-white/60 mb-4">
              <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center gap-2">
                 <Calendar size={16} style={{ color: theme.color }} />
                 <span>{new Date(ticket.events?.date || '').toLocaleDateString('ar-SA')}</span>
              </div>
              <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center gap-2">
                 <MapPin size={16} style={{ color: theme.color }} />
                 <span className="truncate w-full text-center">{ticket.events?.location_name || 'الموقع'}</span>
              </div>
           </div>
           <p className="text-[10px] text-white/20 font-mono tracking-widest">SN: {ticket.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <div className="h-2 w-full" style={{ backgroundColor: theme.color }}></div>
      </div>

      {/* ✅ --- RSVP Section (تأكيد الحضور) --- */}
      <div className="w-full max-w-[380px] mb-4">
        {ticket.status === 'invited' && (
          <div className="bg-[#18181B] border border-[#C19D65] p-5 rounded-2xl text-center shadow-[0_0_30px_rgba(193,157,101,0.15)] animate-in slide-in-from-bottom-4">
             <h3 className="text-lg font-bold text-white mb-1">هل ستشرفنا بالحضور؟ ✨</h3>
             <p className="text-xs text-white/50 mb-4">تأكيدك يساعدنا في الترتيب</p>
             <div className="flex gap-3">
                <button onClick={handleConfirm} disabled={submitting} className="flex-1 bg-[#C19D65] text-black py-3 rounded-xl font-bold hover:brightness-110 flex items-center justify-center gap-2">
                   {submitting ? <Loader2 className="animate-spin"/> : <CheckCircle2 size={18}/>} يشرفني الحضور
                </button>
                <button onClick={() => setIsRegretModalOpen(true)} disabled={submitting} className="flex-1 bg-white/5 text-white/60 py-3 rounded-xl font-bold hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2">
                   <XCircle size={18}/> أعتذر
                </button>
             </div>
          </div>
        )}

        {ticket.status === 'confirmed' && (
           <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-2xl text-center flex items-center justify-center gap-3">
              <div className="bg-green-500 text-black p-1 rounded-full"><CheckCircle2 size={20}/></div>
              <div>
                 <p className="font-bold text-green-500">تم تأكيد حضورك</p>
                 <p className="text-xs text-green-500/60">ننتظر بشوق مشاركتك لنا</p>
              </div>
           </div>
        )}

        {ticket.status === 'declined' && (
           <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
              <p className="text-white/60">شكراً لك، سنفتقدك في الحفل 🤍</p>
              <button onClick={() => handleConfirm()} className="text-xs text-[#C19D65] underline mt-2">تراجعت؟ اضغط هنا للتأكيد</button>
           </div>
        )}
      </div>

      {/* ✍️ --- Memory Wall Button (زر الذكريات) --- */}
      <div className="w-full max-w-[380px] mb-8">
         <button 
           onClick={() => setIsMemoryModalOpen(true)}
           className="w-full py-4 bg-[#18181B] border border-dashed border-[#C19D65]/40 text-[#C19D65] rounded-2xl flex items-center justify-center gap-2 hover:bg-[#C19D65]/5 transition-all shadow-sm"
         >
           <PenTool size={18} /> اكتب ذكرى أو تهنئة للعروسين
         </button>
      </div>

      {/* 🛠️ --- Action Buttons --- */}
      <div className="flex flex-col gap-3 w-full max-w-[380px]">
        <button onClick={handleDownload} style={{ backgroundColor: theme.color }} className="w-full py-4 rounded-2xl text-black font-black flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all">
          <Download size={20} /> حفظ التذكرة في الصور
        </button>

        <div className="flex gap-3">
          <button onClick={theme.primaryBtnAction} className="flex-1 py-4 rounded-2xl bg-[#18181B] border border-white/10 text-white font-bold text-sm hover:bg-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <theme.primaryBtnIcon size={18} /> {theme.primaryBtnText}
          </button>
          <button onClick={shareTicket} className="px-6 py-4 rounded-2xl bg-[#18181B] border border-white/10 text-white hover:bg-white/5 transition-all">
              <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* 🌑 --- Modals --- */}
      
      {/* 1. Regret Modal (نافذة الاعتذار) */}
      {isRegretModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-[#18181B] w-full max-w-sm rounded-3xl border border-white/10 p-6 animate-in zoom-in">
              <h3 className="text-xl font-bold mb-2">نأسف لعدم حضورك 😔</h3>
              <p className="text-xs text-white/50 mb-4">اختياري: هل تود إخبارنا بالسبب؟</p>
              <textarea rows={3} placeholder="سبب الاعتذار..." value={regretReason} onChange={(e) => setRegretReason(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white mb-4 focus:border-[#C19D65] outline-none" />
              <div className="flex gap-2">
                 <button onClick={handleDecline} disabled={submitting} className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200">
                    {submitting ? 'جاري الإرسال...' : 'تأكيد الاعتذار'}
                 </button>
                 <button onClick={() => setIsRegretModalOpen(false)} className="px-5 bg-white/5 rounded-xl font-bold text-white">إلغاء</button>
              </div>
           </div>
        </div>
      )}

      {/* 2. Memory Modal (نافذة الذكريات) */}
      {isMemoryModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-[#18181B] w-full max-w-sm rounded-3xl border border-white/10 p-6 animate-in zoom-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C19D65]/10 rounded-full blur-[50px] pointer-events-none"></div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
                <Heart className="text-red-500 fill-red-500" size={20}/> جدار الذكريات
              </h3>
              <p className="text-xs text-white/50 mb-4">اكتب تهنئة أو ذكرى لطيفة ستبقى مخلدة ✨</p>
              <textarea rows={4} placeholder="أكتب رسالتك هنا..." value={memoryText} onChange={(e) => setMemoryText(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white mb-4 focus:border-[#C19D65] outline-none resize-none" />
              <div className="flex gap-2">
                 <button onClick={handleSendMemory} disabled={submitting} className="flex-1 bg-[#C19D65] text-black font-bold py-3 rounded-xl hover:brightness-110">
                    {submitting ? 'جاري الإرسال...' : 'نشر الذكرى'}
                 </button>
                 <button onClick={() => setIsMemoryModalOpen(false)} className="px-5 bg-white/5 rounded-xl font-bold text-white">إلغاء</button>
              </div>
           </div>
        </div>
      )}

      <p className="mt-8 text-[10px] text-white/20">Powered by Meras Platform</p>
    </div>
  );
}