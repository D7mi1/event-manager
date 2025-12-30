import useSWR from 'swr';
import { supabase } from '@/app/utils/supabase/client';
import { Event } from '@/types';

interface UseEventWithCacheReturn {
  event: Event | null;
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const eventFetcher = async (eventId: string): Promise<Event> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error) {
    throw new Error(error.message || 'فشل تحميل الفعالية');
  }

  if (!data) {
    throw new Error('لم يتم العثور على الفعالية');
  }

  return data;
};

export function useEventWithCache(eventId: string): UseEventWithCacheReturn {
  const { data: event, error: swrError, mutate, isLoading } = useSWR(
    eventId ? `/api/events/${eventId}` : null,
    () => eventFetcher(eventId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
      focusThrottleInterval: 600000, // 10 minutes
    }
  );

  const error = swrError?.message || null;
  const loading = isLoading;

  return { event: event || null, loading, error, mutate };
}
