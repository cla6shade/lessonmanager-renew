"use client";

import { OpenHours, Teacher, WorkingTime } from "@/generated/prisma";
import TableProvider from "./TableProvider";
import LessonTable from "./LessonTable";
import { Box, Flex, Stack } from "@chakra-ui/react";
import DateSelector from "./selectors/DateSelector";
import TeacherSelector from "./selectors/TeacherSelector";

interface LessonTablePageProps {
  workingTimes: WorkingTime[];
  openHours: OpenHours;
  teachers: Teacher[];
}

export default function LessonTablePage({
  workingTimes,
  openHours,
  teachers,
}: LessonTablePageProps) {
  return (
    <TableProvider
      workingTimes={workingTimes}
      openHours={openHours}
      teachers={teachers}
    >
      <Stack gap={4} align="stretch">
        <Flex
          pt={{
            base: 2,
            lg: 4,
          }}
          gap={{
            base: 2,
            lg: 0,
          }}
        >
          <DateSelector />
          <TeacherSelector />
        </Flex>
        <LessonTable />
      </Stack>
    </TableProvider>
  );
}
