import { useFetch } from '@/hooks/useFetch';
import { TeacherSearchResponse } from '@/app/(teachers)/api/teachers/schema';

interface UseFetchTeachersProps {
  startDate: string;
  endDate: string;
  page: number;
}

export default function useFetchTeachers({ startDate, endDate, page }: UseFetchTeachersProps) {
  const searchParams = new URLSearchParams();

  if (startDate) {
    searchParams.set('startDate', new Date(startDate).toISOString());
  }
  if (endDate) {
    searchParams.set('endDate', new Date(endDate).toISOString());
  }
  searchParams.set('page', page.toString());
  searchParams.set('limit', '20');

  const url = `/api/teachers?${searchParams.toString()}`;

  const { data, loading, error, refetch } = useFetch<TeacherSearchResponse>(url);

  return {
    teachers: data?.data || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 0,
    loading,
    error,
    refetch,
  };
}
