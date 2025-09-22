import { useCallback } from "react";
import { UpdatePaymentsRequestSchema } from "@/app/(payments)/api/payments/schema";
import { z } from "zod";
import { useUpdate } from "@/hooks/useUpdate";

export function useUpdatePayments() {
  const { update, isSaving, error } =
    useUpdate<z.input<typeof UpdatePaymentsRequestSchema>>();

  const updatePayments = useCallback(
    async (data: z.input<typeof UpdatePaymentsRequestSchema>) => {
      const result = await update(data, {
        endpoint: "/api/payments",
        method: "PUT",
        successMessage: "저장되었습니다.",
        errorMessage: "저장 중 오류가 발생했습니다.",
      });
      return result;
    },
    [update]
  );

  return {
    updatePayments,
    isSaving,
    error,
  };
}
