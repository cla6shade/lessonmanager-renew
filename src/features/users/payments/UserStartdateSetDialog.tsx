import { Button, Dialog, HStack, Input, Portal, Text, VStack } from '@chakra-ui/react';
import z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserSearchResult } from '@/app/(users)/api/users/schema';
import { useUpdatePayments } from './useUpdatePayments';
import DateInput from '@/features/inputs/DateInput';

interface UserStartdateSetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: number;
  onUserUpdate: (user: UserSearchResult) => void;
  user: UserSearchResult;
}

const StartdateSetFormSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

export default function UserStartdateSetDialog({
  isOpen,
  onClose,
  paymentId,
  user,
  onUserUpdate,
}: UserStartdateSetDialogProps) {
  const { handleSubmit, control } = useForm<
    z.input<typeof StartdateSetFormSchema>,
    z.output<typeof StartdateSetFormSchema>
  >({
    resolver: zodResolver(StartdateSetFormSchema),
    defaultValues: {
      startDate: '',
      endDate: '',
    },
  });
  const { updatePayments } = useUpdatePayments();

  const onSubmit = async (data: z.output<typeof StartdateSetFormSchema>) => {
    const updateData = {
      id: paymentId,
      startDate: data.startDate,
      endDate: data.endDate,
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
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="sm">
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
                  <Controller
                    control={control}
                    name="startDate"
                    render={({ field }) => <DateInput {...field} />}
                  />
                  <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                    종료일
                  </Text>
                  <Controller
                    control={control}
                    name="endDate"
                    render={({ field }) => <DateInput {...field} />}
                  />
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
