import useSWR from 'swr';
import { supabase } from '@/app/utils/supabase/client';
import { Attendee } from '@/types';

interface UseTicketWithCacheReturn {
  ticket: Attendee | null;
  loading: boolean;
  error: string | null;
  mutate: () => void;
  setTicket: (ticket: Attendee | null) => void;
  updateTicketStatus: (newStatus: 'confirmed' | 'declined', reason?: string) => Promise<void>;
}

const ticketFetcher = async (id: string): Promise<Attendee> => {
  const { data, error } = await supabase
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

  if (error) {
    throw new Error(error.message || 'فشل تحميل التذكرة');
  }

  if (!data) {
    throw new Error('لم يتم العثور على التذكرة');
  }

  return data;
};

export function useTicketWithCache(id: string): UseTicketWithCacheReturn {
  const { data: ticket, error: swrError, mutate, isLoading } = useSWR(
    id ? `/api/attendees/${id}` : null,
    () => ticketFetcher(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      focusThrottleInterval: 300000, // 5 minutes
    }
  );

  const error = swrError?.message || null;
  const loading = isLoading;

  const setTicket = (newTicket: Attendee | null) => {
    if (newTicket) {
      mutate(newTicket, false);
    }
  };

  const updateTicketStatus = async (
    newStatus: 'confirmed' | 'declined',
    reason?: string
  ): Promise<void> => {
    if (!ticket) {
      throw new Error('لا توجد تذكرة محملة');
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

      // تحديث البيانات المحلية بدون جلب من الخادم
      setTicket({ ...ticket, status: newStatus as any });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل تحديث الحالة';
      throw new Error(message);
    }
  };

  return {
    ticket: ticket || null,
    loading,
    error,
    mutate,
    setTicket,
    updateTicketStatus,
  };
}
