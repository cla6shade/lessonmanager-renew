import { Text, Dialog, Portal, Button } from '@chakra-ui/react';
import { TeacherSearchResult } from '@/app/(teachers)/api/teachers/schema';
import TeacherDetailContent from './TeacherDetailContent';

interface TeacherDetailDialogProps {
  teacher: TeacherSearchResult;
  onTeacherUpdate: (teacher: TeacherSearchResult) => void;
  isOpen: boolean;
  onClose: () => void;
  refetchTeachers: () => void;
}

export default function TeacherDetailDialog({
  teacher,
  onTeacherUpdate,
  isOpen,
  onClose,
  refetchTeachers,
}: TeacherDetailDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW={{ base: 'full', md: 'lg' }} mx={{ base: 4, md: 'auto' }}>
            <Dialog.Header>
              <Text fontSize="lg" fontWeight="bold">
                선생님 상세 정보
              </Text>

              <Dialog.CloseTrigger asChild>
                <Button size="sm" variant="ghost" aria-label="닫기">
                  ✕
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <TeacherDetailContent
                teacher={teacher}
                onTeacherUpdate={onTeacherUpdate}
                loading={false}
                error={null}
                refetchTeachers={refetchTeachers}
                onClose={onClose}
              />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
