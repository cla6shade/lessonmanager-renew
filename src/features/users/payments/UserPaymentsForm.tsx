import {
  VStack,
  Table,
  Checkbox,
  Textarea,
  Input,
  HStack,
} from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { useUpdatePayments } from "./useUpdatePayments";
import { formatDate } from "@/utils/date";
import { UpdatePaymentsRequestSchema } from "@/app/(payments)/api/payments/schema";
import { UserPaymentsResponse } from "@/app/(users)/api/users/[id]/payments/schema";
import { useEffect } from "react";

// 클라이언트 폼 타입 (년/월/일 분리)
type PaymentFormData = {
  id: string;
  refunded?: boolean;
  refundedAmount?: string;
  memo?: string;
  startDateYear?: string;
  startDateMonth?: string;
  startDateDay?: string;
  endDateYear?: string;
  endDateMonth?: string;
  endDateDay?: string;
};

type UpdatePaymentsFormData = {
  payments: PaymentFormData[];
};

interface UserPaymentsFormProps {
  payments: UserPaymentsResponse["data"];
}

export default function UserPaymentsForm({ payments }: UserPaymentsFormProps) {
  const { updatePayments } = useUpdatePayments();

  const defaultPayments: UpdatePaymentsFormData["payments"] = payments.map(
    (payment) => {
      const startDate = payment.startDate ? new Date(payment.startDate) : null;
      const endDate = payment.endDate ? new Date(payment.endDate) : null;

      return {
        id: payment.id.toString(),
        refunded: payment.refunded,
        refundedAmount: payment.refundedAmount.toString(),
        memo: payment.memo ?? "",
        startDateYear: startDate ? startDate.getFullYear().toString() : "",
        startDateMonth: startDate ? (startDate.getMonth() + 1).toString() : "",
        startDateDay: startDate ? startDate.getDate().toString() : "",
        endDateYear: endDate ? endDate.getFullYear().toString() : "",
        endDateMonth: endDate ? (endDate.getMonth() + 1).toString() : "",
        endDateDay: endDate ? endDate.getDate().toString() : "",
      };
    }
  );

  const { control, handleSubmit, register, reset } =
    useForm<UpdatePaymentsFormData>({
      defaultValues: { payments: defaultPayments },
    });

  useEffect(() => {
    reset({ payments: defaultPayments });
  }, [payments, reset]);

  const onSubmit = async (data: UpdatePaymentsFormData) => {
    const serverData = {
      payments: data.payments.map((payment) => {
        const startDate =
          payment.startDateYear &&
          payment.startDateMonth &&
          payment.startDateDay
            ? new Date(
                parseInt(payment.startDateYear),
                parseInt(payment.startDateMonth) - 1,
                parseInt(payment.startDateDay)
              ).toISOString()
            : undefined;

        const endDate =
          payment.endDateYear && payment.endDateMonth && payment.endDateDay
            ? new Date(
                parseInt(payment.endDateYear),
                parseInt(payment.endDateMonth) - 1,
                parseInt(payment.endDateDay)
              ).toISOString()
            : undefined;

        return {
          id: payment.id,
          refunded: payment.refunded,
          refundedAmount: payment.refundedAmount,
          memo: payment.memo,
          startDate,
          endDate,
        };
      }),
    };

    await updatePayments(serverData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  return (
    <form id="payments-form" onSubmit={handleSubmit(onSubmit)}>
      <VStack gap={4} align="stretch">
        <Table.Root variant="line" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>결제일</Table.ColumnHeader>
              <Table.ColumnHeader>결제금액</Table.ColumnHeader>
              <Table.ColumnHeader>월수</Table.ColumnHeader>
              <Table.ColumnHeader>레슨수</Table.ColumnHeader>
              <Table.ColumnHeader>시작일</Table.ColumnHeader>
              <Table.ColumnHeader>종료일</Table.ColumnHeader>
              <Table.ColumnHeader>환불여부</Table.ColumnHeader>
              <Table.ColumnHeader>환불금액</Table.ColumnHeader>
              <Table.ColumnHeader>메모</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {payments.map((payment, index) => (
              <Table.Row key={payment.id}>
                <Table.Cell>
                  {formatDate(new Date(payment.createdAt))}
                </Table.Cell>
                <Table.Cell>
                  {formatCurrency(payment.paymentAmount)}원
                </Table.Cell>
                <Table.Cell>{payment.months}개월</Table.Cell>
                <Table.Cell>{payment.lessonCount}회</Table.Cell>
                <Table.Cell>
                  <HStack gap={1}>
                    <Input
                      {...register(`payments.${index}.startDateYear`)}
                      placeholder="년"
                      size="sm"
                      maxW="60px"
                      maxLength={4}
                    />
                    <Input
                      {...register(`payments.${index}.startDateMonth`)}
                      placeholder="월"
                      size="sm"
                      maxW="50px"
                      maxLength={2}
                    />
                    <Input
                      {...register(`payments.${index}.startDateDay`)}
                      placeholder="일"
                      size="sm"
                      maxW="50px"
                      maxLength={2}
                    />
                  </HStack>
                </Table.Cell>
                <Table.Cell>
                  <HStack gap={1}>
                    <Input
                      {...register(`payments.${index}.endDateYear`)}
                      placeholder="년"
                      size="sm"
                      maxW="60px"
                      maxLength={4}
                    />
                    <Input
                      {...register(`payments.${index}.endDateMonth`)}
                      placeholder="월"
                      size="sm"
                      maxW="50px"
                      maxLength={2}
                    />
                    <Input
                      {...register(`payments.${index}.endDateDay`)}
                      placeholder="일"
                      size="sm"
                      maxW="50px"
                      maxLength={2}
                    />
                  </HStack>
                </Table.Cell>
                <Table.Cell>
                  <Controller
                    control={control}
                    name={`payments.${index}.refunded`}
                    render={({ field: { onChange, value } }) => (
                      <Checkbox.Root
                        checked={value}
                        onCheckedChange={(details) =>
                          onChange(!!details.checked)
                        }
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                      </Checkbox.Root>
                    )}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Input
                    {...register(`payments.${index}.refundedAmount`)}
                    type="text"
                    placeholder="환불금액"
                    size="sm"
                    maxW="120px"
                  />
                </Table.Cell>
                <Table.Cell>
                  <Textarea
                    {...register(`payments.${index}.memo`)}
                    placeholder="메모를 입력하세요"
                    size="sm"
                    minH="80px"
                    minW="200px"
                    resize="vertical"
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {payments.map((payment, index) => (
          <input
            key={payment.id}
            type="hidden"
            {...register(`payments.${index}.id`)}
            value={payment.id}
          />
        ))}
      </VStack>
    </form>
  );
}
