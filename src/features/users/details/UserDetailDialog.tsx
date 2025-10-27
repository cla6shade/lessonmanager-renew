import { Text, Dialog, Portal, Button } from '@chakra-ui/react';
import UserDetailContent from './UserDetailContent';
import { UserSearchResult } from '@/app/(users)/api/users/schema';

interface UserDetailDialogProps {
  user: UserSearchResult;
  isOpen: boolean;
  onClose: () => void;
  refetchUsers: () => void;
  onUserUpdate: (updatedUser: UserSearchResult) => void;
}

export default function UserDetailDialog({
  user,
  isOpen,
  onClose,
  refetchUsers,
  onUserUpdate,
}: UserDetailDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW={{ base: 'full', md: 'lg' }} mx={{ base: 4, md: 'auto' }}>
            <Dialog.Header>
              <Text fontSize="lg" fontWeight="bold">
                수강생 상세 정보
              </Text>

              <Dialog.CloseTrigger asChild>
                <Button size="sm" variant="ghost" aria-label="닫기">
                  ✕
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <UserDetailContent
                user={user}
                onUserUpdate={onUserUpdate}
                loading={false}
                error={null}
                refetchUsers={refetchUsers}
              />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
