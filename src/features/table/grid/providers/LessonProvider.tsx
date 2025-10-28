import { useEffect, useState, createContext, use, ReactNode } from 'react';
import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';
import { useFetchWeeklyLesson } from '../../hooks/useFetchLesson';
import { createLessonStore, LessonState, LessonStore } from '../../stores/lessonStore';
import { useTable } from '../../providers/TableProvider';
import useFetchBannedTimes from '../../hooks/useFetchBannedTimes';

const LessonStoreContext = createContext<LessonStore | null>(null);

interface LessonProviderProps {
  children: ReactNode;
}

export default function LessonProvider({ children }: LessonProviderProps) {
  const { datePeriod, selectedTeacher } = useTable();

  const { lessons, loading, error, refetch } = useFetchWeeklyLesson(
    datePeriod.startDate,
    datePeriod.endDate,
    selectedTeacher?.id,
  );

  const { data: bannedTimes, refetch: refetchBannedTimes } = useFetchBannedTimes({
    startDate: datePeriod.startDate,
    endDate: datePeriod.endDate,
    teacherId: selectedTeacher?.id,
  });

  const initialState: LessonState = {
    lessons,
    bannedTimes,
    refetchBannedTimes,
    isLessonLoading: loading,
    lessonFetchError: error,
    refetchLessons: refetch,
  };

  const [store] = useState<StoreApi<LessonState>>(() => createLessonStore(initialState));

  useEffect(() => {
    store.setState({
      lessons,
      bannedTimes,
      refetchBannedTimes,
      isLessonLoading: loading,
      lessonFetchError: error,
      refetchLessons: refetch,
    });
  }, [lessons, loading, error, refetch, store, bannedTimes, refetchBannedTimes]);

  useEffect(() => {
    store.setState({
      bannedTimes,
    });
  }, [bannedTimes, store]);

  return <LessonStoreContext.Provider value={store}>{children}</LessonStoreContext.Provider>;
}

function useLessonStoreSelector<U>(selector: (s: LessonState) => U) {
  const store = use(LessonStoreContext);
  if (!store) throw new Error('useLesson must be used within a LessonProvider');
  return useStore(store, selector);
}

export function useLesson() {
  const lessons = useLessonStoreSelector((s) => s.lessons);
  const refetchLessons = useLessonStoreSelector((s) => s.refetchLessons);
  const isLessonLoading = useLessonStoreSelector((s) => s.isLessonLoading);
  const lessonFetchError = useLessonStoreSelector((s) => s.lessonFetchError);
  const bannedTimes = useLessonStoreSelector((s) => s.bannedTimes);
  const refetchBannedTimes = useLessonStoreSelector((s) => s.refetchBannedTimes);
  return {
    lessons,
    refetchLessons,
    isLessonLoading,
    lessonFetchError,
    bannedTimes,
    refetchBannedTimes,
  };
}
