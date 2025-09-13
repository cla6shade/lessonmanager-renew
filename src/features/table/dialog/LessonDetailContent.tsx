import { Text, VStack, HStack, Separator, Button } from "@chakra-ui/react";
import { useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { CenteredSpinner } from "@/components/Spinner";
import { formatDate, formatHour } from "@/utils/date";

interface LessonDetailContentProps {
  lesson: any;
  loading: boolean;
  error: string | null;
  onUserLessonsClick: () => void;
  onLessonUpdate: (updatedLesson: any) => void;
}

export default function LessonDetailContent({
  lesson,
  loading,
  error,
  onUserLessonsClick,
  onLessonUpdate,
}: LessonDetailContentProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const formatText = (text: string | null) => {
    if (!text || text.trim() === "") return "(없음)";
    return text;
  };

  const handleToggleDone = async () => {
    if (!lesson) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/lessons/${lesson.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isDone: !lesson.isDone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update lesson");
      }

      const result = await response.json();
      onLessonUpdate(result.data);
    } catch (error) {
      console.error("Error updating lesson:", error);
    } finally {
      setIsUpdating(false);
    }
  };

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
          {lesson.userId && lesson.username && (
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

      <Separator />
      <VStack align="stretch" gap={2}>
        <Text fontWeight="bold">메모:</Text>
        <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap">
          {formatText(lesson.note)}
        </Text>
      </VStack>

      <Separator />
      <Button
        colorScheme={lesson.isDone ? "orange" : "green"}
        onClick={handleToggleDone}
        loading={isUpdating}
        loadingText="처리 중..."
      >
        {lesson.isDone ? "레슨 미완료 처리하기" : "레슨 완료 처리하기"}
      </Button>
    </VStack>
  );
}
