import {
  HStack,
  Text,
  IconButton,
  Pagination as ChakraPagination,
  ButtonGroup,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return (
      <HStack justify="center" w="full">
        <Text fontSize="sm" color="gray.600">
          총 {totalItems}개 항목
        </Text>
      </HStack>
    );
  }

  return (
    <HStack justify="space-between" w="full">
      <Text fontSize="sm" color="gray.600">
        {startItem}-{endItem} / 총 {totalItems}개 항목
      </Text>

      <ChakraPagination.Root
        count={totalItems}
        pageSize={itemsPerPage}
        page={currentPage}
        onPageChange={(e) => onPageChange(e.page)}
      >
        <ButtonGroup variant="ghost" size="sm">
          <ChakraPagination.PrevTrigger asChild>
            <IconButton aria-label="이전 페이지">
              <ChevronLeftIcon />
            </IconButton>
          </ChakraPagination.PrevTrigger>

          <ChakraPagination.Items
            render={(page) => (
              <IconButton
                variant={{ base: 'ghost', _selected: 'outline' }}
                aria-label={`페이지 ${page.value}`}
              >
                {page.value}
              </IconButton>
            )}
          />

          <ChakraPagination.NextTrigger asChild>
            <IconButton aria-label="다음 페이지">
              <ChevronRightIcon />
            </IconButton>
          </ChakraPagination.NextTrigger>
        </ButtonGroup>
      </ChakraPagination.Root>
    </HStack>
  );
}
