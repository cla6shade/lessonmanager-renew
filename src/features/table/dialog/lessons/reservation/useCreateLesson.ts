import { useCallback } from "react";
import {
  CreateLessonByUserInput,
  CreateLessonByUserResponse,
  CreateLessonByAdminInput,
  CreateLessonByAdminResponse,
} from "@/app/(lessons)/api/lessons/schema";
import { useUpdate } from "@/hooks/useUpdate";

export function useCreateLesson() {
  const { update, isSaving, error } = useUpdate<
    CreateLessonByUserInput | CreateLessonByAdminInput,
    CreateLessonByUserResponse | CreateLessonByAdminResponse
  >();

  const createLesson = useCallback(
    async (data: CreateLessonByUserInput | CreateLessonByAdminInput) => {
      const result = await update(data, {
        endpoint: "/api/lessons",
        method: "POST",
        successMessage: "레슨이 성공적으로 예약되었습니다.",
      });
      return result;
    },
    [update]
  );

  return {
    createLesson,
    isSaving,
    error,
  };
}
