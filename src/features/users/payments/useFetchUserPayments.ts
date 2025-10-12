import { UserPaymentsResponse } from "@/app/(users)/api/users/[id]/payments/schema";
import { useFetch } from "../../../hooks/useFetch";

interface UseFetchUserPaymentsProps {
  userId: number;
  page: number;
  limit: number;
}

export function useFetchUserPayments({
  userId,
  page,
  limit,
}: UseFetchUserPaymentsProps) {
  const url = `/api/users/${userId}/payments?page=${page}&limit=${limit}`;

  const { data, loading, error, refetch } = useFetch<UserPaymentsResponse>(url);

  return {
    payments: data?.data || [],
    totalPages: data?.totalPages || 0,
    totalItems: data?.total || 0,
    loading,
    error,
    refetch,
  };
}
