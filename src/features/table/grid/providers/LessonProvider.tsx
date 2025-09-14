import { useEffect, useMemo, useState, createContext, use } from "react";
import type { StoreApi } from "zustand";
import { useStore } from "zustand";
import { useFetchWeeklyLesson } from "../../hooks/useFetchLesson";
import { isSameDate } from "@/utils/date";
import {
  createLessonStore,
  LessonState,
  LessonStore,
} from "../../stores/lessonStore";
import { useTable } from "./TableProvider";

const LessonStoreContext = createContext<LessonStore | null>(null);

interface LessonProviderProps {
  children: React.ReactNode;
}

export default function LessonProvider({ children }: LessonProviderProps) {
  const { datePeriod, selectedTeacher, selectedDate } = useTable();

  const { lessons, loading, error, refetch } = useFetchWeeklyLesson(
    datePeriod.startDate,
    datePeriod.endDate,
    selectedTeacher?.id
  );

  const currentDate = selectedDate ?? new Date();

  const dailyLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const lessonDate = new Date(lesson.dueDate!);
      return isSameDate(lessonDate, currentDate);
    });
  }, [lessons, currentDate]);

  const initialState: LessonState = {
    lessons,
    isLessonLoading: loading,
    lessonFetchError: error,
    refetchLessons: refetch,
  };

  const [store] = useState<StoreApi<LessonState>>(() =>
    createLessonStore(initialState)
  );

  useEffect(() => {
    store.setState({
      lessons,
      isLessonLoading: loading,
      lessonFetchError: error,
      refetchLessons: refetch,
    });
  }, [lessons, dailyLessons, loading, error, refetch, store]);

  return (
    <LessonStoreContext.Provider value={store}>
      {children}
    </LessonStoreContext.Provider>
  );
}

function useLessonStoreSelector<U>(selector: (s: LessonState) => U) {
  const store = use(LessonStoreContext);
  if (!store) throw new Error("useLesson must be used within a LessonProvider");
  return useStore(store, selector);
}

export function useLesson() {
  const lessons = useLessonStoreSelector((s) => s.lessons);
  const refetchLessons = useLessonStoreSelector((s) => s.refetchLessons);
  const isLessonLoading = useLessonStoreSelector((s) => s.isLessonLoading);
  const lessonFetchError = useLessonStoreSelector((s) => s.lessonFetchError);

  return {
    lessons,
    refetchLessons,
    isLessonLoading,
    lessonFetchError,
  };
}
