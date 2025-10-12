import { getWorkingDayOfWeek, getTimesInPeriod } from "@/utils/date";
import { Box, Grid } from "@chakra-ui/react";
import TeacherHeader from "./TeacherHeader";
import TeacherColumn from "./TeacherColumn";
import EmptyColumn from "./EmptyColumn";
import { getWorkingTeachersOnDate } from "./utils";
import { useNavigation } from "@/features/navigation/provider/NavigationContext";
import { useTable } from "../providers/TableProvider";
import { useLesson } from "./providers/LessonProvider";

interface LessonColumnProps {
  date: Date;
}

export default function LessonColumn({ date }: LessonColumnProps) {
  const { teachers, selectedTeacher, openHours } = useTable();
  const { selectedLocation } = useNavigation();
  let { lessons } = useLesson();

  lessons = lessons.filter((lesson) => {
    const lessonDate = new Date(lesson.dueDate!);
    return lessonDate.toDateString() === date.toDateString();
  });

  const dayOfWeek = getWorkingDayOfWeek(date);
  const allTimes = getTimesInPeriod(openHours);

  const displayTeachers = selectedTeacher ? [selectedTeacher] : teachers;

  const workingTeachersOnDate = getWorkingTeachersOnDate(
    selectedLocation,
    displayTeachers,
    dayOfWeek
  );

  const hasWorkingTeachers = workingTeachersOnDate.length > 0;

  return (
    <Box
      w="full"
      h="full"
      borderLeft="1px solid"
      borderBottom="1px solid"
      borderColor="gray.200"
    >
      <TeacherHeader workingTeachers={workingTeachersOnDate} />

      <Grid
        templateColumns={`repeat(${workingTeachersOnDate.length || 1}, 1fr)`}
        w="full"
        h="calc(100% - 36px)"
        minHeight="0"
      >
        {hasWorkingTeachers ? (
          workingTeachersOnDate.map((teacher, teacherIndex) => (
            <TeacherColumn
              key={`teacher-${teacher.id}-${date.toDateString()}`}
              teacher={teacher}
              date={date}
              lessons={lessons.filter(
                (lesson) => lesson.teacherId === teacher.id
              )}
              allTimes={allTimes}
              teacherIndex={teacherIndex}
              totalTeachers={workingTeachersOnDate.length}
            />
          ))
        ) : (
          <EmptyColumn allTimes={allTimes} date={date} />
        )}
      </Grid>
    </Box>
  );
}
