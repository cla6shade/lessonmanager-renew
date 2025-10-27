'use client';

import { Box, Text } from '@chakra-ui/react';
import { GetWorkingTimesResponse, WorkingTimeData } from '@/app/(table)/api/working-times/schema';
import { useState, useEffect } from 'react';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'] as const;
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

interface WorkingTimeTableProps {
  workingTimes: GetWorkingTimesResponse['data']['times'];
  selectedTeacher: GetWorkingTimesResponse['data']['times'][number]['teacher'] | null;
  openHours: GetWorkingTimesResponse['data']['openHours'];
  onWorkingTimeChange?: (workingTime: WorkingTimeData) => void;
}

export default function WorkingTimeTable({
  workingTimes,
  selectedTeacher,
  openHours,
  onWorkingTimeChange,
}: WorkingTimeTableProps) {
  const selectedWorkingTime = selectedTeacher
    ? workingTimes.find((wt) => wt.teacherId === selectedTeacher.id)
    : null;

  const [editableWorkingTime, setEditableWorkingTime] = useState<WorkingTimeData | null>(null);

  useEffect(() => {
    if (selectedWorkingTime) {
      setEditableWorkingTime(selectedWorkingTime.times);
    } else {
      setEditableWorkingTime(null);
    }
  }, [selectedWorkingTime]);

  const allHours = Array.from(
    { length: openHours.endHour - openHours.startHour + 1 },
    (_, i) => i + openHours.startHour,
  );

  // 셀 클릭 핸들러
  const handleCellClick = (dayKey: string, hour: number) => {
    if (!editableWorkingTime || !selectedTeacher) return;

    const newWorkingTime = { ...editableWorkingTime };
    const dayHours = [...newWorkingTime[dayKey as keyof WorkingTimeData]];

    const hourIndex = dayHours.indexOf(hour);
    if (hourIndex > -1) {
      dayHours.splice(hourIndex, 1);
    } else {
      dayHours.push(hour);
      dayHours.sort((a, b) => a - b);
    }

    newWorkingTime[dayKey as keyof WorkingTimeData] = dayHours;
    setEditableWorkingTime(newWorkingTime);

    if (onWorkingTimeChange) {
      onWorkingTimeChange(newWorkingTime);
    }
  };

  return (
    <Box
      as="table"
      width="100%"
      borderCollapse="collapse"
      border="1px solid"
      borderColor="gray.200"
      marginTop={1}
    >
      <Box as="thead">
        <Box as="tr" bg="gray.50">
          <Box
            as="th"
            p={3}
            border="1px solid"
            borderColor="gray.200"
            fontWeight="bold"
            textAlign="center"
          >
            시간
          </Box>
          {DAYS.map((day) => (
            <Box
              key={day}
              as="th"
              p={3}
              border="1px solid"
              borderColor="gray.200"
              fontWeight="bold"
              textAlign="center"
            >
              {day}요일
            </Box>
          ))}
        </Box>
      </Box>
      <Box as="tbody">
        {allHours.map((hour) => (
          <Box as="tr" key={hour}>
            <Box
              as="td"
              p={2}
              border="1px solid"
              borderColor="gray.200"
              fontWeight="medium"
              textAlign="center"
              bg="gray.50"
            >
              {hour}:00
            </Box>
            {DAY_KEYS.map((dayKey) => {
              const isWorkingHour = editableWorkingTime
                ? editableWorkingTime[dayKey].includes(hour)
                : false;

              return (
                <Box
                  key={dayKey}
                  as="td"
                  p={2}
                  border="1px solid"
                  borderColor="gray.200"
                  textAlign="center"
                  fontSize="sm"
                  bg={isWorkingHour ? 'blue.100' : 'white'}
                  cursor={selectedTeacher ? 'pointer' : 'default'}
                  _hover={selectedTeacher ? { bg: isWorkingHour ? 'blue.200' : 'gray.50' } : {}}
                  onClick={() => selectedTeacher && handleCellClick(dayKey, hour)}
                >
                  {isWorkingHour ? (
                    <Box width="100%" height="20px" bg="brand.500" borderRadius="sm" />
                  ) : null}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
