"use client";

import { Table, Box, Flex, Button, HStack } from "@chakra-ui/react";
import { useState } from "react";
import { formatDate } from "@/utils/date";
import SkeletonFetchBoundary from "@/components/SkeletonFetchBoundary";
import Pagination from "@/components/ui/pagination";
import { TeacherSearchResult } from "@/app/(teachers)/api/teachers/schema";
import { useTeacherManagement } from "../TeacherManagmentProvider";
import TeacherDetailDialog from "../details/TeacherDetailDialog";

export default function TeacherTable() {
  const {
    page,
    setPage,
    teachers,
    total,
    totalPages,
    isTeacherLoading,
    refetchTeachers,
  } = useTeacherManagement();

  const [selectedTeacher, setSelectedTeacher] =
    useState<TeacherSearchResult | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const openDetailDialog = (teacher: TeacherSearchResult) => {
    setSelectedTeacher(teacher);
    setIsDetailDialogOpen(true);
  };

  const closeDetailDialog = () => {
    setSelectedTeacher(null);
    setIsDetailDialogOpen(false);
  };

  return (
    <Flex direction="column" flexGrow={1} height="100%">
      <SkeletonFetchBoundary
        isLoading={isTeacherLoading}
        error={null}
        isEmpty={teachers.length === 0}
        rows={15}
        columns={9}
        useFlexHeight={true}
      >
        <Box
          width="100%"
          height="0"
          flexGrow={1}
          overflow="auto"
          border="1px solid"
          borderColor="border"
          borderRadius="md"
        >
          <Table.Root variant="outline" size="lg">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>ID</Table.ColumnHeader>
                <Table.ColumnHeader>이름</Table.ColumnHeader>
                <Table.ColumnHeader>지점</Table.ColumnHeader>
                <Table.ColumnHeader>전공</Table.ColumnHeader>
                <Table.ColumnHeader>생년월일</Table.ColumnHeader>
                <Table.ColumnHeader>휴대폰 번호</Table.ColumnHeader>
                <Table.ColumnHeader>재등록률</Table.ColumnHeader>
                <Table.ColumnHeader>레슨 완료율</Table.ColumnHeader>
                <Table.ColumnHeader
                  width="100px"
                  display="flex"
                  justifyContent="center"
                >
                  비고
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {teachers.map((teacher) => (
                <Table.Row key={teacher.id}>
                  <Table.Cell>{teacher.id}</Table.Cell>
                  <Table.Cell>{teacher.name}</Table.Cell>
                  <Table.Cell>{teacher.location.name}</Table.Cell>
                  <Table.Cell>{teacher.major.name}</Table.Cell>
                  <Table.Cell>
                    {teacher.birth ? formatDate(new Date(teacher.birth)) : "-"}
                  </Table.Cell>
                  <Table.Cell>{teacher.contact || "-"}</Table.Cell>
                  <Table.Cell>
                    {teacher.reregisterFraction[1] > 0
                      ? `${Math.round(
                          (teacher.reregisterFraction[0] /
                            teacher.reregisterFraction[1]) *
                            100
                        )}% (${teacher.reregisterFraction[0]} / ${
                          teacher.reregisterFraction[1]
                        })`
                      : "-"}
                  </Table.Cell>
                  <Table.Cell>
                    {teacher.lessonCompletionFraction[1] > 0
                      ? `${Math.round(
                          (teacher.lessonCompletionFraction[0] /
                            teacher.lessonCompletionFraction[1]) *
                            100
                        )}% (${teacher.lessonCompletionFraction[0]} / ${
                          teacher.lessonCompletionFraction[1]
                        })`
                      : "-"}
                  </Table.Cell>
                  <Table.Cell
                    width="100px"
                    display="flex"
                    justifyContent="center"
                  >
                    <HStack gap={2}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetailDialog(teacher)}
                      >
                        상세 보기
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
              {teachers.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={9} textAlign="center" py={8}>
                    등록된 선생님이 없습니다.
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      </SkeletonFetchBoundary>

      <Box mt={4} px={4}>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={20}
          onPageChange={setPage}
        />
      </Box>

      {selectedTeacher && (
        <TeacherDetailDialog
          teacher={selectedTeacher}
          onTeacherUpdate={(teacher: TeacherSearchResult) => {
            setSelectedTeacher(teacher);
          }}
          isOpen={isDetailDialogOpen}
          onClose={closeDetailDialog}
          refetchTeachers={refetchTeachers}
        />
      )}
    </Flex>
  );
}
