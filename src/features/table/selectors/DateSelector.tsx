'use client';

import { Box, Flex, Text, IconButton, Popover, Portal } from '@chakra-ui/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { formatDate, getCurrentDatePeriod } from '@/utils/date';
import Calendar from './Calendar';
import { useTable } from '../providers/TableProvider';

export default function DateSelector() {
  const { datePeriod, setPeriodToPrevious, setPeriodToNext, setDatePeriod } = useTable();
  const [isOpen, setIsOpen] = useState(false);
  const handleDateSelect = (selectedDate: Date) => {
    const newPeriod = getCurrentDatePeriod(selectedDate);
    setDatePeriod(newPeriod);
    setIsOpen(false);
  };

  return (
    <Box bg="white" borderRadius="lg" border="1px" borderColor="gray.200" width="fit-content">
      <Flex align="center" gap={2}>
        <IconButton
          onClick={setPeriodToPrevious}
          aria-label="이전 주"
          variant="ghost"
          size="sm"
          rounded="full"
          _hover={{ bg: 'gray.100' }}
          display={{
            base: 'none',
            lg: 'flex',
          }}
        >
          <ChevronLeft size={16} />
        </IconButton>

        <Flex position="relative">
          <Popover.Root
            open={isOpen}
            onOpenChange={({ open }) => setIsOpen(open)}
            positioning={{ placement: 'bottom' }}
          >
            <Popover.Trigger>
              <Box
                border="1px solid"
                borderColor="gray.500"
                px={{
                  base: 4,
                  lg: 4,
                }}
                py={2}
                rounded="sm"
                cursor="pointer"
                _hover={{ bg: 'gray.50' }}
              >
                <Flex
                  align="center"
                  gap={1}
                  color="gray.900"
                  fontSize={{
                    base: 'xs',
                    lg: 'sm',
                  }}
                  fontWeight="medium"
                >
                  <Text>{formatDate(datePeriod.startDate)}</Text>
                  <Text>~</Text>
                  <Text marginRight={2}>{formatDate(datePeriod.endDate)}</Text>
                  <CalendarIcon size={16} />
                </Flex>
              </Box>
            </Popover.Trigger>
            <Portal>
              <Popover.Positioner>
                <Popover.Content width="auto" maxWidth="300px">
                  <Popover.Body p={4}>
                    <Calendar selectedPeriod={datePeriod} onDateSelect={handleDateSelect} />
                  </Popover.Body>
                </Popover.Content>
              </Popover.Positioner>
            </Portal>
          </Popover.Root>
        </Flex>

        <IconButton
          onClick={setPeriodToNext}
          aria-label="다음 주"
          variant="ghost"
          size="sm"
          rounded="full"
          _hover={{ bg: 'gray.100' }}
          display={{
            base: 'none',
            lg: 'flex',
          }}
        >
          <ChevronRight size={16} />
        </IconButton>
      </Flex>
    </Box>
  );
}
