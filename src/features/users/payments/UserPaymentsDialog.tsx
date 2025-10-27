import { Text, VStack, Dialog, Portal, Button } from '@chakra-ui/react';

import UserPaymentsTable from './UserPaymentsTable';

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
              <VStack gap={4} align="stretch" overflow="auto">
                <UserPaymentsTable userId={userId} />
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
