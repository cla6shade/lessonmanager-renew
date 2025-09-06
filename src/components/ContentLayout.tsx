"use client";

import useMenu from "@/features/navigation/menu/useMenu";
import { Box, Heading } from "@chakra-ui/react";

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentMenu } = useMenu();
  return (
    <Box
      py={{
        base: "60px",
        lg: "40px",
      }}
      px={{
        base: "20px",
        lg: "40px",
      }}
    >
      <Heading fontSize={{ base: "20px", lg: "28px" }}>
        {currentMenu?.name}
      </Heading>
      {children}
    </Box>
  );
}
