import {
  Table,
  Input,
  HStack,
  Stack,
  Button,
  Textarea,
} from "@chakra-ui/react";
import { formatDate } from "@/utils/date";
import { Payment } from "@/generated/prisma";
import { useState } from "react";
import RefundDialog from "./RefundDialog";
import { useFormContext } from "react-hook-form";

interface UserPaymentsFormProps {
  payments: Payment[];
  refetch: () => void;
}

export default function UserPaymentsForm({
  payments,
  refetch,
}: UserPaymentsFormProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const { register } = useFormContext();
  const handleRefundClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsRefundDialogOpen(true);
  };

  const handleRefundDialogClose = () => {
    setIsRefundDialogOpen(false);
    setSelectedPayment(null);
  };

  const handleRefundSuccess = () => {
    refetch();
  };

  return (
    <>
      <Stack gap={4} align="stretch">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>결제 일시</Table.ColumnHeader>
              <Table.ColumnHeader>시작일</Table.ColumnHeader>
              <Table.ColumnHeader>종료일</Table.ColumnHeader>
              <Table.ColumnHeader>레슨 횟수</Table.ColumnHeader>
              <Table.ColumnHeader>결제 금액</Table.ColumnHeader>
              <Table.ColumnHeader>환불 금액</Table.ColumnHeader>
              <Table.ColumnHeader>환불</Table.ColumnHeader>
              <Table.ColumnHeader>비고</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {payments.map((payment, index) => (
              <Table.Row key={payment.id}>
                <Table.Cell>
                  {formatDate(new Date(payment.createdAt))}
                </Table.Cell>
                <Table.Cell>
                  <HStack gap={1}>
                    <Input
                      {...register(`${index}.startYear`)}
                      placeholder="년도"
                      size="sm"
                      w="60px"
                      type="number"
                    />
                    <Input
                      {...register(`${index}.startMonth`)}
                      placeholder="월"
                      size="sm"
                      w="50px"
                      type="number"
                    />
                    <Input
                      {...register(`${index}.startDay`)}
                      placeholder="일"
                      size="sm"
                      w="50px"
                      type="number"
                    />
                  </HStack>
                </Table.Cell>
                <Table.Cell>
                  <HStack gap={1}>
                    <Input
                      {...register(`${index}.endYear`)}
                      placeholder="년도"
                      size="sm"
                      w="60px"
                      type="number"
                    />
                    <Input
                      {...register(`${index}.endMonth`)}
                      placeholder="월"
                      size="sm"
                      w="50px"
                      type="number"
                    />
                    <Input
                      {...register(`${index}.endDay`)}
                      placeholder="일"
                      size="sm"
                      w="50px"
                      type="number"
                    />
                  </HStack>
                </Table.Cell>
                <Table.Cell>{payment.lessonCount}</Table.Cell>
                <Table.Cell>{payment.paymentAmount}</Table.Cell>
                <Table.Cell>{payment.refundedAmount}</Table.Cell>
                <Table.Cell>
                  <Button
                    size="sm"
                    variant={payment.refunded ? "outline" : "solid"}
                    colorScheme={payment.refunded ? "red" : "blue"}
                    onClick={() => handleRefundClick(payment)}
                    disabled={false}
                  >
                    {payment.refunded ? "환불 취소" : "환불"}
                  </Button>
                </Table.Cell>
                <Table.Cell>
                  <Textarea
                    {...register(`${index}.memo`)}
                    placeholder="비고"
                    size="sm"
                    w="200px"
                    h="100px"
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Stack>

      {selectedPayment && (
        <RefundDialog
          isOpen={isRefundDialogOpen}
          onClose={handleRefundDialogClose}
          payment={selectedPayment}
          onSuccess={handleRefundSuccess}
        />
      )}
    </>
  );
}
