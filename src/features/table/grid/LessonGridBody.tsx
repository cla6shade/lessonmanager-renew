import { Flex, Grid, Text, Box } from "@chakra-ui/react";
import TimeColumn from "./TimeColumn";
import LessonGridDateHeader from "./LessonGridDateHeader";
import LessonColumn from "./LessonColumn";
import { useTable } from "../TableProvider";
import { getDatesInPeriod } from "@/utils/date";
import { useFetchWeeklyLesson } from "../hooks/useFetchLesson";

export default function LessonGridBody() {
  const { datePeriod, selectedTeacher } = useTable();
  const dates = getDatesInPeriod(datePeriod);
  const { lessons } = useFetchWeeklyLesson(
    datePeriod.startDate,
    datePeriod.endDate,
    selectedTeacher?.id
  );
  return (
    <>
      <LessonGridDateHeader />
      <Flex grow={1}>
        <TimeColumn />
        <Grid templateColumns="repeat(7, 1fr)" w="full" h="full" gap={0}>
          {dates.map((date) => {
            const dateLessons = lessons.filter((lesson) => {
              const lessonDate = new Date(lesson.dueDate!);
              return lessonDate.toDateString() === date.toDateString();
            });

            return (
              <LessonColumn
                key={`lesson-column-${date.toISOString()}`}
                date={date}
                lessons={dateLessons}
              />
            );
          })}
        </Grid>
      </Flex>
    </>
  );
}
