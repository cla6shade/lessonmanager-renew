import {
  Text,
  VStack,
  HStack,
  Dialog,
  Portal,
  Table,
  Spinner,
  Button,
  Textarea,
} from "@chakra-ui/react";
import { Checkbox } from "@chakra-ui/react";
import { useState, useEffect } from "react";

import Pagination from "@/components/ui/pagination";
import { UserLessonsResponse } from "@/app/(users)/api/admin/users/[id]/lessons/schema";
import { useFetchUserLessons } from "@/features/dialog/useFetchUserLessons";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [editingLessons, setEditingLessons] = useState<
    Record<number, { note: string; isDone: boolean }>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  const { lessons, totalPages, totalItems, loading, error, updateLesson } =
    useFetchUserLessons({
      userId,
      page: currentPage,
      limit: itemsPerPage,
      enabled: isOpen,
    });

  // Reset page when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setEditingLessons({});
    }
  }, [isOpen]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLessonEdit = (
    lessonId: number,
    field: "note" | "isDone",
    value: string | boolean
  ) => {
    setEditingLessons((prev) => {
      const currentLesson = lessons.find((lesson) => lesson.id === lessonId);
      if (!currentLesson) return prev;

      return {
        ...prev,
        [lessonId]: {
          note: prev[lessonId]?.note ?? currentLesson.note ?? "",
          isDone: prev[lessonId]?.isDone ?? !!currentLesson.isDone,
          [field]: value,
        },
      };
    });
  };

  const getEditingValue = (
    lessonId: number,
    field: "note" | "isDone",
    originalValue: string | boolean
  ) => {
    return editingLessons[lessonId]?.[field] ?? originalValue;
  };

  const hasChanges = () => {
    return Object.keys(editingLessons).length > 0;
  };

  const handleSave = async () => {
    if (!hasChanges()) return;

    setIsSaving(true);
    try {
      const promises = Object.entries(editingLessons).map(
        async ([lessonId, changes]) => {
          const response = await fetch(`/api/lessons/${lessonId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(changes),
          });

          if (!response.ok) {
            throw new Error(`레슨 ${lessonId} 업데이트 실패`);
          }

          const result = await response.json();
          updateLesson(Number(lessonId), {
            note: result.data.note,
            isDone: result.data.isDone,
          });
        }
      );

      await Promise.all(promises);
      setEditingLessons({});
    } catch (error) {
      console.error("저장 중 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

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

  const renderDialogContent = () => {
    if (loading) {
      return (
        <HStack justify="center" h="256px">
          <Spinner size="lg" />
          <Text>레슨 목록을 불러오는 중...</Text>
        </HStack>
      );
    }

    if (error) {
      return (
        <VStack
          p={4}
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          borderRadius="md"
          align="stretch"
        >
          <Text color="red.600" fontWeight="bold">
            오류 발생!
          </Text>
          <Text color="red.600">{error}</Text>
        </VStack>
      );
    }

    if (lessons.length === 0) {
      return (
        <VStack
          p={4}
          bg="blue.50"
          border="1px solid"
          borderColor="blue.200"
          borderRadius="md"
          align="stretch"
        >
          <Text color="blue.600" fontWeight="bold">
            레슨이 없습니다
          </Text>
          <Text color="blue.600">해당 사용자의 레슨 기록이 없습니다.</Text>
        </VStack>
      );
    }

    return (
      <>
        <Table.Root variant="line" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>상태</Table.ColumnHeader>
              <Table.ColumnHeader>날짜</Table.ColumnHeader>
              <Table.ColumnHeader>시간</Table.ColumnHeader>
              <Table.ColumnHeader>담당 선생님</Table.ColumnHeader>
              <Table.ColumnHeader>위치</Table.ColumnHeader>
              <Table.ColumnHeader>분류</Table.ColumnHeader>
              <Table.ColumnHeader>메모</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {lessons.map((lesson: UserLessonsResponse["data"][number]) => (
              <Table.Row key={lesson.id}>
                <Table.Cell>
                  <Checkbox.Root
                    key={`${lesson.id}-${getEditingValue(
                      lesson.id,
                      "isDone",
                      !!lesson.isDone
                    )}`}
                    checked={
                      getEditingValue(
                        lesson.id,
                        "isDone",
                        !!lesson.isDone
                      ) as boolean
                    }
                    onCheckedChange={(details: any) => {
                      console.log(
                        "Checkbox changed:",
                        lesson.id,
                        details.checked
                      );
                      handleLessonEdit(lesson.id, "isDone", !!details.checked);
                    }}
                  >
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                  </Checkbox.Root>
                </Table.Cell>
                <Table.Cell>{formatDate(lesson.dueDate)}</Table.Cell>
                <Table.Cell>{formatHour(lesson.dueHour)}</Table.Cell>
                <Table.Cell>
                  {lesson.teacher.major.symbol} {lesson.teacher.name}
                </Table.Cell>
                <Table.Cell>{lesson.location.name}</Table.Cell>
                <Table.Cell>
                  {lesson.isGrand ? "그랜드 레슨" : "일반 레슨"}
                </Table.Cell>
                <Table.Cell>
                  <Textarea
                    value={
                      getEditingValue(
                        lesson.id,
                        "note",
                        lesson.note || ""
                      ) as string
                    }
                    onChange={(e) =>
                      handleLessonEdit(lesson.id, "note", e.target.value)
                    }
                    placeholder="레슨 노트를 입력하세요"
                    size="sm"
                    minH="60px"
                    maxW="200px"
                    resize="vertical"
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </>
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="6xl" maxH="80vh">
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
              <VStack gap={4} align="stretch" maxH="60vh" overflow="auto">
                {renderDialogContent()}
              </VStack>

              <HStack
                justify="flex-end"
                pt={4}
                mt={4}
                borderTop="1px solid"
                borderColor="gray.200"
              >
                <Button
                  colorScheme="blue"
                  onClick={handleSave}
                  loading={isSaving}
                  disabled={isSaving}
                >
                  저장
                </Button>
              </HStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
