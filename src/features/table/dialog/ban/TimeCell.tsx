"use client";

import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

interface TimeCellProps {
  children: ReactNode;
}

export default function TimeCell({ children }: TimeCellProps) {
  return (
    <Box
      as="td"
      p={2}
      bg="gray.50"
      border="1px solid"
      borderColor="gray.200"
      fontSize="sm"
      textAlign="center"
      w="60px"
      minW="60px"
      maxW="60px"
    >
      {children}
    </Box>
  );
}
