import { Text, VStack, HStack, Spinner, Button } from "@chakra-ui/react";
import { useState } from "react";

import Pagination from "@/components/ui/pagination";
import { useFetchUserPayments } from "./useFetchUserPayments";
import UserPaymentsForm from "./UserPaymentsForm";

interface UserPaymentsTableProps {
  userId: number;
}

export default function UserPaymentsTable({ userId }: UserPaymentsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const { payments, totalPages, totalItems, loading, error } =
    useFetchUserPayments({
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
        <Text>결제 내역을 불러오는 중...</Text>
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

  if (payments.length === 0) {
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
          결제 내역이 없습니다
        </Text>
        <Text color="blue.600">해당 사용자의 결제 기록이 없습니다.</Text>
      </VStack>
    );
  }

  return (
    <VStack gap={4} align="stretch">
      <UserPaymentsForm key={currentPage} payments={payments} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />

      <HStack justify="flex-end">
        <Button type="submit" form="payments-form" colorScheme="blue">
          저장
        </Button>
      </HStack>
    </VStack>
  );
}
