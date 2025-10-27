import { Text, VStack, HStack, Spinner, Button } from '@chakra-ui/react';
import { useState } from 'react';

import Pagination from '@/components/ui/pagination';
import { useFetchUserLessons } from '@/features/users/lessons/useFetchUserLessons';
import UserLessonsForm from './UserLessonsForm';

interface UserLessonsTableProps {
  userId: number;
}

export default function UserLessonsTable({ userId }: UserLessonsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const { lessons, totalPages, totalItems, loading, error } = useFetchUserLessons({
    userId,
    page: currentPage,
    limit: itemsPerPage,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <HStack justify="center" h="360px">
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
      <UserLessonsForm key={currentPage} lessons={lessons} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />

      <HStack justify="flex-end">
        <Button type="submit" form="lessons-form" colorScheme="blue" loadingText="저장 중...">
          저장
        </Button>
      </HStack>
    </VStack>
  );
}
