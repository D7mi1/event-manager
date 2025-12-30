import { useEffect, useState } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { Attendee } from '@/types';

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

      const { data, error: fetchError } = await supabase
        .from('attendees')
        .select(`
          *, 
          events(*), 
          seats (
            seat_number,
            table:tables (name, shape)
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message || 'فشل تحميل التذكرة');
      }

      if (!data) {
        throw new Error('لم يتم العثور على التذكرة');
      }

      setTicket(data);
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

      const { error: updateError } = await supabase
        .from('attendees')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw new Error(updateError.message);
      }

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
