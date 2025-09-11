import { Box, Text } from "@chakra-ui/react";
import { useState } from "react";
import Cell from "./Cell";
import { getLessonStatusColor } from "../utils";
import LessonDetailDialog from "../../dialog/LessonDetailDialog";
import { useNavigation } from "@/features/navigation/location/NavigationContext";
import { GetLessonsResponse } from "@/app/(lessons)/api/lessons/schema";

interface LessonCellProps {
  lesson: GetLessonsResponse["data"][number];
  isLastRow?: boolean;
  isLastColumn?: boolean;
}

export default function LessonCell({
  lesson,
  isLastRow = false,
  isLastColumn = false,
}: LessonCellProps) {
  const statusColor = getLessonStatusColor(lesson);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isAdmin, userId } = useNavigation();

  const handleOpenDialog = () => {
    if (isAdmin) {
      setIsDialogOpen(true);
    } else {
      if (userId === lesson.userId) {
        setIsDialogOpen(true);
      }
    }
  };

  return (
    <>
      <Cell isLastRow={isLastRow} isLastColumn={isLastColumn}>
        <Box
          display="flex"
          height="100%"
          width="100%"
          onClick={handleOpenDialog}
        >
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

      <LessonDetailDialog
        lesson={lesson}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
