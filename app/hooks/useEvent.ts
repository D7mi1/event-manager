import { useEffect, useState } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { Event } from '@/types';

interface UseEventReturn {
  event: Event | null;
  loading: boolean;
  error: string | null;
}

export function useEvent(eventId: string): UseEventReturn {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message || 'فشل تحميل الفعالية');
      }

      if (!data) {
        throw new Error('لم يتم العثور على الفعالية');
      }

      setEvent(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(message);
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  return { event, loading, error };
}
