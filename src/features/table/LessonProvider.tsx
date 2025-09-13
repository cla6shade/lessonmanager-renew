import { GetLessonsResponse } from "@/app/(lessons)/api/lessons/schema";
import { createContext, use, useEffect } from "react";
import { useFetchWeeklyLesson } from "./hooks/useFetchLesson";
import { useTable } from "./TableProvider";

const LessonContext = createContext<LessonContextType | undefined>(undefined);

interface LessonProviderProps {
  children: React.ReactNode;
}

interface LessonContextType {
  lessons: GetLessonsResponse["data"];
  dailyLessons: GetLessonsResponse["data"];
  refetchLessons: () => void;
  isLessonLoading: boolean;
  lessonFetchError: string | null;
}

export default function LessonProvider({ children }: LessonProviderProps) {
  const { datePeriod, selectedTeacher, selectedDate } = useTable();
  const { lessons, loading, error, refetch } = useFetchWeeklyLesson(
    datePeriod.startDate,
    datePeriod.endDate,
    selectedTeacher?.id
  );
  const currentDate = selectedDate ?? new Date();
  const dailyLessons = lessons.filter((lesson) => {
    const lessonDate = new Date(lesson.dueDate!);
    return lessonDate.toDateString() === currentDate.toDateString();
  });

  return (
    <LessonContext.Provider
      value={{
        lessons,
        refetchLessons: refetch,
        dailyLessons,
        isLessonLoading: loading,
        lessonFetchError: error,
      }}
    >
      {children}
    </LessonContext.Provider>
  );
}

export function useLesson() {
  const context = use(LessonContext);
  if (!context) {
    throw new Error("useLesson must be used within a LessonProvider");
  }
  return context;
}
