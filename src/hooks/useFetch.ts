import { useState, useEffect, useCallback } from 'react';
import { parseResponse } from '@/utils/network';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T>(url: string | null, options?: RequestInit): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url || url.trim() === '') {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const parsed = await parseResponse<{ error?: string }>(response);
        const message =
          typeof parsed?.error === 'string' && parsed.error.trim()
            ? parsed.error
            : `요청 실패: ${response.status}`;
        setError(message);
        setData(null);
        setLoading(false);
        return;
      }

      const parsed = await parseResponse<T>(response);
      if (!parsed) {
        setError('서버 응답 형식이 올바르지 않습니다 (JSON 아님)');
        setData(null);
        setLoading(false);
        return;
      }

      setData(parsed);
    } catch (e) {
      console.error('요청 중 오류:', e);
      const msg = e instanceof Error ? e.message : '네트워크 오류가 발생했습니다.';
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
