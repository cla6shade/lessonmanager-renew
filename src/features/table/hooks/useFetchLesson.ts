import { GetLessonDetailResponse } from "@/app/(lessons)/api/lessons/[id]/schema";
import { GetLessonsResponse } from "@/app/(lessons)/api/lessons/schema";
import { useNavigation } from "@/features/navigation/location/NavigationContext";
import { useFetch } from "@/hooks/useFetch";
import { useState, useCallback } from "react";

interface UseFetchLessonProps {
  startDate: Date;
  endDate: Date;
  teacherId?: number;
}

export function useFetchLesson({
  startDate,
  endDate,
  teacherId,
}: UseFetchLessonProps) {
  const { selectedLocation } = useNavigation();

  const searchParams = new URLSearchParams();
  searchParams.set("startDate", startDate.toISOString());
  searchParams.set("endDate", endDate.toISOString());

  if (teacherId) {
    searchParams.set("teacherId", teacherId.toString());
  }
  if (selectedLocation.id !== undefined) {
    searchParams.set("locationId", selectedLocation.id.toString());
  }

  const url = `/api/lessons?${searchParams.toString()}`;

  const { data, loading, error, refetch } = useFetch<GetLessonsResponse>(url);

  return {
    lessons: data?.data || [],
    loading,
    error,
    refetch,
  };
}

export function useFetchDayLesson(selectedDate: Date, teacherId?: number) {
  const startDate = new Date(selectedDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(selectedDate);
  endDate.setHours(23, 59, 59, 999);

  return useFetchLesson({
    startDate,
    endDate,
    teacherId,
  });
}

export function useFetchWeeklyLesson(
  startDate: Date,
  endDate: Date,
  teacherId?: number
) {
  return useFetchLesson({
    startDate,
    endDate,
    teacherId,
  });
}

export function useFetchLessonDetail(lessonId: number) {
  const url = `/api/lessons/${lessonId}`;
  const { data, loading, error, refetch } =
    useFetch<GetLessonDetailResponse>(url);
  const [localLesson, setLocalLesson] = useState<any>(null);

  const setLesson = useCallback((newLesson: any) => {
    setLocalLesson(newLesson);
  }, []);

  // 로컬 상태가 있으면 그것을 사용하고, 없으면 서버 데이터를 사용
  const currentLesson = localLesson || data?.data;

  return {
    lesson: currentLesson,
    loading,
    error,
    setLesson,
    refetch,
  };
}
