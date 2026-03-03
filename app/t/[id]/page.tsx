'use client';


import { useRef, use, useState, useEffect } from 'react';

import { useTicket } from '@/lib/hooks/useTicket';
import { QRCodeCanvas } from 'qrcode.react';
import { toPng } from 'html-to-image';
import {
  Loader2, Download, Calendar, MapPin,
  Share2, Map, CalendarPlus, Armchair,
  CheckCircle2, XCircle, Send, Heart, PenTool, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Attendee } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { APP_URL } from '@/app/config/constants';
import { validateRequired } from '@/lib/utils/validation';

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

  // ✅ Flip Logic (State Moved to Top)
  const [isFlipped, setIsFlipped] = useState(false);

  // Sync Flip State when ticket loads
  useEffect(() => {
    if (ticket?.status === 'confirmed') {
      setIsFlipped(true);
    }
  }, [ticket]);

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
        guest_id: ticket?.id,
        image_url: '',  // DB requires NOT NULL - text-only memory
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
  const showSeatInfo = ticket.events && seatInfo;



  const handleConfirmInvite = async () => {
    await handleConfirm();
    setTimeout(() => setIsFlipped(true), 1000); // Flip after 1s success message
  };

  return (
    <div
      className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-4 font-sans overflow-hidden"
      dir="rtl"
    >
      {/* Alert Messages (Global) */}
      {actionError && (
        <div className="w-full max-w-[380px] mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-3 z-50">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-red-400">{actionError}</p>
        </div>
      )}

      {successMessage && (
        <div className="w-full max-w-[380px] mb-4 bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-start gap-3 z-50">
          <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-green-400">{successMessage}</p>
        </div>
      )}

      {/* 🚀 THE 3D CARD CONTAINER */}
      <div className="relative w-full max-w-[380px] h-[650px] perspective-1000 group">
        <div className={`relative w-full h-full transition-all duration-1000 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

          {/* 💌 FRONT FACE: INVITATION CARD */}
          <div className="absolute w-full h-full backface-hidden rounded-[2.5rem] overflow-hidden bg-[#18181B] border border-white/10 shadow-2xl flex flex-col">
            {/* Event Image */}
            <div className="h-3/5 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${ticket.events?.image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop'})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent"></div>
              <div className="absolute bottom-4 right-4 text-right">
                <h2 className="text-2xl font-black text-white drop-shadow-lg leading-tight">{ticket.events?.name}</h2>
                <p className="text-sm text-white/80 font-medium drops-shadow-md">{new Date(ticket.events?.date || '').toLocaleDateString('ar-SA')}</p>
              </div>
            </div>

            {/* Invitation Text & Actions */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-6">
              <div>
                <p className="text-sm text-[#C19D65] font-bold mb-2">دعوة خاصة لـ</p>
                <h1 className="text-3xl font-black text-white">{ticket.name}</h1>
              </div>

              <p className="text-white/60 text-sm leading-relaxed">
                يسرنا دعوتكم لمشاركتنا هذه الليلة المميزة. حضوركم يضفي علينا البهجة والسرور.
              </p>

              {/* RSVP Buttons (Front) */}
              <div className="w-full space-y-3">
                <button
                  onClick={handleConfirmInvite}
                  disabled={submitting}
                  className="w-full bg-[#C19D65] text-black py-4 rounded-xl font-bold text-lg hover:brightness-110 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(193,157,101,0.2)] animate-pulse"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />} يشرفني الحضور (عرض التذكرة)
                </button>
                <button
                  onClick={() => setIsRegretModalOpen(true)}
                  disabled={submitting}
                  className="w-full bg-white/5 text-white/60 py-3 rounded-xl font-bold hover:bg-white/10"
                >
                  أعتذر عن الحضور
                </button>
              </div>

              {/* Hint */}
              {ticket.status === 'confirmed' && (
                <button onClick={() => setIsFlipped(true)} className="text-xs text-white/30 underline mt-2">
                  عرض التذكرة (أنت مسجل بالفعل)
                </button>
              )}
            </div>
          </div>

          {/* 🎟️ BACK FACE: THE TICKET (المحتوى السابق) */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-[2.5rem] bg-[#18181B] border border-white/10 shadow-2xl overflow-y-auto custom-scrollbar">
            {/* ... Ticket Design Wrapper ... */}
            <div ref={ticketRef} className="bg-[#18181B] relative flex flex-col min-h-full">
              {/* Header */}
              <div className={`h-32 relative flex items-center justify-center overflow-hidden shrink-0 ${theme.bgStyle}`}>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-white" style={{ backgroundImage: 'radial-gradient(circle, transparent 20%, #000 120%)' }}></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px]" style={{ backgroundColor: theme.color }}></div>
                <div className="relative z-10 text-center px-4 pt-4">
                  <h1 className="text-xl font-black mb-1 drop-shadow-md">{ticket.events?.name}</h1>
                  <button onClick={() => setIsFlipped(false)} className="mx-auto mt-2 text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1 transition-colors">
                    🔄 العودة للدعوة
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 px-6 py-4 text-center relative">
                <div className="space-y-1 mb-4">
                  <h2 className="text-2xl font-bold text-white">{ticket.name}</h2>
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold border" style={{ borderColor: `${theme.color}40`, color: theme.color, backgroundColor: `${theme.color}10` }}>
                    {theme.badge}
                  </span>
                </div>

                {/* Seat Info */}
                {showSeatInfo && (
                  <div className="mb-4 mx-auto bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between max-w-[200px]">
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
                      <Armchair size={16} className="text-white/20" />
                    </div>
                  </div>
                )}

                {/* QR Code */}
                <div className="my-4 flex justify-center">
                  <div className="bg-white p-4 rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <QRCodeCanvas value={`https://meras.app/admin/scan/${id}`} size={140} bgColor={"#ffffff"} fgColor={"#000000"} level={"Q"} />
                  </div>
                </div>

                {/* Footer Info */}
                <div className="grid grid-cols-2 gap-3 text-[10px] text-white/60 mb-6">
                  <div className="bg-white/5 rounded-xl p-2 flex flex-col items-center gap-1">
                    <Calendar size={14} style={{ color: theme.color }} />
                    <span>{new Date(ticket.events?.date || '').toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 flex flex-col items-center gap-1">
                    <MapPin size={14} style={{ color: theme.color }} />
                    <span className="truncate w-full text-center">{ticket.events?.location_name || 'الموقع'}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3 pb-8">
                  <button onClick={handleDownload} style={{ backgroundColor: theme.color }} className="w-full py-3 rounded-2xl text-black font-black flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all text-sm">
                    <Download size={18} /> حفظ التذكرة
                  </button>
                  <div className="flex gap-2">
                    <button onClick={theme.primaryBtnAction} className="flex-1 py-3 rounded-2xl bg-[#18181B] border border-white/10 text-white font-bold text-xs hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                      <theme.primaryBtnIcon size={16} /> {theme.primaryBtnText}
                    </button>
                    <button onClick={shareTicket} className="px-5 py-3 rounded-2xl bg-[#18181B] border border-white/10 text-white hover:bg-white/5 transition-all">
                      <Share2 size={16} />
                    </button>
                  </div>
                  <button onClick={() => setIsMemoryModalOpen(true)} className="w-full py-3 bg-[#18181B] border border-dashed border-[#C19D65]/40 text-[#C19D65] rounded-2xl flex items-center justify-center gap-2 hover:bg-[#C19D65]/5 transition-all text-sm mt-4">
                    <PenTool size={16} /> كتابة ذكرى للعروسين
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 🌑 --- Modals (Regret & Memory) --- */}
      {/* Kept Same as Before... */}
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

      {isMemoryModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181B] w-full max-w-sm rounded-3xl border border-white/10 p-6 animate-in zoom-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C19D65]/10 rounded-full blur-[50px] pointer-events-none"></div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
              <Heart className="text-red-500 fill-red-500" size={20} /> جدار الذكريات
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