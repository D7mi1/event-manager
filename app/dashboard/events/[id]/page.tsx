'use client';

import { useEffect, use } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { useEventStore } from '@/store/eventStore';

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

import { Loader2, ArrowLeft, Plus, Download, MapPin, Settings, Edit, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

interface PageProps { params: Promise<{ id: string }>; }

export default function EventControlRoom({ params }: PageProps) {
  const { id } = use(params);
  
  const { 
    setEventId, fetchData, isLoading, 
    toggleAddModal, toggleMessageModal, toggleEditEventModal, toggleImportModal, 
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

  const handleExportCSV = () => {
    const headers = ['الاسم', 'الجوال', 'الحالة', 'وقت الحضور', 'التصنيف'];
    const rows = attendees.map(g => [
      g.name, g.phone, g.status,
      g.attended ? new Date(g.updated_at).toLocaleTimeString('ar-SA') : '-', g.category
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `guests_export.csv`;
    link.click();
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
           </div>
           {eventDetails?.location_name && (
             <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
               <MapPin size={14}/> {eventDetails.location_name}
             </p>
           )}
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
           <button onClick={() => toggleImportModal(true)} 
             className="px-4 py-2.5 bg-[#107C41] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#0c6b37] shadow-lg transition-all"
             title="استيراد من Excel">
              <FileSpreadsheet size={18} /> <span className="hidden md:inline">Excel</span>
           </button>

           <button onClick={() => toggleAddModal(true)} className="flex-1 md:flex-none px-6 py-2.5 bg-[#C19D65] text-black rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-lg">
              <Plus size={18} /> إضافة مدعو
           </button>
           
           <button onClick={handleExportCSV} className="px-4 py-2.5 bg-[#27272A] rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#3F3F46] border border-white/10">
              <Download size={18} />
           </button>
           
           <Link href={`/dashboard/events/${id}/seating`} className="px-4 py-2.5 bg-[#27272A] rounded-xl text-sm font-bold hover:bg-[#3F3F46] border border-white/10">
              🪑 المخطط
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
               currentPin={eventDetails?.pin || '0000'} 
            />

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
      <WhatsAppQueueModal />
      
    </div>
  );
}