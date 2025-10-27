import { GetBannedTimesResponse } from '@/app/(table)/api/bans/schema';
import { useFetch } from '@/hooks/useFetch';

export default function useFetchBannedTimes({
  startDate,
  endDate,
  teacherId,
}: {
  startDate: Date;
  endDate: Date;
  teacherId?: number;
}) {
  const searchParams = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  if (teacherId !== undefined) {
    searchParams.set('teacherId', teacherId.toString());
  }

  const url = `/api/bans?${searchParams.toString()}`;
  const { data, loading, error, refetch } = useFetch<GetBannedTimesResponse>(url);
  return { data: data?.data || [], loading, error, refetch };
}
