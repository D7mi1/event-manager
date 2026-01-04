import { useEffect, useState } from 'react';
import { supabase } from '@/app/utils/supabase/client'; // تأكد من المسار
import { Attendee } from '@/types'; // تأكد من المسار

interface UseTicketReturn {
  ticket: Attendee | null;
  loading: boolean;
  error: string | null;
  setTicket: (ticket: Attendee | null) => void;
  updateTicketStatus: (newStatus: 'confirmed' | 'declined', reason?: string) => Promise<void>;
}

export function useTicket(id: string): UseTicketReturn {
  const [ticket, setTicket] = useState<Attendee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. التعديل هنا: اسم الجدول tickets بدلاً من attendees
      const { data, error: fetchError } = await supabase
        .from('tickets') 
        .select(`
          *,
          events:event_id (
            id,
            name,
            date,
            location_name,
            image_url,
            type,
            theme_color
          )
        `)
        // ملاحظة: قمت بإزالة seats مؤقتاً لأننا لم ننشئ جدولها بعد لتجنب الخطأ
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message || 'فشل تحميل التذكرة');
      }

      if (!data) {
        throw new Error('لم يتم العثور على التذكرة');
      }

      // تحويل البيانات لتطابق الـ Type إذا لزم الأمر
      // (Supabase يرجع البيانات حسب هيكل القاعدة، تأكد أن events تأتي كـ Object)
      setTicket(data as unknown as Attendee);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(message);
      console.error('Error fetching ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (
    newStatus: 'confirmed' | 'declined',
    reason?: string
  ): Promise<void> => {
    if (!ticket) {
      setError('لا توجد تذكرة محملة');
      return;
    }

    try {
      const updateData: Record<string, any> = { status: newStatus };
      if (newStatus === 'declined' && reason) {
        updateData.regret_reason = reason;
      }

      // 2. التعديل هنا أيضاً: اسم الجدول tickets
      const { error: updateError } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // تحديث الحالة محلياً
      setTicket({ ...ticket, status: newStatus as any });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل تحديث الحالة';
      setError(message);
      console.error('Error updating ticket status:', err);
      throw err;
    }
  };

  return {
    ticket,
    loading,
    error,
    setTicket,
    updateTicketStatus,
  };
}