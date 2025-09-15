"use client";

import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

interface TeacherHeaderCellProps {
  children: ReactNode;
}

export default function TeacherHeaderCell({
  children,
}: TeacherHeaderCellProps) {
  return (
    <Box
      as="th"
      p={2}
      bg="gray.50"
      border="1px solid"
      borderColor="gray.200"
      fontSize="sm"
      maxW="80px"
      overflow="hidden"
      textOverflow="ellipsis"
      whiteSpace="nowrap"
    >
      {children}
    </Box>
  );
}
