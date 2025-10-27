import { ExtendedTeacher } from '../types';
import { getWorkingDayOfWeek } from '@/utils/date';
import { Grid } from '@chakra-ui/react';
import LessonCell from './cell/LessonCell';
import EmptyCell from './cell/EmptyCell';
import { getTeacherWorkingHours } from './utils';
import { GetLessonsResponse } from '@/app/(lessons)/api/lessons/schema';
import { useLesson } from './providers/LessonProvider';
import LessonReservationProvider from './providers/LessonReservationProvider';

interface TeacherColumnProps {
  teacher: ExtendedTeacher;
  date: Date;
  lessons: GetLessonsResponse['data'];
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
  const { bannedTimes } = useLesson();

  return (
    <Grid templateRows={`repeat(${allTimes.length}, 1fr)`} w="full" h="full">
      {allTimes.map((hour, hourIndex) => {
        const isWorkingHour = teacherWorkingHours.includes(hour);
        const hourLessons = lessons.filter((lesson) => lesson.dueHour === hour);

        const isBanned = bannedTimes.some(
          (bannedTime) =>
            bannedTime.teacherId === teacher.id &&
            new Date(bannedTime.date).toDateString() === date.toDateString() &&
            bannedTime.hour === hour,
        );
        const cellDateTime = new Date(date);
        cellDateTime.setHours(hour, 0, 0, 0);

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
          <LessonReservationProvider
            key={cellKey}
            selectedDate={date}
            selectedTeacher={teacher}
            dueHour={hour}
          >
            <EmptyCell
              showAddButton={!isBanned && new Date().getTime() < cellDateTime.getTime()}
              isLastRow={isLastRow}
              isLastColumn={isLastColumn}
            />
          </LessonReservationProvider>
        );
      })}
    </Grid>
  );
}
