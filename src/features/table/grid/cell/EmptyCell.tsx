import { Box, Text } from '@chakra-ui/react';
import Cell from './Cell';
import { useState } from 'react';
import LessonReservationDialog from '@/features/table/dialog/lessons/reservation/LessonReservationDialog';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <Cell isLastRow={isLastRow} isLastColumn={isLastColumn}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
        width="100%"
        backgroundColor="gray.100"
        cursor={showAddButton ? 'pointer' : 'default'}
        _hover={{
          backgroundColor: showAddButton ? 'gray.200' : 'gray.100',
        }}
        onClick={() => {
          showAddButton && setIsDialogOpen(true);
        }}
      >
        <Text
          fontSize="2xl"
          color={showAddButton ? 'gray.400' : 'transparent'}
          fontWeight="lighter"
        >
          +
        </Text>
      </Box>

      {isDialogOpen && (
        <LessonReservationDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
      )}
    </Cell>
  );
}
