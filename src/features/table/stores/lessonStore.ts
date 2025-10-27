import { createStore } from 'zustand';
import type { StoreApi } from 'zustand';
import { GetLessonsResponse } from '@/app/(lessons)/api/lessons/schema';
import { GetBannedTimesResponse } from '@/app/(table)/api/bans/schema';

export interface LessonState {
  lessons: GetLessonsResponse['data'];
  bannedTimes: GetBannedTimesResponse['data'];
  refetchBannedTimes: () => void;
  isLessonLoading: boolean;
  lessonFetchError: string | null;
  refetchLessons: () => void;
}

export type LessonStore = StoreApi<LessonState>;

export function createLessonStore(init: LessonState) {
  return createStore<LessonState>()(() => ({
    lessons: init.lessons,
    bannedTimes: init.bannedTimes,
    refetchBannedTimes: init.refetchBannedTimes,
    isLessonLoading: init.isLessonLoading,
    lessonFetchError: init.lessonFetchError,
    refetchLessons: init.refetchLessons,
  }));
}
