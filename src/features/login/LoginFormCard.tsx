"use client";

import { Box } from "@chakra-ui/react";

interface LoginFormCardProps {
  children?: React.ReactNode;
}

export default function LoginFormCard({ children }: LoginFormCardProps) {
  return (
    <Box
      w={{ base: "full", md: "700px" }}
      h={{ base: "full", md: "600px" }}
      py={0}
      gap={0}
      display="flex"
      bg="primary"
      borderRadius={{ base: "none", md: "xl" }}
      border={{ base: "none" }}
      boxShadow={{ base: "none", md: "sm" }}
      flexDirection="row"
    >
      {children}
    </Box>
  );
}
