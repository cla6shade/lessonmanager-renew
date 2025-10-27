'use client';

import { Box, Flex, Button, IconButton } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isSameDate } from '@/utils/date';
import { useTable } from '../providers/TableProvider';

export default function MobileDateSelector() {
  const { datePeriod, selectedDate, setSelectedDate, setPeriodToPrevious, setPeriodToNext } =
    useTable();

  const weekDays = [];
  const startDate = new Date(datePeriod.startDate);

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    weekDays.push(currentDate);
  }

  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <Box px={4} py={3} bg="white" borderBottom="1px" borderColor="gray.200">
      <Flex align="center" justify="space-between">
        <IconButton
          onClick={setPeriodToPrevious}
          variant="ghost"
          size="sm"
          rounded="full"
          _hover={{ bg: 'gray.100' }}
          aria-label="이전 주"
        >
          <ChevronLeft size={16} />
        </IconButton>

        <Flex justify="space-between" gap={1} flex={1}>
          {weekDays.map((date, index) => {
            const isSelected = isSameDate(date, selectedDate);
            const isToday = isSameDate(date, new Date());

            return (
              <Button
                key={index}
                variant={isSelected ? 'solid' : 'ghost'}
                size="sm"
                onClick={() => handleDateSelect(date)}
                bg={isSelected ? 'gray.800' : 'transparent'}
                color={isSelected ? 'white' : 'gray.900'}
                _hover={{
                  bg: isSelected ? 'gray.700' : 'gray.100',
                }}
                borderRadius="md"
                minW="0"
                px={2}
                py={3}
                flexDirection="column"
                height="auto"
              >
                <Box fontSize="sm" mb={1}>
                  {dayNames[index]}
                </Box>
                <Box
                  fontSize="sm"
                  fontWeight={isToday ? 'bold' : 'medium'}
                  color={isToday && !isSelected ? 'brand.500' : undefined}
                >
                  {date.getDate()}
                </Box>
              </Button>
            );
          })}
        </Flex>

        <IconButton
          onClick={setPeriodToNext}
          variant="ghost"
          size="sm"
          rounded="full"
          _hover={{ bg: 'gray.100' }}
          aria-label="다음 주"
        >
          <ChevronRight size={16} />
        </IconButton>
      </Flex>
    </Box>
  );
}
