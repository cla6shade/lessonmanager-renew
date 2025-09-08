import { useState, useEffect } from "react";
import { Lesson } from "@/generated/prisma";
import { GetLessonsResponse } from "@/app/api/lessons/schema";
import { useNavigation } from "@/features/navigation/location/NavigationContext";

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
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const { selectedLocation } = useNavigation();

  useEffect(() => {
    const fetchLessons = async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("startDate", startDate.toISOString());
      searchParams.set("endDate", endDate.toISOString());

      if (teacherId) {
        searchParams.set("teacherId", teacherId.toString());
      }
      if (selectedLocation) {
        searchParams.set("locationId", selectedLocation.id.toString());
      }

      const response = await fetch(`/api/lessons?${searchParams.toString()}`);
      const data = (await response.json()) as GetLessonsResponse;
      setLessons(data.data);
    };

    fetchLessons();
  }, [startDate.getTime(), endDate.getTime(), teacherId, selectedLocation?.id]);

  return { lessons };
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
