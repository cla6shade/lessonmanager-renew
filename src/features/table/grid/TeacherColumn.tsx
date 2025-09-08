import { Lesson } from "@/generated/prisma";
import { ExtendedTeacher } from "../types";
import { getWorkingDayOfWeek } from "@/utils/date";
import { Grid } from "@chakra-ui/react";
import LessonCell from "./cell/LessonCell";
import EmptyCell from "./cell/EmptyCell";
import { getTeacherWorkingHours } from "./utils";

interface TeacherColumnProps {
  teacher: ExtendedTeacher;
  date: Date;
  lessons: Lesson[];
  allTimes: number[];
  teacherIndex: number;
  totalTeachers: number;
}

export default function TeacherColumn({
  teacher,
  date,
  lessons,
  allTimes,
  teacherIndex,
  totalTeachers,
}: TeacherColumnProps) {
  const dayOfWeek = getWorkingDayOfWeek(date);
  const teacherWorkingHours = getTeacherWorkingHours(teacher, dayOfWeek);

  return (
    <Grid templateRows={`repeat(${allTimes.length}, 1fr)`} w="full" h="full">
      {allTimes.map((hour, hourIndex) => {
        const isWorkingHour = teacherWorkingHours.includes(hour);
        const hourLessons = lessons.filter((lesson) => lesson.dueHour === hour);

        const cellKey = `${teacher.id}-${date.toDateString()}-${hour}`;
        const isLastRow = hourIndex === allTimes.length - 1;
        const isLastColumn = teacherIndex === totalTeachers - 1;

        if (!isWorkingHour) {
          return (
            <EmptyCell
              key={cellKey}
              showAddButton={false}
              isLastRow={isLastRow}
              isLastColumn={isLastColumn}
            />
          );
        }

        if (hourLessons.length > 0) {
          return (
            <LessonCell
              key={cellKey}
              lesson={hourLessons[0]}
              isLastRow={isLastRow}
              isLastColumn={isLastColumn}
            />
          );
        }

        return (
          <EmptyCell
            key={cellKey}
            showAddButton={true}
            isLastRow={isLastRow}
            isLastColumn={isLastColumn}
          />
        );
      })}
    </Grid>
  );
}
