import {
  Button,
  Dialog,
  HStack,
  Input,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSearchResult } from "@/app/(users)/api/users/schema";
import { useUpdatePayments } from "./useUpdatePayments";
import { buildDate } from "@/utils/date";

interface UserStartdateSetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: number;
  onUserUpdate: (user: UserSearchResult) => void;
  user: UserSearchResult;
}

const StartdateSetFormSchema = z.object({
  startDateYear: z.string(),
  startDateMonth: z.string(),
  startDateDay: z.string(),
  endDateYear: z.string(),
  endDateMonth: z.string(),
  endDateDay: z.string(),
});

export default function UserStartdateSetDialog({
  isOpen,
  onClose,
  paymentId,
  user,
  onUserUpdate,
}: UserStartdateSetDialogProps) {
  const { handleSubmit, register } = useForm<
    z.input<typeof StartdateSetFormSchema>,
    z.output<typeof StartdateSetFormSchema>
  >({
    resolver: zodResolver(StartdateSetFormSchema),
    defaultValues: {
      startDateYear: "",
      startDateMonth: "",
      startDateDay: "",
      endDateYear: "",
      endDateMonth: "",
      endDateDay: "",
    },
  });
  const { updatePayments } = useUpdatePayments();

  const onSubmit = async (data: z.output<typeof StartdateSetFormSchema>) => {
    const updateData = {
      id: paymentId,
      startDate: buildDate(
        data.startDateYear,
        data.startDateMonth,
        data.startDateDay
      )?.toISOString(),
      endDate: buildDate(
        data.endDateYear,
        data.endDateMonth,
        data.endDateDay
      )?.toISOString(),
      isStartDateNonSet: false,
    };
    const { data: updatedPayments, success } = await updatePayments({
      payments: [updateData],
    });
    if (success && updatedPayments) {
      onUserUpdate({
        ...user,
        payments: updatedPayments.data || [],
      });
    }
    onClose();
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => !e.open && onClose()}
      size="sm"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Text fontSize="lg" fontWeight="bold">
                시작일 설정
              </Text>
              <Dialog.CloseTrigger asChild>
                <Button size="sm" variant="ghost" aria-label="닫기">
                  ✕
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack gap={4} align="stretch">
                  <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                    시작일
                  </Text>
                  <HStack gap={2} align="center">
                    <Input {...register("startDateYear")} placeholder="연" />
                    <Input {...register("startDateMonth")} placeholder="월" />
                    <Input {...register("startDateDay")} placeholder="일" />
                  </HStack>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                    종료일
                  </Text>
                  <HStack gap={2} align="center">
                    <Input {...register("endDateYear")} placeholder="연" />
                    <Input {...register("endDateMonth")} placeholder="월" />
                    <Input {...register("endDateDay")} placeholder="일" />
                  </HStack>
                  <Button type="submit">저장</Button>
                </VStack>
              </form>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
