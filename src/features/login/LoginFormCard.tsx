"use client";

import { Box } from "@chakra-ui/react";
import { ReactNode } from 'react';

interface LoginFormCardProps {
  children?: ReactNode;
}

export default function LoginFormCard({ children }: LoginFormCardProps) {
  return (
    <Box
      w={{ base: "full", lg: "700px" }}
      h={{ base: "full", lg: "600px" }}
      py={0}
      gap={0}
      display="flex"
      bg="primary"
      borderRadius={{ base: "none", lg: "xl" }}
      border={{ base: "none" }}
      boxShadow={{ base: "none", lg: "sm" }}
      flexDirection="row"
    >
      {children}
    </Box>
  );
}
