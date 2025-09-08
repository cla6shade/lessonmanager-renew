import { ReactNode } from "react";
import { Box } from "@chakra-ui/react";

interface CellProps {
  children: ReactNode;
  isLastRow?: boolean;
  isLastColumn?: boolean;
}

export default function Cell({
  children,
  isLastRow = false,
  isLastColumn = false,
}: CellProps) {
  return (
    <Box
      borderBottom="1px solid"
      borderBottomColor={!isLastRow ? "gray.200" : "transparent"}
      borderRight="1px solid"
      borderRightColor={!isLastColumn ? "gray.200" : "transparent"}
      height="100%"
      width="100%"
    >
      {children}
    </Box>
  );
}
