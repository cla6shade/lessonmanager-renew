import {
  Text,
  VStack,
  HStack,
  Table,
  Spinner,
  Textarea,
  Button,
} from "@chakra-ui/react";
import { Checkbox } from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useState, useCallback } from "react";

import Pagination from "@/components/ui/pagination";
import { useFetchUserLessons } from "@/features/dialog/useFetchUserLessons";
import { useUpdateLessons } from "@/features/dialog/useUpdateLessons";
import { formatDate, formatHour } from "@/utils/date";
import { UpdateLessonsRequest } from "@/app/(lessons)/api/lessons/schema";

// TODO: Next.js Server Action으로 리팩토링

interface UserLessonsTableProps {
  userId: number;
}

export default function UserLessonsTable({ userId }: UserLessonsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const { lessons, totalPages, totalItems, loading, error } =
    useFetchUserLessons({
      userId,
      page: currentPage,
      limit: itemsPerPage,
      enabled: true,
    });

  const { updateLessons, isSaving } = useUpdateLessons();

  const { control, handleSubmit } = useForm<UpdateLessonsRequest>({
    defaultValues: {
      lessons: [],
    },
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onSubmit = useCallback(
    async (data: UpdateLessonsRequest) => {
      await updateLessons(data);
    },
    [updateLessons]
  );
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
    <VStack gap={4} align="stretch">
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={4} align="stretch">
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
              {lessons.map((lesson, index) => (
                <Table.Row key={lesson.id}>
                  <Table.Cell>
                    <Controller
                      control={control}
                      name={`lessons.${index}.isDone`}
                      defaultValue={lesson.isDone || false}
                      render={({ field: { onChange, value } }) => (
                        <Checkbox.Root
                          checked={value}
                          onCheckedChange={(details) =>
                            onChange(!!details.checked)
                          }
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox.Root>
                      )}
                    />
                    <input
                      type="hidden"
                      {...control.register(`lessons.${index}.id`)}
                      value={lesson.id}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    {formatDate(new Date(lesson.dueDate))}
                  </Table.Cell>
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
                      {...control.register(`lessons.${index}.note`)}
                      defaultValue={lesson.note || ""}
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

          <HStack
            justify="flex-end"
            pt={4}
            borderTop="1px solid"
            borderColor="gray.200"
          >
            <Button
              type="submit"
              colorScheme="blue"
              loading={isSaving}
              disabled={isSaving}
            >
              저장
            </Button>
          </HStack>
        </VStack>
      </form>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </VStack>
  );
}
