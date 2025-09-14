import { createStore } from "zustand";
import type { StoreApi } from "zustand";
import { GetLessonsResponse } from "@/app/(lessons)/api/lessons/schema";

export interface LessonState {
  lessons: GetLessonsResponse["data"];
  isLessonLoading: boolean;
  lessonFetchError: string | null;
  refetchLessons: () => void;
}

export type LessonStore = StoreApi<LessonState>;

export function createLessonStore(init: LessonState) {
  return createStore<LessonState>()(() => ({
    lessons: init.lessons,
    isLessonLoading: init.isLessonLoading,
    lessonFetchError: init.lessonFetchError,
    refetchLessons: init.refetchLessons,
  }));
}
