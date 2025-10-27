import { useNavigation } from '@/features/navigation/provider/NavigationContext';
import { useLesson } from '@/features/table/grid/providers/LessonProvider';
import { Dialog } from '@chakra-ui/react';
import { Portal } from '@chakra-ui/react';
import AdminLessonReservationForm from './AdminLessonReservationForm';
import UserLessonReservationForm from './UserLessonReservationForm';

interface LessonReservationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LessonReservationDialog({ isOpen, onClose }: LessonReservationDialogProps) {
  const { refetchLessons } = useLesson();
  const { isAdmin } = useNavigation();

  const handleSuccess = () => {
    refetchLessons();
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => e.open || onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW={{ base: 'full', md: 'md' }} mx={{ base: 4, md: 'auto' }}>
            <Dialog.Header>
              <Dialog.Title>레슨 예약</Dialog.Title>
              <Dialog.CloseTrigger onClick={onClose} />
            </Dialog.Header>

            <Dialog.Body>
              {isAdmin ? (
                <AdminLessonReservationForm onSuccess={handleSuccess} onCancel={onClose} />
              ) : (
                <UserLessonReservationForm onSuccess={handleSuccess} onCancel={onClose} />
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
