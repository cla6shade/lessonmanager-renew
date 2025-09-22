import { Text, VStack, Dialog, Portal, Button, HStack } from "@chakra-ui/react";
import { useState, useCallback, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import UserPaymentsTable from "./UserPaymentsTable";
import { useUpdatePayments } from "./useUpdatePayments";
import { Payment } from "@/generated/prisma";
import { useFetchUserPayments } from "./useFetchUserPayments";

const PaymentFormSchema = z
  .object({
    id: z.coerce.number(),
    startYear: z.coerce.number().min(1900).max(2100),
    startMonth: z.coerce.number().min(1).max(12),
    startDay: z.coerce.number().min(1).max(31),
    endYear: z.coerce.number().min(1900).max(2100),
    endMonth: z.coerce.number().min(1).max(12),
    endDay: z.coerce.number().min(1).max(31),
    memo: z.string().optional(),
  })
  .array();

type PaymentFormIn = z.input<typeof PaymentFormSchema>;
type PaymentFormOut = z.output<typeof PaymentFormSchema>;

interface UserPaymentsDialogProps {
  userId: number;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserPaymentsDialog({
  userId,
  userName,
  isOpen,
  onClose,
}: UserPaymentsDialogProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { updatePayments, isSaving } = useUpdatePayments();

  const { payments, totalPages, totalItems, loading, error, refetch } =
    useFetchUserPayments({
      userId,
      page: currentPage,
      limit: itemsPerPage,
    });

  const methods = useForm<PaymentFormIn, PaymentFormOut>({
    defaultValues: payments.length > 0 ? getDefaultValues(payments) : [],
    resolver: zodResolver(PaymentFormSchema),
  });

  const {
    handleSubmit,
    formState: { isDirty },
    reset,
  } = methods;

  useEffect(() => {
    if (payments.length > 0) {
      reset(getDefaultValues(payments));
    }
  }, [payments, reset]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onSubmit = useCallback(
    async (data: PaymentFormIn) => {
      try {
        const validatedData = PaymentFormSchema.parse(data);
        const updateData = validatedData.map(toPaymentUpdateInput);
        await updatePayments({ payments: updateData });
        refetch();
        reset();
      } catch (error) {
        console.error("결제 정보 업데이트 실패:", error);
      }
    },
    [updatePayments, refetch, reset]
  );
  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="8xl" maxH="80vh">
            <Dialog.Header>
              <Text fontSize="lg" fontWeight="bold">
                {userName}님의 결제 내역
              </Text>
              <Dialog.CloseTrigger asChild>
                <Button size="sm" variant="ghost" aria-label="닫기">
                  ✕
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4} align="stretch" maxH="60vh" overflow="auto">
                <FormProvider {...methods}>
                  <form id="payments-form" onSubmit={handleSubmit(onSubmit)}>
                    <UserPaymentsTable
                      payments={payments}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      loading={loading}
                      error={error}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      onPageChange={handlePageChange}
                      refetch={refetch}
                    />
                  </form>
                </FormProvider>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack justify="flex-end">
                <Button
                  type="submit"
                  form="payments-form"
                  colorScheme="blue"
                  loading={isSaving}
                  disabled={!isDirty}
                  loadingText="저장 중..."
                >
                  저장
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function getDefaultValues(payments: Payment[]): PaymentFormIn {
  return payments.map((payment) => ({
    id: payment.id,
    startYear: payment.startDate
      ? new Date(payment.startDate).getFullYear()
      : new Date().getFullYear(),
    startMonth: payment.startDate
      ? new Date(payment.startDate).getMonth() + 1
      : new Date().getMonth() + 1,
    startDay: payment.startDate
      ? new Date(payment.startDate).getDate()
      : new Date().getDate(),
    memo: payment.memo || "",
    endYear: payment.endDate
      ? new Date(payment.endDate).getFullYear()
      : new Date().getFullYear(),
    endMonth: payment.endDate
      ? new Date(payment.endDate).getMonth() + 1
      : new Date().getMonth() + 1,
    endDay: payment.endDate
      ? new Date(payment.endDate).getDate()
      : new Date().getDate(),
  }));
}

function toPaymentUpdateInput(payment: PaymentFormOut[number]): {
  id: number;
  memo?: string;
  startDate?: string;
  endDate?: string;
} {
  return {
    id: payment.id,
    memo: payment.memo || "",
    startDate:
      payment.startYear && payment.startMonth && payment.startDay
        ? new Date(
            payment.startYear,
            payment.startMonth - 1,
            payment.startDay
          ).toISOString()
        : undefined,
    endDate:
      payment.endYear && payment.endMonth && payment.endDay
        ? new Date(
            payment.endYear,
            payment.endMonth - 1,
            payment.endDay
          ).toISOString()
        : undefined,
  };
}
