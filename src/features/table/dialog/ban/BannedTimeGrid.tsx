"use client";

import { Box } from "@chakra-ui/react";
import { BannedTimeGrid as BannedTimeGridType } from "./utils";
import { ExtendedTeacher } from "../../types";
import BannedTimeCell from "./BannedTimeCell";
import TimeHeaderCell from "./TimeHeaderCell";
import TeacherHeaderCell from "./TeacherHeaderCell";
import { getTimesInPeriod } from "@/utils/date";
import { useTable } from "../../grid/providers/TableProvider";

interface BannedTimeGridProps {
  timeGrid: BannedTimeGridType;
  workingTeachers: ExtendedTeacher[];
  onCellClick: (teacherId: number, hour: number) => void;
}

export default function BannedTimeGrid({
  timeGrid,
  workingTeachers,
  onCellClick,
}: BannedTimeGridProps) {
  const { openHours } = useTable();
  const allHours = getTimesInPeriod(openHours);
  return (
    <Box as="table" width="100%" borderCollapse="collapse">
      <Box as="thead">
        <Box as="tr">
          <TimeHeaderCell>시간</TimeHeaderCell>
          {Object.keys(timeGrid).map((teacherId) => {
            const teacher = workingTeachers.find(
              (t) => t.id === Number(teacherId)
            );
            if (!teacher) return null;
            return (
              <TeacherHeaderCell key={`header-${teacherId}`}>
                {teacher.major.symbol} {teacher.name}
              </TeacherHeaderCell>
            );
          })}
        </Box>
      </Box>
      <Box as="tbody">
        {allHours.map((hour) => (
          <Box as="tr" key={hour}>
            <TimeHeaderCell>{hour}:00</TimeHeaderCell>
            {Object.keys(timeGrid).map((teacherId: string) => {
              return (
                <BannedTimeCell
                  key={`${teacherId}-${hour}`}
                  cellType={timeGrid[teacherId][hour]}
                  onClick={() => onCellClick(Number(teacherId), Number(hour))}
                />
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
