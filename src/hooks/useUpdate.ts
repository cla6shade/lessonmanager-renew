import { useState, useCallback } from 'react';
import { toaster } from '@/components/ui/toaster';
import { DataResponse } from '@/app/schema';
import z from 'zod';
import { parseResponse } from '@/utils/network';

export interface UpdateOptions {
  endpoint: string;
  method?: 'PUT' | 'POST' | 'PATCH' | 'DELETE';
  successMessage?: string;
  errorMessage?: string;
}

export interface UpdateResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useUpdate<TRequest, TResponse extends DataResponse<z.ZodType> = {}>() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (data: TRequest, options: UpdateOptions): Promise<UpdateResult<TResponse>> => {
      setIsSaving(true);
      setError(null);

      const { endpoint, method = 'PUT', successMessage, errorMessage } = options;

      const showToast = (type: 'success' | 'error', description: string) =>
        toaster.create({
          title: type === 'success' ? '성공' : '오류',
          description,
          type,
        });

      const handleError = (msg: string): UpdateResult<TResponse> => {
        setError(msg);
        showToast('error', msg);
        return { success: false, error: msg };
      };

      try {
        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: method === 'DELETE' ? undefined : JSON.stringify(data),
        });

        if (!response.ok) {
          const defaultErrorMsg = `서버 오류가 발생했습니다. (${response.status})`;
          const parsed = await parseResponse<{ error?: string }>(response);
          const serverErrorMsg =
            typeof parsed?.error === 'string' && parsed.error.trim()
              ? parsed.error
              : defaultErrorMsg;

          const finalMsg = errorMessage || serverErrorMsg;
          if (errorMessage || serverErrorMsg !== defaultErrorMsg) showToast('error', finalMsg);
          return handleError(finalMsg);
        }

        const parsed = await parseResponse<TResponse>(response);
        if (successMessage) showToast('success', successMessage);
        return { success: true, data: parsed };
      } catch (error) {
        console.error('업데이트 중 오류:', error);
        const msg = errorMessage || '서버 오류가 발생했습니다.';
        return handleError(msg);
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  return {
    update,
    isSaving,
    error,
    clearError: useCallback(() => setError(null), []),
  };
}
