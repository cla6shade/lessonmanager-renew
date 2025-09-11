import { useState, useEffect, useCallback } from "react";

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T>(
  url: string | null,
  options?: RequestInit
): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fetchData = useCallback(async () => {
    try {
      if (!url || url.trim() === "") {
        return;
      }
      setLoading(true);
      setError(null);

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    if (!url || url.trim() === "") {
      setLoading(false);
      setError(null);
      return;
    }

    fetchData();
  }, [url, options]);

  return { data, loading, error, refetch: fetchData };
}
