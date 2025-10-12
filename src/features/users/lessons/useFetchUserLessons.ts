import { UserLessonsResponse } from "@/app/(users)/api/users/[id]/lessons/schema";
import { useFetch } from "../../../hooks/useFetch";

interface UseFetchUserLessonsProps {
  userId: number;
  page: number;
  limit: number;
}

export function useFetchUserLessons({
  userId,
  page,
  limit,
}: UseFetchUserLessonsProps) {
  const url = `/api/users/${userId}/lessons?page=${page}&limit=${limit}`;

  const { data, loading, error, refetch } = useFetch<UserLessonsResponse>(url);

  return {
    lessons: data?.data || [],
    totalPages: data?.totalPages || 0,
    totalItems: data?.total || 0,
    loading,
    error,
    refetch,
  };
}
