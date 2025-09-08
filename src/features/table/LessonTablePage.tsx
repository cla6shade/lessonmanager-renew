"use client";

import { OpenHours, WorkingTime } from "@/generated/prisma";
import TableProvider from "./TableProvider";
import LessonTable from "./LessonTable";
import MobileTable from "./MobileTable";
import { Flex, Box } from "@chakra-ui/react";
import DateSelector from "./selectors/DateSelector";
import TeacherSelector from "./selectors/TeacherSelector";
import { use } from "react";
import { ExtendedTeacher } from "./types";

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
          <TeacherSelector />
        </Flex>

        {/* 데스크톱 테이블 */}
        <Box display={{ base: "none", lg: "flex" }} flexGrow={1}>
          <LessonTable />
        </Box>

        {/* 모바일 테이블 */}
        <Box display={{ base: "flex", lg: "none" }} flexGrow={1}>
          <MobileTable />
        </Box>
      </Flex>
    </TableProvider>
  );
}
