'use client';

import { useEffect, use } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useEventStore } from '@/lib/stores/eventStore';

// ✅ استيراد البطاقة المدمجة الجديدة (Scanner + PIN)
import ScannerAccessCard from '@/components/dashboard/ScannerAccessCard';

// استيراد المكونات الأخرى
import { WhatsAppQueueModal } from '@/components/dashboard/WhatsAppQueueModal'; 
import { StatsCards } from '@/components/dashboard/StatsCards';
import { AttendeesTable } from '@/components/dashboard/AttendeesTable';
import { AddGuestModal } from '@/components/dashboard/AddGuestModal';
import { MessageConfigModal } from '@/components/dashboard/MessageConfigModal';
import { EditEventModal } from '@/components/dashboard/EditEventModal';
import { ImportGuestsModal } from '@/components/dashboard/ImportGuestsModal';
import { SmartPasteModal } from '@/components/dashboard/SmartPasteModal';
import { ContactImportModal } from '@/components/dashboard/ContactImportModal';

import { Loader2, ArrowLeft, Plus, Download, MapPin, Settings, Edit, FileSpreadsheet, Radio, Copy, Check, UserPlus, BarChart3, Wand2, Contact } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { exportGuestsToExcel } from '@/lib/exports/excel';
import { toast } from 'sonner';

interface PageProps { params: Promise<{ id: string }>; }

export default function EventControlRoom({ params }: PageProps) {
  const { id } = use(params);
  const [registrationLinkCopied, setRegistrationLinkCopied] = useState(false);
  
  const { 
    setEventId, fetchData, isLoading, 
    toggleAddModal, toggleMessageModal, toggleEditEventModal, toggleImportModal, toggleSmartPaste, toggleContactImport,
    eventDetails, attendees
  } = useEventStore();

  useEffect(() => {
    setEventId(id);
    fetchData();
    const channel = supabase.channel(`room-${id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'attendees', 
        filter: `event_id=eq.${id}` 
      }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel) };
  }, [id, setEventId, fetchData]);

  const handleExportExcel = async () => {
    try {
      await exportGuestsToExcel({
        eventName: eventDetails?.name || 'فعالية',
        eventDate: eventDetails?.date
          ? new Date(eventDetails.date).toLocaleDateString('ar-SA')
          : undefined,
        guests: attendees,
        includeStats: true,
      });
      toast.success('تم تصدير الملف بنجاح ✅');
    } catch {
      toast.error('فشل تصدير الملف');
    }
  };

  const registrationLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/register/${id}`;

  const handleCopyRegistrationLink = () => {
    navigator.clipboard.writeText(registrationLink);
    setRegistrationLinkCopied(true);
    setTimeout(() => setRegistrationLinkCopied(false), 2000);
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#0A0A0C]">
      <Loader2 className="animate-spin text-[#C19D65]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0C] p-4 md:p-8 text-white font-sans" dir="rtl">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <Link href="/dashboard" className="text-white/50 hover:text-white flex items-center gap-2 text-sm mb-2">
             <ArrowLeft size={16}/> العودة للرئيسية
           </Link>
           <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{eventDetails?.name || 'غرفة التحكم'}</h1>
              <button onClick={() => toggleEditEventModal(true)} 
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#27272A] border border-white/10 text-white/60 hover:text-[#C19D65] hover:border-[#C19D65] transition-all shadow-sm"
                  title="تعديل بيانات الحفل">
                  <Edit size={16}/>
              </button>
              <Link 
                  href={`/dashboard/events/${id}/edit`}
                  className="px-4 py-2 rounded-lg bg-[#27272A] border border-white/10 text-white/60 hover:text-white hover:bg-[#3F3F46] transition-all text-sm font-bold flex items-center gap-2"
                  title="تعديل الفعالية"
              >
                  <Edit size={14}/> تعديل
              </Link>
           </div>
           {eventDetails?.location_name && (
             <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
               <MapPin size={14}/> {eventDetails.location_name}
             </p>
           )}
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
           <button onClick={() => toggleSmartPaste(true)}
             className="px-4 py-2.5 bg-gradient-to-r from-[#C19D65] to-[#D4AF37] text-black rounded-xl text-sm font-bold flex items-center gap-2 hover:brightness-110 shadow-lg transition-all"
             title="لصق ذكي — الصق قائمة الضيوف من واتساب أو أي نص">
              <Wand2 size={18} /> <span className="hidden md:inline">لصق ذكي</span>
           </button>

           <button onClick={() => toggleImportModal(true)}
             className="px-4 py-2.5 bg-[#107C41] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#0c6b37] shadow-lg transition-all"
             title="استيراد من Excel أو CSV">
              <FileSpreadsheet size={18} /> <span className="hidden md:inline">Excel</span>
           </button>

           <button onClick={() => toggleContactImport(true)}
             className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg transition-all"
             title="استيراد من جهات الاتصال (.vcf)">
              <Contact size={18} /> <span className="hidden md:inline">جهات اتصال</span>
           </button>

           <button onClick={() => toggleAddModal(true)} className="flex-1 md:flex-none px-6 py-2.5 bg-[#C19D65] text-black rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-lg">
              <Plus size={18} /> إضافة مدعو
           </button>
           
           <button onClick={handleExportExcel} className="px-4 py-2.5 bg-[#107C41] rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#0c6b37] border border-[#107C41]/50 text-white" title="تصدير Excel">
              <Download size={18} /> <span className="hidden md:inline">Excel</span>
           </button>
           
           <Link
              href={`/live/${id}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-sm font-bold hover:from-red-700 hover:to-orange-700 border border-red-400/30 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
              title="عرض البث المباشر في نافذة جديدة"
           >
              <Radio size={18} className="animate-pulse" />
              <span className="hidden md:inline">البث المباشر</span>
           </Link>
           
           <Link
              href={`/staff/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#27272A] rounded-xl text-sm font-bold hover:bg-[#3F3F46] border border-white/10 flex items-center gap-2"
              title="واجهة الموظفين (تفتح في نافذة جديدة)"
           >
              👥 الموظفين
           </Link>

           <Link
              href={`/dashboard/events/${id}/analytics`}
              className="px-4 py-2.5 bg-[#27272A] rounded-xl text-sm font-bold hover:bg-[#3F3F46] border border-white/10 flex items-center gap-2"
              title="التحليلات"
           >
              <BarChart3 size={18} className="text-blue-400" />
              <span className="hidden md:inline">تحليلات</span>
           </Link>
        </div>
      </div>

      {/* --- Main Grid Layout --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            <StatsCards />
            <AttendeesTable />
         </div>

         {/* العمود الجانبي */}
         <div className="space-y-6">
            
            {/* ✅ هنا التغيير الجذري: استخدام البطاقة المدمجة بدلاً من العنصرين المنفصلين */}
            <ScannerAccessCard 
               eventId={id} 
               currentPin={eventDetails?.pin_hash || '0000'} 
            />

            {/* بطاقة رابط الدعوة */}
            <div className="bg-[#18181B] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-6 text-center bg-[#18181B] z-10 relative">
                <h3 className="font-bold text-lg mb-4 text-[#C19D65] flex items-center justify-center gap-2">
                  <UserPlus size={20} />
                  رابط الدعوة
                </h3>
                <p className="text-xs text-white/40 mb-4">شارك هذا الرابط مع الضيوف لتسجيل حضورهم</p>
                <div className="p-4 bg-black/40 rounded-2xl mb-4 font-mono text-xs text-white/50 break-all border border-white/5 shadow-inner select-all dir-ltr">
                  {registrationLink}
                </div>
                <button
                  onClick={handleCopyRegistrationLink}
                  className="w-full py-4 bg-[#C19D65] text-black font-black rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C19D65]/20"
                >
                  {registrationLinkCopied ? <Check size={18} /> : <Copy size={18} />}
                  {registrationLinkCopied ? 'تم النسخ' : 'نسخ رابط الدعوة'}
                </button>
              </div>
            </div>

            {/* إعدادات الرسائل */}
            <div className="bg-[#18181B] rounded-[2rem] border border-white/10 p-6">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">إعدادات الرسائل</h3>
                  <button onClick={() => toggleMessageModal(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
                     <Settings size={18}/>
                  </button>
               </div>
               <p className="text-xs text-white/40 mb-4">تخصيص رسائل الواتساب التلقائية</p>
               <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                     <span className="text-xs text-white/60">حالة التذكير</span>
                     <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_green]"></div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* --- Modals --- */}
      <AddGuestModal />
      <MessageConfigModal />
      <EditEventModal />
      <ImportGuestsModal />
      <SmartPasteModal />
      <ContactImportModal />
      <WhatsAppQueueModal />
      
    </div>
  );
}