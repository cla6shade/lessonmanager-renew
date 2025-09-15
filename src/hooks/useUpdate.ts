import { useState, useCallback } from "react";
import { toaster } from "@/components/ui/toaster";

export interface UpdateOptions {
  endpoint: string;
  method?: "PUT" | "POST" | "PATCH";
  successMessage?: string;
  errorMessage?: string;
}

export interface UpdateResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useUpdate<TRequest, TResponse = unknown>() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (
      data: TRequest,
      options: UpdateOptions
    ): Promise<UpdateResult<TResponse>> => {
      setIsSaving(true);
      setError(null);

      try {
        const response = await fetch(options.endpoint, {
          method: options.method || "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API 오류:", errorText);
          const errorMessage =
            options.errorMessage ||
            `서버 오류가 발생했습니다. (${response.status})`;
          setError(errorMessage);

          if (options.errorMessage) {
            toaster.create({
              title: "오류",
              description: errorMessage,
              type: "error",
            });
          }

          return { success: false, error: errorMessage };
        }

        let result: TResponse | undefined;
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          result = await response.json();
        }

        if (options.successMessage) {
          toaster.create({
            title: "성공",
            description: options.successMessage,
            type: "success",
          });
        }

        return { success: true, data: result };
      } catch (error) {
        console.error("업데이트 중 오류:", error);
        const errorMessage =
          options.errorMessage || "네트워크 오류가 발생했습니다.";
        setError(errorMessage);

        if (options.errorMessage) {
          toaster.create({
            title: "오류",
            description: errorMessage,
            type: "error",
          });
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return {
    update,
    isSaving,
    error,
    clearError: useCallback(() => setError(null), []),
  };
}
