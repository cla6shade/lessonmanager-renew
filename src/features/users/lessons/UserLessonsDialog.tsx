import { Text, VStack, Dialog, Portal, Button } from '@chakra-ui/react';

import UserLessonsTable from '@/features/users/lessons/UserLessonsTable';

interface UserLessonsDialogProps {
  userId: number;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserLessonsDialog({
  userId,
  userName,
  isOpen,
  onClose,
}: UserLessonsDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="6xl">
            <Dialog.Header>
              <Text fontSize="lg" fontWeight="bold">
                {userName}님의 레슨 목록
              </Text>
              <Dialog.CloseTrigger asChild>
                <Button size="sm" variant="ghost" aria-label="닫기">
                  ✕
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4} align="stretch" overflow="auto">
                <UserLessonsTable userId={userId} />
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
