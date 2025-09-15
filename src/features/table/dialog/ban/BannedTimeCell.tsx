"use client";

import { Box } from "@chakra-ui/react";
import { getTeacherWorkingHours } from "../../grid/utils";
import { ExtendedTeacher } from "../../types";
import { ReactNode } from "react";

interface BannedTimeCellProps {
  teacher: ExtendedTeacher;
  hour: number;
  dayOfWeek: string;
  selectedDate: Date;
  bannedTimes: any[];
  onClick?: () => void;
  children: ReactNode;
}

export default function BannedTimeCell({
  teacher,
  hour,
  dayOfWeek,
  selectedDate,
  bannedTimes,
  onClick,
  children,
}: BannedTimeCellProps) {
  const teacherWorkingHours = getTeacherWorkingHours(teacher, dayOfWeek);
  const isWorkingHour = teacherWorkingHours.includes(hour);
  const isBanned = bannedTimes.some(
    (bannedTime) =>
      bannedTime.teacherId === teacher.id &&
      new Date(bannedTime.date).toDateString() ===
        selectedDate.toDateString() &&
      bannedTime.hour === hour
  );

  const getCellColor = () => {
    if (!isWorkingHour) {
      return "gray.100";
    }
    if (isBanned) {
      return "red.200";
    }
    return "green.100";
  };

  const getCellBorderColor = () => {
    if (!isWorkingHour) {
      return "gray.300";
    }
    if (isBanned) {
      return "red.400";
    }
    return "green.300";
  };

  return (
    <Box
      as="td"
      p={1}
      textAlign="center"
      bg={getCellColor()}
      border="1px solid"
      borderColor={getCellBorderColor()}
      cursor={isWorkingHour ? "pointer" : "not-allowed"}
      onClick={isWorkingHour ? onClick : undefined}
      _hover={isWorkingHour ? { opacity: 0.8 } : {}}
      transition="all 0.2s"
      w="80px"
    >
      {children}
    </Box>
  );
}
