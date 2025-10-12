import { useCallback } from "react";
import { UpdateLessonsRequest } from "@/app/(lessons)/api/lessons/schema";
import { useUpdate } from "@/hooks/useUpdate";

export function useUpdateLessons() {
  const { update, isSaving, error } = useUpdate<UpdateLessonsRequest>();

  const updateLessons = useCallback(
    async (data: UpdateLessonsRequest) => {
      await update(data, {
        endpoint: "/api/lessons",
        method: "PUT",
        successMessage: "저장되었습니다.",
        errorMessage: "저장 중 오류가 발생했습니다.",
      });
    },
    [update]
  );

  return {
    updateLessons,
    isSaving,
    error,
  };
}
