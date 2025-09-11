import { GetLessonsResponse } from "@/app/(lessons)/api/lessons/schema";
import { useNavigation } from "@/features/navigation/location/NavigationContext";
import { useFetch } from "@/hooks/useFetch";

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
  if (selectedLocation) {
    searchParams.set("locationId", selectedLocation.id.toString());
  }

  const url = `/api/lessons?${searchParams.toString()}`;

  const { data, loading, error } = useFetch<GetLessonsResponse>(url);

  return {
    lessons: data?.data || [],
    loading,
    error,
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
