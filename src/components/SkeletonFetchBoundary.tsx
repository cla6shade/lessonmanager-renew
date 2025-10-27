import { Box } from '@chakra-ui/react';
import { SkeletonTable } from './ui/skeleton';
import FetchBoundary from './FetchBoundary';
import { ReactNode } from 'react';

interface SkeletonFetchBoundaryProps {
  children: ReactNode;
  isLoading: boolean;
  error: string | null;
  isEmpty?: boolean;
  rows?: number;
  columns?: number;
  errorFallback?: ReactNode;
  emptyFallback?: ReactNode;
  useFlexHeight?: boolean;
}

export default function SkeletonFetchBoundary({
  children,
  isLoading,
  error,
  isEmpty = false,
  rows = 10,
  columns = 7,
  errorFallback,
  emptyFallback,
  useFlexHeight = false,
}: SkeletonFetchBoundaryProps) {
  const skeletonFallback = (
    <Box
      width="100%"
      height={useFlexHeight ? '0' : '400px'}
      flexGrow={useFlexHeight ? 1 : undefined}
      overflow="auto"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
    >
      <SkeletonTable rows={rows} columns={columns} />
    </Box>
  );

  return (
    <FetchBoundary
      isLoading={isLoading}
      error={error}
      isEmpty={isEmpty}
      loadingFallback={skeletonFallback}
      errorFallback={errorFallback}
      emptyFallback={emptyFallback}
    >
      {children}
    </FetchBoundary>
  );
}
