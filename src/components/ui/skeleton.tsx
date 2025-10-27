'use client';

import { Table, Skeleton } from '@chakra-ui/react';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 10, columns = 7 }: SkeletonTableProps) {
  const getColumnWidth = (index: number) => {
    if (index === 0) return '50px';
    if (index === columns - 1) return '80px';
    return undefined;
  };

  const getColumnStyles = (index: number) => {
    const isLastColumn = index === columns - 1;
    return {
      width: getColumnWidth(index),
      display: isLastColumn ? ('flex' as const) : undefined,
      justifyContent: isLastColumn ? ('center' as const) : undefined,
    };
  };

  const getSkeletonProps = (colIndex: number) => {
    if (colIndex === columns - 1) {
      return { height: '32px', width: '100%', borderRadius: 'md' };
    }
    if (colIndex === 0) {
      return { height: '16px', width: '16px', borderRadius: 'sm' };
    }
    return { height: '20px', width: '100%' };
  };

  return (
    <Table.Root variant="outline" size="lg">
      <Table.Header>
        <Table.Row>
          {Array.from({ length: columns }).map((_, index) => (
            <Table.ColumnHeader key={index} {...getColumnStyles(index)}>
              <Skeleton height="20px" width="100%" />
            </Table.ColumnHeader>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Table.Row key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Table.Cell key={colIndex} {...getColumnStyles(colIndex)}>
                <Skeleton {...getSkeletonProps(colIndex)} />
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
