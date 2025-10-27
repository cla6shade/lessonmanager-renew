import { Text, Dialog, Portal, Button } from '@chakra-ui/react';
import { useState } from 'react';
import UserLessonsDialog from '@/features/users/lessons/UserLessonsDialog';
import { useFetchLessonDetail } from '../hooks/useFetchLesson';
import LessonDetailContent from './LessonDetailContent';
import { useLesson } from '../grid/providers/LessonProvider';

interface LessonDetailDialogProps {
  lessonId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function LessonDetailDialog({ lessonId, isOpen, onClose }: LessonDetailDialogProps) {
  const [isUserLessonsDialogOpen, setIsUserLessonsDialogOpen] = useState(false);
  const { lesson, loading, error } = useFetchLessonDetail(lessonId);
  const { refetchLessons } = useLesson();

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW={{ base: 'full', md: 'md' }} mx={{ base: 4, md: 'auto' }}>
              <Dialog.Header>
                <Text fontSize="lg" fontWeight="bold">
                  레슨 상세 정보
                </Text>

                <Dialog.CloseTrigger asChild>
                  <Button size="sm" variant="ghost" aria-label="닫기">
                    ✕
                  </Button>
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <LessonDetailContent
                  lesson={lesson}
                  loading={loading}
                  error={error}
                  onUserLessonsClick={() => setIsUserLessonsDialogOpen(true)}
                  onLessonUpdate={() => {
                    refetchLessons();
                  }}
                  onLessonCancel={() => {
                    onClose();
                    refetchLessons();
                  }}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {!loading && !error && lesson?.userId && lesson?.username && (
        <UserLessonsDialog
          userId={lesson.userId}
          userName={lesson.username}
          isOpen={isUserLessonsDialogOpen}
          onClose={() => setIsUserLessonsDialogOpen(false)}
        />
      )}
    </>
  );
}
