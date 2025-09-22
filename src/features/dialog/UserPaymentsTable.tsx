import { Text, VStack, HStack, Spinner } from "@chakra-ui/react";
import Pagination from "@/components/ui/pagination";
import UserPaymentsForm from "./UserPaymentsForm";
import { Payment } from "@/generated/prisma";

interface UserPaymentsTableProps {
  payments: Payment[];
  totalPages: number;
  totalItems: number;
  loading: boolean;
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  refetch: () => void;
}

export default function UserPaymentsTable({
  payments,
  totalPages,
  totalItems,
  loading,
  error,
  currentPage,
  itemsPerPage,
  onPageChange,
  refetch,
}: UserPaymentsTableProps) {
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
      <UserPaymentsForm payments={payments} refetch={refetch} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      />
    </VStack>
  );
}
