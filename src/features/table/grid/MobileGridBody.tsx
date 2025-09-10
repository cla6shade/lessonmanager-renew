import { Flex, Text, Box, Spinner } from "@chakra-ui/react";
import TimeColumn from "./TimeColumn";
import LessonColumn from "./LessonColumn";
import { useTable } from "../TableProvider";
import { useFetchDayLesson } from "../hooks/useFetchLesson";

export default function MobileGridBody() {
  const { selectedDate, selectedTeacher } = useTable();
  const { lessons, loading, error } = useFetchDayLesson(
    selectedDate,
    selectedTeacher?.id
  );

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
          {loading ? (
            <Flex align="center" justify="center" h="full">
              <Spinner size="lg" />
            </Flex>
          ) : error ? (
            <Flex align="center" justify="center" h="full">
              <Box textAlign="center">
                <Text color="red.500" fontSize="lg" mb={2}>
                  데이터를 불러오는 중 오류가 발생했습니다
                </Text>
                <Text color="gray.500" fontSize="sm">
                  {error}
                </Text>
              </Box>
            </Flex>
          ) : (
            <LessonColumn
              key={`mobile-lesson-column-${selectedDate.toISOString()}`}
              date={selectedDate}
              lessons={lessons}
            />
          )}
        </Box>
      </Flex>
    </>
  );
}
