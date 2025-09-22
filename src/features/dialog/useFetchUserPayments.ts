import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { Payment } from "@/generated/zod";
import { UserPaymentsResponse } from "@/app/(users)/api/users/[id]/payments/schema";

interface UseFetchUserPaymentsParams {
  userId: number;
  page: number;
  limit: number;
}

export function useFetchUserPayments({
  userId,
  page,
  limit,
}: UseFetchUserPaymentsParams) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const { data, loading, error, refetch } = useFetch<UserPaymentsResponse>(
    `/api/users/${userId}/payments?page=${page}&limit=${limit}`
  );

  useEffect(() => {
    if (data?.data) {
      setPayments(data.data || []);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.total || 0);
    }
  }, [data]);

  return {
    payments,
    totalPages,
    totalItems,
    loading,
    error: error || null,
    refetch,
  };
}
