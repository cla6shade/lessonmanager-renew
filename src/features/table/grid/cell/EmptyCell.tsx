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
        {showAddButton && (
          <Text fontSize="2xl" color="gray.400" fontWeight="lighter">
            +
          </Text>
        )}
      </Box>
    </Cell>
  );
}
