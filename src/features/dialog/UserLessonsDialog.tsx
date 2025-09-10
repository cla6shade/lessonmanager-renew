import {
  Text,
  VStack,
  HStack,
  Separator,
  Dialog,
  Portal,
  Table,
  Spinner,
  Button,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

import Pagination from "@/components/ui/pagination";
import StatusBadge from "@/components/ui/StatusBadge";
import { UserLessonsResponse } from "@/app/api/admin/users/[id]/lessons/schema";
import { useFetchUserLessons } from "@/hooks/useFetchUserLessons";

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

  const { lessons, totalPages, totalItems, loading, error } =
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
    }
  }, [isOpen]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
                {loading && (
                  <HStack justify="center" h="256px">
                    <Spinner size="lg" />
                    <Text>레슨 목록을 불러오는 중...</Text>
                  </HStack>
                )}

                {error && (
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
                )}

                {!loading && !error && lessons.length === 0 && (
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
                    <Text color="blue.600">
                      해당 사용자의 레슨 기록이 없습니다.
                    </Text>
                  </VStack>
                )}

                {!loading && !error && lessons.length > 0 && (
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
                        {lessons.map(
                          (lesson: UserLessonsResponse["data"][number]) => (
                            <Table.Row key={lesson.id}>
                              <Table.Cell>
                                <StatusBadge isDone={!!lesson.isDone} />
                              </Table.Cell>
                              <Table.Cell>
                                {formatDate(lesson.dueDate)}
                              </Table.Cell>
                              <Table.Cell>
                                {formatHour(lesson.dueHour)}
                              </Table.Cell>
                              <Table.Cell>
                                {lesson.teacher.major.symbol}{" "}
                                {lesson.teacher.name}
                              </Table.Cell>
                              <Table.Cell>{lesson.location.name}</Table.Cell>
                              <Table.Cell>
                                {lesson.isGrand ? "그랜드 레슨" : "일반 레슨"}
                              </Table.Cell>
                              <Table.Cell>
                                <Text
                                  fontSize="sm"
                                  maxW="200px"
                                  truncate
                                  title={lesson.note || ""}
                                >
                                  {lesson.note || "(없음)"}
                                </Text>
                              </Table.Cell>
                            </Table.Row>
                          )
                        )}
                      </Table.Body>
                    </Table.Root>

                    <Separator />

                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      itemsPerPage={itemsPerPage}
                      onPageChange={handlePageChange}
                    />
                  </>
                )}
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
