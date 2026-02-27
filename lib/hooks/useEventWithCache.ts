import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/queries/query-keys';
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
  const queryClient = useQueryClient();

  const { data: event, error: queryError, isLoading } = useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => eventFetcher(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 دقائق
    gcTime: 10 * 60 * 1000, // 10 دقائق
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const mutate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
  };

  const error = queryError?.message || null;

  return { event: event || null, loading: isLoading, error, mutate };
}
