import {
  Text,
  VStack,
  HStack,
  Separator,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback } from "react";
import StatusBadge from "@/components/ui/status-badge";
import { CenteredSpinner } from "@/components/Spinner";
import { formatDate, formatHour } from "@/utils/date";
import { useUpdate } from "@/hooks/useUpdate";
import {
  UpdateLessonRequest,
  UpdateLessonResponse,
} from "@/app/(lessons)/api/lessons/[id]/schema";
import LessonCancelDialog from "./LessonCancelDialog";
import { useNavigation } from "@/features/navigation/provider/NavigationContext";

interface LessonDetailContentProps {
  lesson: any;
  loading: boolean;
  error: string | null;
  onUserLessonsClick: () => void;
  onLessonUpdate: (updatedLesson: any) => void;
  onLessonCancel?: (cancelledLesson: any) => void;
}

export default function LessonDetailContent({
  lesson,
  loading,
  error,
  onUserLessonsClick,
  onLessonUpdate,
  onLessonCancel,
}: LessonDetailContentProps) {
  const { update, isSaving } = useUpdate<
    UpdateLessonRequest,
    UpdateLessonResponse
  >();
  const { isAdmin } = useNavigation();

  const {
    open: isCancelDialogOpen,
    onOpen: onCancelDialogOpen,
    onClose: onCancelDialogClose,
  } = useDisclosure();

  const formatText = (text: string | null) => {
    if (!text || text.trim() === "") return "(없음)";
    return text;
  };

  const handleToggleDone = useCallback(async () => {
    if (!lesson) return;

    const result = await update(
      { isDone: !lesson.isDone },
      {
        endpoint: `/api/lessons/${lesson.id}`,
        method: "PUT",
        successMessage: lesson.isDone
          ? "레슨이 미완료 처리되었습니다."
          : "레슨이 완료 처리되었습니다.",
        errorMessage: "레슨 상태 업데이트 중 오류가 발생했습니다.",
      }
    );

    if (result.success && result.data) {
      onLessonUpdate(result.data.data);
    }
  }, [lesson, update, onLessonUpdate]);

  if (loading) {
    return <CenteredSpinner size="lg" minHeight="300px" />;
  }

  if (error) {
    return (
      <VStack gap={4} align="center" py={8}>
        <Text color="red.500" fontWeight="bold" fontSize="lg">
          오류가 발생했습니다
        </Text>
        <Text color="gray.600" textAlign="center">
          레슨 정보를 불러오는 중 문제가 발생했습니다.
        </Text>
        <Button variant="outline" onClick={() => window.location.reload()}>
          다시 시도
        </Button>
      </VStack>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
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
          {lesson.userId && isAdmin && (
            <Button size="xs" variant="outline" onClick={onUserLessonsClick}>
              레슨 목록
            </Button>
          )}
        </HStack>
      </HStack>

      <HStack justify="space-between">
        <Text fontWeight="bold">레슨 날짜:</Text>
        <Text>{formatDate(new Date(lesson.dueDate))}</Text>
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
        <Text fontWeight="bold">지점:</Text>
        <Text>{lesson.location.name}</Text>
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

      {isAdmin && (
        <>
          <Separator />
          <VStack align="stretch" gap={2}>
            <Text fontWeight="bold">메모:</Text>
            <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap">
              {formatText(lesson.note)}
            </Text>
          </VStack>
        </>
      )}

      <Separator />
      <HStack gap={2} justify="stretch">
        {isAdmin && (
          <Button
            onClick={handleToggleDone}
            loading={isSaving}
            loadingText="처리 중..."
            flex={1}
          >
            {lesson.isDone ? "미완료 처리" : "완료 처리"}
          </Button>
        )}

        <Button
          colorPalette="red"
          variant="outline"
          onClick={onCancelDialogOpen}
          flex={1}
        >
          레슨 취소
        </Button>
      </HStack>

      <LessonCancelDialog
        isOpen={isCancelDialogOpen}
        onClose={onCancelDialogClose}
        lessonId={lesson.id}
        onSuccess={onLessonCancel}
      />
    </VStack>
  );
}
