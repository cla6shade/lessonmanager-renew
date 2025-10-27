import { Box, Text, Spinner } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface FetchBoundaryProps {
  children: ReactNode;
  isLoading: boolean;
  error: string | null;
  isEmpty?: boolean;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
  emptyFallback?: ReactNode;
}

export default function FetchBoundary({
  children,
  isLoading,
  error,
  isEmpty = false,
  loadingFallback,
  errorFallback,
  emptyFallback,
}: FetchBoundaryProps) {
  if (isLoading) {
    return loadingFallback || <DefaultLoadingFallback />;
  }
  if (error) {
    return errorFallback || <DefaultErrorFallback error={error} />;
  }
  if (isEmpty) {
    return emptyFallback || <DefaultEmptyFallback />;
  }
  return children;
}

interface DefaultFetchBoundaryProps {
  children: ReactNode;
  isLoading: boolean;
  error: string | null;
  isEmpty?: boolean;
}

export function DefaultFetchBoundary({
  children,
  isLoading,
  error,
  isEmpty = false,
}: DefaultFetchBoundaryProps) {
  return (
    <FetchBoundary isLoading={isLoading} error={error} isEmpty={isEmpty}>
      {children}
    </FetchBoundary>
  );
}

function DefaultLoadingFallback() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
      width="100%"
      gap="16px"
    >
      <Spinner size="lg" color="brand.500" />
      <Text color="gray.600" fontSize="sm" fontWeight="medium">
        데이터를 불러오는 중입니다
      </Text>
    </Box>
  );
}

function DefaultErrorFallback({ error }: { error: string }) {
  return (
    <Box p={4} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
      <Text color="red.600" fontSize="md" fontWeight="semibold" mb={2}>
        오류가 발생했습니다
      </Text>
      <Text color="red.500" fontSize="sm">
        {error}
      </Text>
    </Box>
  );
}

function DefaultEmptyFallback() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
      width="100%"
      gap="8px"
    >
      <Text color="gray.500" fontSize="lg" fontWeight="medium">
        데이터가 없습니다
      </Text>
      <Text color="gray.400" fontSize="sm">
        표시할 내용이 없습니다
      </Text>
    </Box>
  );
}
