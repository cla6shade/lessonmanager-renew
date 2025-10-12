import { UserPaymentsResponse } from "@/app/(users)/api/users/[id]/payments/schema";
import { useFetch } from "../../hooks/useFetch";
import { useState, useCallback, useEffect } from "react";

interface UseFetchUserPaymentsProps {
  userId: number;
  page: number;
  limit: number;
  enabled?: boolean;
}

export function useFetchUserPayments({
  userId,
  page,
  limit,
  enabled = true,
}: UseFetchUserPaymentsProps) {
  const url = enabled
    ? `/api/users/${userId}/payments?page=${page}&limit=${limit}`
    : null;

  const { data, loading, error } = useFetch<UserPaymentsResponse>(url);
  const [localData, setLocalData] = useState<UserPaymentsResponse | null>(null);

  const currentData = localData || data;

  const updatePayment = useCallback(
    (
      paymentId: number,
      updatedFields: {
        refunded?: boolean;
        refundedAmount?: number;
        memo?: string;
        startDate?: Date;
        endDate?: Date;
      }
    ) => {
      setLocalData((prevData) => {
        if (!prevData) return prevData;

        return {
          ...prevData,
          data: prevData.data.map((payment) =>
            payment.id === paymentId
              ? { ...payment, ...updatedFields }
              : payment
          ),
        };
      });
    },
    []
  );

  useEffect(() => {
    if (data) {
      setLocalData(data);
    }
  }, [data]);

  return {
    payments: currentData?.data || [],
    totalPages: currentData?.totalPages || 0,
    totalItems: currentData?.total || 0,
    loading,
    error,
    updatePayment,
  };
}
