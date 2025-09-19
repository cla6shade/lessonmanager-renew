import { useMemo } from "react";
import { UserLookupResponse } from "@/app/(users)/api/users/lookup/schema";
import { useFetch } from "@/hooks/useFetch";

export function useUserLookup(query: string) {
  const url = useMemo(() => {
    if (!query.trim()) return null;
    return `/api/users/lookup?query=${encodeURIComponent(query)}`;
  }, [query]);

  const { data, loading, error, refetch } = useFetch<UserLookupResponse>(url);

  return {
    users: data?.data || [],
    isLoading: loading,
    error,
    refetch,
  };
}
