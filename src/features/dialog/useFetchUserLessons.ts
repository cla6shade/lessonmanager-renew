import { UserLessonsResponse } from "@/app/(users)/api/admin/users/[id]/lessons/schema";
import { useFetch } from "../../hooks/useFetch";
import { useState, useCallback, useEffect } from "react";

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
  const [localData, setLocalData] = useState<UserLessonsResponse | null>(null);

  const currentData = localData || data;

  const updateLesson = useCallback(
    (lessonId: number, updatedFields: { note?: string; isDone?: boolean }) => {
      setLocalData((prevData) => {
        if (!prevData) return prevData;

        return {
          ...prevData,
          data: prevData.data.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, ...updatedFields } : lesson
          ),
        };
      });
    },
    []
  );
  useEffect(() => {
    if (data) {
      setLocalData(data);
    }
  }, [data]);

  return {
    lessons: currentData?.data || [],
    totalPages: currentData?.totalPages || 0,
    totalItems: currentData?.total || 0,
    loading,
    error,
    updateLesson,
  };
}
