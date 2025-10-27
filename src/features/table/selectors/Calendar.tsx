'use client';

import { Flex, Text, IconButton, Grid, Button } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CalendarProps {
  selectedPeriod: {
    startDate: Date;
    endDate: Date;
  };
  onDateSelect: (date: Date) => void;
}

export default function Calendar({ selectedPeriod, onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedPeriod.startDate));

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);

    startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7));

    const days = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - ((lastDay.getDay() + 6) % 7)));

    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div>
      <Flex justify="space-between" align="center" mb={4}>
        <IconButton onClick={handlePreviousMonth} variant="ghost" size="sm" aria-label="이전 월">
          <ChevronLeft size={16} />
        </IconButton>

        <Text fontSize="md" fontWeight="bold">
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </Text>

        <IconButton onClick={handleNextMonth} variant="ghost" size="sm" aria-label="다음 월">
          <ChevronRight size={16} />
        </IconButton>
      </Flex>

      <Grid templateColumns="repeat(7, 1fr)" gap={1}>
        {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
          <Text
            key={day}
            textAlign="center"
            fontSize="xs"
            fontWeight="bold"
            color="gray.500"
            py={2}
          >
            {day}
          </Text>
        ))}

        {calendarDays.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isInSelectedWeek = day >= selectedPeriod.startDate && day <= selectedPeriod.endDate;

          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              height="8"
              width="8"
              fontSize="xs"
              onClick={() => onDateSelect(day)}
              bg={isInSelectedWeek ? 'brand.100' : 'transparent'}
              color={isCurrentMonth ? 'black' : 'gray.400'}
              _hover={{
                bg: isInSelectedWeek ? 'bra d.200' : 'gray.100',
              }}
            >
              {day.getDate()}
            </Button>
          );
        })}
      </Grid>
    </div>
  );
}
