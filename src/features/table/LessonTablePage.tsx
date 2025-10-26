"use client";

import { OpenHours, WorkingTime } from "@/generated/prisma";
import LessonTable from "./LessonTable";
import MobileTable from "./MobileTable";
import { Flex, Box } from "@chakra-ui/react";
import DateSelector from "./selectors/DateSelector";
import TableTeacherSelector from "./selectors/TableTeacherSelector";
import { use } from "react";
import { ExtendedTeacher } from "./types";
import TableProvider from "./providers/TableProvider";
import LessonProvider from "./grid/providers/LessonProvider";

interface LessonTablePageProps {
  workingTimesPromise: Promise<WorkingTime[]>;
  openHoursPromise: Promise<OpenHours | null>;
  teachersPromise: Promise<ExtendedTeacher[]>;
}

export default function LessonTablePage({
  workingTimesPromise,
  openHoursPromise,
  teachersPromise,
}: LessonTablePageProps) {
  const openHours = use(openHoursPromise);
  const teachers = use(teachersPromise);
  const workingTimes = use(workingTimesPromise);
  return (
    <TableProvider
      openHours={openHours!}
      teachers={teachers}
      workingTimes={workingTimes}
    >
      <LessonProvider>
        <Flex gap={4} direction="column" flexGrow={1}>
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
            <TableTeacherSelector />
          </Flex>

          <Box display={{ base: "none", lg: "flex" }} flexGrow={1}>
            <LessonTable />
          </Box>

          <Box display={{ base: "flex", lg: "none" }} flexGrow={1}>
            <MobileTable />
          </Box>
        </Flex>
      </LessonProvider>
    </TableProvider>
  );
}
