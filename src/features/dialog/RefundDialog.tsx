"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Text,
  Portal,
  VStack,
  HStack,
  Box,
} from "@chakra-ui/react";
import { Payment } from "@/generated/prisma";
import { useUpdatePayments } from "@/features/dialog/useUpdatePayments";

interface RefundDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment;
  onSuccess?: () => void;
}

export default function RefundDialog({
  isOpen,
  onClose,
  payment,
  onSuccess,
}: RefundDialogProps) {
  const [refundedAmount, setRefundedAmount] = useState<string>("0");
  const { updatePayments, isSaving } = useUpdatePayments();

  const handleOpen = () => {
    setRefundedAmount(
      payment.refunded ? payment.refundedAmount.toString() : "0"
    );
  };

  const handleClose = () => {
    setRefundedAmount("0");
    onClose();
  };

  const handleConfirm = async () => {
    const refundedAmountNumber = Number(refundedAmount);

    if (isRefunded) {
      // 환불 취소: 환불 금액을 0으로, 환불 상태를 false로
      await updatePayments({
        payments: [
          {
            id: payment.id,
            refunded: false,
            refundedAmount: 0,
            memo: payment.memo || undefined,
          },
        ],
      });
    } else {
      // 환불 처리: 입력된 환불 금액으로 환불 상태를 true로
      await updatePayments({
        payments: [
          {
            id: payment.id,
            refunded: true,
            refundedAmount: refundedAmountNumber,
            memo: payment.memo || undefined,
          },
        ],
      });
    }

    onSuccess?.();
    handleClose();
  };

  const isRefunded = payment.refunded;
  const maxAmount = payment.paymentAmount;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (details.open) {
          handleOpen();
        } else {
          handleClose();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {isRefunded ? "환불 취소" : "환불 처리"}
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap={4} align="stretch">
                <VStack gap={1} align="start">
                  <Text fontSize="sm" color="gray.600">
                    결제 금액: {payment.paymentAmount.toLocaleString()}원
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    현재 환불 금액: {payment.refundedAmount.toLocaleString()}원
                  </Text>
                </VStack>

                {!isRefunded && (
                  <VStack gap={2} align="stretch">
                    <Text fontSize="sm" fontWeight="medium">
                      환불 금액
                    </Text>
                    <Input
                      id="refundedAmount"
                      type="number"
                      min="0"
                      max={maxAmount}
                      value={refundedAmount}
                      onChange={(e) => setRefundedAmount(e.target.value)}
                      placeholder="환불 금액을 입력하세요"
                      disabled={isSaving}
                    />
                    <Text fontSize="xs" color="gray.500">
                      최대 {maxAmount.toLocaleString()}원까지 입력 가능
                    </Text>
                  </VStack>
                )}

                {isRefunded && (
                  <Box
                    p={3}
                    bg="blue.50"
                    border="1px solid"
                    borderColor="blue.200"
                    borderRadius="md"
                  >
                    <Text fontSize="sm" color="blue.800">
                      환불 취소를 하시겠습니까? 환불 금액이 0원으로 설정되고
                      미환불 상태로 변경됩니다.
                    </Text>
                  </Box>
                )}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSaving}
              >
                취소
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={
                  isSaving ||
                  (!isRefunded &&
                    (Number(refundedAmount) < 0 ||
                      Number(refundedAmount) > maxAmount))
                }
                loading={isSaving}
              >
                {isRefunded ? "환불 취소" : "환불 처리"}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
