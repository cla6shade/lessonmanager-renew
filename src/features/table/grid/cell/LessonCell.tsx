import { Lesson } from "@/generated/prisma";
import { Box, Text } from "@chakra-ui/react";
import Cell from "./Cell";
import { getLessonStatusColor } from "../utils";

interface LessonCellProps {
  lesson: Lesson;
  isLastRow?: boolean;
  isLastColumn?: boolean;
}

export default function LessonCell({
  lesson,
  isLastRow = false,
  isLastColumn = false,
}: LessonCellProps) {
  const statusColor = getLessonStatusColor(lesson);

  return (
    <Cell isLastRow={isLastRow} isLastColumn={isLastColumn}>
      <Box display="flex" height="100%" width="100%">
        <Box height="100%" width={1} backgroundColor={statusColor}></Box>
        <Box
          fontSize="sm"
          textAlign="center"
          flexGrow={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          transition="background-color 0.2s ease-in-out"
          _hover={{
            backgroundColor: "gray.50",
          }}
        >
          <Text>{lesson.username}</Text>
        </Box>
      </Box>
    </Cell>
  );
}
