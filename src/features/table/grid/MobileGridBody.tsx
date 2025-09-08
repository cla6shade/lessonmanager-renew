import { Flex, Text, Box } from "@chakra-ui/react";
import TimeColumn from "./TimeColumn";
import LessonColumn from "./LessonColumn";
import { useTable } from "../TableProvider";
import { useFetchDayLesson } from "../hooks/useFetchLesson";

export default function MobileGridBody() {
  const { selectedDate, selectedTeacher } = useTable();
  const { lessons } = useFetchDayLesson(selectedDate, selectedTeacher?.id);
  return (
    <>
      <Box
        borderBottom="1px solid"
        borderBottomColor="gray.200"
        p={2}
        bg="gray.50"
      >
        <Text fontSize="lg" fontWeight="medium" textAlign="center">
          {selectedDate.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </Text>
      </Box>

      <Flex grow={1}>
        <TimeColumn />
        <Box w="full" h="full">
          <LessonColumn
            key={`mobile-lesson-column-${selectedDate.toISOString()}`}
            date={selectedDate}
            lessons={lessons}
          />
        </Box>
      </Flex>
    </>
  );
}
