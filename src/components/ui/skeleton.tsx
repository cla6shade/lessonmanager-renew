"use client";

import { Table, Skeleton } from "@chakra-ui/react";

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 10, columns = 7 }: SkeletonTableProps) {
  return (
    <Table.Root variant="outline" size="lg">
      <Table.Header>
        <Table.Row>
          {Array.from({ length: columns }).map((_, index) => (
            <Table.ColumnHeader
              key={index}
              width={
                index === columns - 1
                  ? "100px" // 마지막 컬럼(비고)
                  : index === 0
                  ? "50px" // 첫 번째 컬럼(체크박스)
                  : undefined
              }
              display={index === columns - 1 ? "flex" : undefined}
              justifyContent={index === columns - 1 ? "center" : undefined}
            >
              <Skeleton height="20px" width={index === 0 ? "20px" : "80px"} />
            </Table.ColumnHeader>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Table.Row key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Table.Cell
                key={colIndex}
                width={
                  colIndex === columns - 1
                    ? "100px" // 마지막 컬럼(비고)
                    : colIndex === 0
                    ? "50px" // 첫 번째 컬럼(체크박스)
                    : undefined
                }
                display={colIndex === columns - 1 ? "flex" : undefined}
                justifyContent={colIndex === columns - 1 ? "center" : undefined}
              >
                {colIndex === columns - 1 ? (
                  <Skeleton height="32px" width="240px" borderRadius="md" />
                ) : colIndex === 0 ? (
                  <Skeleton height="16px" width="16px" borderRadius="sm" />
                ) : (
                  <Skeleton height="20px" width={`${colIndex * 20}px`} />
                )}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
