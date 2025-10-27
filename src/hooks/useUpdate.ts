import { useState, useCallback } from 'react';
import { toaster } from '@/components/ui/toaster';
import { DataResponse } from '@/app/schema';
import z from 'zod';

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

      try {
        const response = await fetch(options.endpoint, {
          method: options.method || 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: options.method === 'DELETE' ? undefined : JSON.stringify(data),
        });

        if (!response.ok) {
          let serverErrorMessage = `서버 오류가 발생했습니다. (${response.status})`;

          try {
            const errorData = await response.json();
            console.error('API 오류:', errorData);

            if (errorData.error && typeof errorData.error === 'string') {
              serverErrorMessage = errorData.error;
            }
          } catch {
            // JSON 파싱 실패 시 기본 메시지 사용
          }

          const errorMessage = options.errorMessage || serverErrorMessage;
          setError(errorMessage);

          // errorMessage가 지정되거나 서버에서 의미있는 에러 메시지가 온 경우 토스트 표시
          if (
            options.errorMessage ||
            serverErrorMessage !== `서버 오류가 발생했습니다. (${response.status})`
          ) {
            toaster.create({
              title: '오류',
              description: errorMessage,
              type: 'error',
            });
          }

          return { success: false, error: errorMessage };
        }

        let result: TResponse | undefined;
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          result = await response.json();
        }

        if (options.successMessage) {
          toaster.create({
            title: '성공',
            description: options.successMessage,
            type: 'success',
          });
        }

        return { success: true, data: result as TResponse };
      } catch (error) {
        console.error('업데이트 중 오류:', error);
        const errorMessage = options.errorMessage || '서버 오류가 발생했습니다.';
        setError(errorMessage);

        // errorMessage가 지정되거나 네트워크 오류인 경우 토스트 표시
        toaster.create({
          title: '오류',
          description: errorMessage,
          type: 'error',
        });

        return { success: false, error: errorMessage };
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
