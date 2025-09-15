"use client";

import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";
import { CellType, getCellColor } from "./utils";
import { getCellBorderColor } from "./utils";

interface BannedTimeCellProps {
  isDefaultBanned: boolean;
  onClick?: () => void;
  children: ReactNode;
  cellType: CellType;
}

export default function BannedTimeCell({
  isDefaultBanned,
  onClick,
  children,
  cellType,
}: BannedTimeCellProps) {
  return (
    <Box
      as="td"
      p={1}
      textAlign="center"
      bg={getCellColor(cellType)}
      border="1px solid"
      borderColor={getCellBorderColor(cellType)}
      cursor={cellType === "not-working-hour" ? "not-allowed" : "pointer"}
      onClick={cellType === "not-working-hour" ? undefined : onClick}
      _hover={cellType === "available" ? { opacity: 0.8 } : {}}
      transition="all 0.2s"
      w="80px"
    >
      {children}
    </Box>
  );
}
