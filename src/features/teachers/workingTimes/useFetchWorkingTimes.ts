import { useFetch } from '@/hooks/useFetch';
import { GetWorkingTimesResponse } from '@/app/(table)/api/working-times/schema';

export function useFetchWorkingTimes() {
  const { data, loading, error, refetch } = useFetch<GetWorkingTimesResponse>('/api/working-times');

  return {
    workingTimes: data?.data.times || [],
    openHours: data?.data.openHours || { id: 0, startHour: 0, endHour: 23 },
    loading,
    error,
    refetch,
  };
}
