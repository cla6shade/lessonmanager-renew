import { useCallback } from 'react';
import { z } from 'zod';
import {
  UpdatePaymentsRequestSchema,
  UpdatePaymentsResponse,
} from '@/app/(payments)/api/payments/schema';
import { useUpdate } from '@/hooks/useUpdate';

export function useUpdatePayments() {
  const { update, isSaving, error } = useUpdate<
    z.input<typeof UpdatePaymentsRequestSchema>,
    UpdatePaymentsResponse
  >();

  const updatePayments = useCallback(
    async (data: z.input<typeof UpdatePaymentsRequestSchema>) => {
      return await update(data, {
        endpoint: '/api/payments',
        method: 'PUT',
        successMessage: '결제 정보가 저장되었습니다.',
        errorMessage: '결제 정보 저장 중 오류가 발생했습니다.',
      });
    },
    [update],
  );

  return {
    updatePayments,
    isSaving,
    error,
  };
}
