import {
  Text,
  VStack,
  HStack,
  Separator,
  Dialog,
  Portal,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";
import { GetLessonsResponse } from "@/app/api/lessons/schema";
import UserLessonsDialog from "@/features/dialog/UserLessonsDialog";
import StatusBadge from "@/components/ui/StatusBadge";

interface LessonDetailDialogProps {
  lesson: GetLessonsResponse["data"][number];
  isOpen: boolean;
  onClose: () => void;
}

export default function LessonDetailDialog({
  lesson,
  isOpen,
  onClose,
}: LessonDetailDialogProps) {
  const [isUserLessonsDialogOpen, setIsUserLessonsDialogOpen] = useState(false);
  const formatDate = (date: Date | null) => {
    if (!date) return "(없음)";
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatHour = (hour: number | null) => {
    if (!hour) return "(없음)";
    return `${hour}시`;
  };

  const formatText = (text: string | null) => {
    if (!text || text.trim() === "") return "(없음)";
    return text;
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
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
                <VStack gap={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="bold">상태:</Text>
                    <StatusBadge isDone={!!lesson.isDone} />
                  </HStack>

                  <Separator />

                  <HStack justify="space-between">
                    <Text fontWeight="bold">수강생 이름:</Text>
                    <HStack gap={2}>
                      <Text>{formatText(lesson.username)}</Text>
                      {lesson.userId && lesson.username && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setIsUserLessonsDialogOpen(true)}
                        >
                          레슨 목록
                        </Button>
                      )}
                    </HStack>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="bold">레슨 날짜:</Text>
                    <Text>{formatDate(lesson.dueDate)}</Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="bold">레슨 시간:</Text>
                    <Text>{formatHour(lesson.dueHour)}</Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="bold">연락처:</Text>
                    <Text>{formatText(lesson.contact)}</Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="bold">위치 ID:</Text>
                    <Text>{lesson.location.id}</Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="bold">담당 선생님:</Text>
                    <Text>
                      {lesson.teacher.major.symbol} {lesson.teacher.name}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="bold">레슨 분류:</Text>
                    <Text>{lesson.isGrand ? "그랜드 레슨" : "일반 레슨"}</Text>
                  </HStack>

                  <Separator />
                  <VStack align="stretch" gap={2}>
                    <Text fontWeight="bold">메모:</Text>
                    <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap">
                      {formatText(lesson.note)}
                    </Text>
                  </VStack>
                </VStack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {lesson.userId && lesson.username && (
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
