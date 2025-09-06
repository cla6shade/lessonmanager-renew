"use client";

import { Box } from "@chakra-ui/react";

interface LoginFormCardProps {
  children?: React.ReactNode;
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
