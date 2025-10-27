import { formatDate, getDatesInPeriod } from '@/utils/date';
import { Box, Flex, Grid, Text, useDisclosure } from '@chakra-ui/react';
import { useTable } from '../providers/TableProvider';
import { useState } from 'react';
import BannedTimeEditDialog from '../dialog/ban/BannedTimeEditDialog';

export default function LessonGridDateHeader() {
  const { datePeriod } = useTable();
  const dates = getDatesInPeriod(datePeriod);
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onOpen();
  };

  return (
    <>
      <Grid templateColumns="88px repeat(7, 1fr)" gap={0} width="full" height="52px">
        <Box />
        {dates.map((date) => (
          <Flex
            alignItems="center"
            justifyContent="center"
            key={`date-key-${date.toISOString()}`}
            borderLeft="1px solid"
            borderBottom="1px solid"
            borderColor="gray.200"
            cursor="pointer"
            _hover={{
              bg: 'brand.50',
            }}
            onClick={() => handleDateClick(date)}
          >
            <Text>{formatDate(date, false, true)}</Text>
          </Flex>
        ))}
      </Grid>

      {selectedDate && (
        <BannedTimeEditDialog isOpen={isOpen} onClose={onClose} selectedDate={selectedDate} />
      )}
    </>
  );
}
