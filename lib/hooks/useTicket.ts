import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
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

      const { data: ticketData, error: fetchError } = await supabase
        .from('attendees')
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
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message || 'فشل تحميل التذكرة');
      }

      if (!ticketData) {
        throw new Error('لم يتم العثور على التذكرة');
      }

      const { data: seatsData } = await supabase
        .from('seats')
        .select('seat_number, table:tables(name)')
        .eq('attendee_id', id);

      const fullTicket = {
        ...ticketData,
        seats: seatsData || []
      };

      setTicket(fullTicket as unknown as Attendee);

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
