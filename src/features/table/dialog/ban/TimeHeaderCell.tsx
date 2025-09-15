"use client";

import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

interface TimeHeaderCellProps {
  children: ReactNode;
}

export default function TimeHeaderCell({ children }: TimeHeaderCellProps) {
  return (
    <Box
      as="th"
      p={2}
      bg="gray.50"
      border="1px solid"
      borderColor="gray.200"
      fontSize="sm"
      w="60px"
      minW="60px"
      maxW="60px"
    >
      {children}
    </Box>
  );
}
