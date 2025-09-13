import { Flex, Grid, Spinner, Text, Box } from "@chakra-ui/react";
import TimeColumn from "./TimeColumn";
import LessonGridDateHeader from "./LessonGridDateHeader";
import LessonColumn from "./LessonColumn";
import { useTable } from "../TableProvider";
import { getDatesInPeriod } from "@/utils/date";
import { useFetchWeeklyLesson } from "../hooks/useFetchLesson";

export default function LessonGridBody() {
  const { datePeriod, selectedTeacher } = useTable();
  const dates = getDatesInPeriod(datePeriod);
  const { lessons, error } = useFetchWeeklyLesson(
    datePeriod.startDate,
    datePeriod.endDate,
    selectedTeacher?.id
  );

  if (error) {
    return (
      <Flex grow={1} align="center" justify="center">
        <Box textAlign="center">
          <Text color="red.500" fontSize="lg" mb={2}>
            데이터를 불러오는 중 오류가 발생했습니다
          </Text>
          <Text color="gray.500" fontSize="sm">
            {error}
          </Text>
        </Box>
      </Flex>
    );
  }

  return (
    <>
      <LessonGridDateHeader />
      <Flex grow={1}>
        <TimeColumn />
        <Grid templateColumns="repeat(7, 1fr)" w="full" h="full" gap={0}>
          {dates.map((date) => {
            return (
              <LessonColumn
                key={`lesson-column-${date.toISOString()}`}
                date={date}
              />
            );
          })}
        </Grid>
      </Flex>
    </>
  );
}
