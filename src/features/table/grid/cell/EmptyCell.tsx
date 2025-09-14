import { Box, Text } from "@chakra-ui/react";
import Cell from "./Cell";

interface EmptyCellProps {
  showAddButton?: boolean;
  isLastRow?: boolean;
  isLastColumn?: boolean;
}

export default function EmptyCell({
  showAddButton = true,
  isLastRow = false,
  isLastColumn = false,
}: EmptyCellProps) {
  return (
    <Cell isLastRow={isLastRow} isLastColumn={isLastColumn}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
        width="100%"
        backgroundColor="gray.100"
      >
        <Text
          fontSize="2xl"
          color={showAddButton ? "gray.400" : "transparent"}
          fontWeight="lighter"
        >
          +
        </Text>
      </Box>
    </Cell>
  );
}
