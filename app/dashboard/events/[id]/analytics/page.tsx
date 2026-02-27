'use client';

import { useEffect, use, useState } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { EventAnalytics, buildAnalyticsData, type AnalyticsData } from '@/components/analytics/EventAnalytics';
import { Loader2, ArrowLeft, Download, Award, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { exportGuestsToExcel } from '@/lib/exports/excel';
import { generateCertificatePDF } from '@/lib/exports/certificate-pdf';

interface PageProps { params: Promise<{ id: string }>; }

export default function AnalyticsPage({ params }: PageProps) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [generatingCerts, setGeneratingCerts] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // جلب الفعالية
      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (!event) return;
      setEventDetails(event);

      // جلب الضيوف
      const { data: guests } = await supabase
        .from('attendees')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: false });

      const guestList = guests || [];
      setAttendees(guestList);

      // بناء بيانات التحليلات
      const analytics = buildAnalyticsData(guestList);
      setAnalyticsData(analytics);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleExportExcel = async () => {
    try {
      await exportGuestsToExcel({
        eventName: eventDetails?.name || 'فعالية',
        eventDate: eventDetails?.event_date
          ? new Date(eventDetails.event_date).toLocaleDateString('ar-SA')
          : undefined,
        guests: attendees,
        includeStats: true,
      });
      toast.success('تم تصدير الملف بنجاح');
    } catch {
      toast.error('فشل تصدير الملف');
    }
  };

  const handleGenerateCertificates = async () => {
    const attendedGuests = attendees.filter((a) => a.attended);
    if (attendedGuests.length === 0) {
      toast.warning('لا يوجد حاضرين لتوليد شهادات لهم');
      return;
    }

    setGeneratingCerts(true);
    try {
      for (const guest of attendedGuests) {
        await generateCertificatePDF({
          attendeeName: guest.name,
          eventName: eventDetails?.name || '',
          eventDate: eventDetails?.event_date
            ? new Date(eventDetails.event_date).toLocaleDateString('ar-SA', { dateStyle: 'long' })
            : '',
          eventLocation: eventDetails?.location_name || '',
          organizerName: '',
          type: 'attendance',
        });
        // تأخير بسيط
        await new Promise((r) => setTimeout(r, 300));
      }
      toast.success(`تم توليد ${attendedGuests.length} شهادة بنجاح`);
    } catch {
      toast.error('فشل توليد الشهادات');
    } finally {
      setGeneratingCerts(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C19D65]" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center text-white">
        <p>لم يتم العثور على بيانات</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] p-4 md:p-8 text-white font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Link href={`/dashboard/events/${id}`} className="text-white/50 hover:text-white flex items-center gap-2 text-sm mb-2">
            <ArrowLeft size={16} /> العودة لغرفة التحكم
          </Link>
          <h1 className="text-3xl font-bold">
            📊 تحليلات: {eventDetails?.name || ''}
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-[#107C41] rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#0c6b37] text-white"
          >
            <Download size={16} /> تصدير Excel
          </button>

          <button
            onClick={handleGenerateCertificates}
            disabled={generatingCerts}
            className="px-4 py-2.5 bg-purple-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50 text-white"
          >
            {generatingCerts ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Award size={16} />
            )}
            شهادات الحضور
          </button>

          <Link
            href={`/dashboard/events/${id}/survey`}
            className="px-4 py-2.5 bg-amber-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-700 text-white"
          >
            <ClipboardList size={16} /> استبيان
          </Link>
        </div>
      </div>

      {/* محتوى التحليلات */}
      <EventAnalytics data={analyticsData} />
    </div>
  );
}
