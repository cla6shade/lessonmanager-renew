import { Flex, Grid, Text, Box } from "@chakra-ui/react";
import TimeColumn from "./TimeColumn";
import LessonGridDateHeader from "./LessonGridDateHeader";
import LessonColumn from "./LessonColumn";
import { getDatesInPeriod } from "@/utils/date";
import { useTable } from "../providers/TableProvider";
import { useLesson } from "./providers/LessonProvider";

export default function LessonGridBody() {
  const { datePeriod } = useTable();
  const dates = getDatesInPeriod(datePeriod);
  const { lessonFetchError } = useLesson();

  if (lessonFetchError) {
    return (
      <Flex grow={1} align="center" justify="center">
        <Box textAlign="center">
          <Text color="red.500" fontSize="lg" mb={2}>
            데이터를 불러오는 중 오류가 발생했습니다
          </Text>
          <Text color="gray.500" fontSize="sm">
            {lessonFetchError}
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
