import { useState, useCallback } from "react";
import { UpdateLessonsRequest } from "@/app/(lessons)/api/lessons/schema";

export function useUpdateLessons() {
  const [isSaving, setIsSaving] = useState(false);

  const updateLessons = useCallback(async (data: UpdateLessonsRequest) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/lessons", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        alert("저장 중 오류가 발생했습니다.");
        console.log(response);
        return;
      }

      alert("저장되었습니다.");
    } catch (error) {
      console.error("저장 중 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    updateLessons,
    isSaving,
  };
}
