import { UserLessonsResponse } from "@/app/(users)/api/admin/users/[id]/lessons/schema";
import { useFetch } from "./useFetch";

interface UseFetchUserLessonsProps {
  userId: number;
  page: number;
  limit: number;
  enabled?: boolean;
}

export function useFetchUserLessons({
  userId,
  page,
  limit,
  enabled = true,
}: UseFetchUserLessonsProps) {
  const url = enabled
    ? `/api/admin/users/${userId}/lessons?page=${page}&limit=${limit}`
    : null;

  const { data, loading, error } = useFetch<UserLessonsResponse>(url);

  return {
    lessons: data?.data || [],
    totalPages: data?.totalPages || 0,
    totalItems: data?.total || 0,
    loading,
    error,
  };
}
