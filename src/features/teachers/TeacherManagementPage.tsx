"use client";

import { Button, Flex, HStack } from "@chakra-ui/react";
import TeacherTable from "./table/TeacherTable";
import CreateTeacherDialog from "@/features/teachers/creation/CreateTeacherDialog";
import TeacherTableDialog from "./workingTimes/TeacherWorkingTimeDialog";
import { Plus, Clock } from "lucide-react";
import { useState } from "react";
import { TeacherManagmentProvider } from "./TeacherManagmentProvider";
import { TeacherFilterProvider } from "./search/TeacherFilterProvider";
import TeacherFilterSection from "./search/TeacherFilterSection";

export default function TeacherManagementPage() {
  const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);

  return (
    <TeacherFilterProvider>
      <TeacherManagmentProvider>
        <Flex py={4} flexGrow={1} direction="column" height="100%">
          <Flex justifyContent="space-between">
            <TeacherFilterSection />
            <HStack gap={3}>
              <Button
                size="2xl"
                colorScheme="brand"
                variant="outline"
                onClick={() => setIsTableDialogOpen(true)}
              >
                <Clock size={20} />
                근무시간 관리
              </Button>
              <Button
                size="2xl"
                colorScheme="brand"
                variant="outline"
                onClick={() => setIsCreationDialogOpen(true)}
              >
                <Plus size={20} />
                선생님 등록
              </Button>
            </HStack>
          </Flex>
          <TeacherTable />
        </Flex>

        <CreateTeacherDialog
          isOpen={isCreationDialogOpen}
          onClose={() => setIsCreationDialogOpen(false)}
        />

        <TeacherTableDialog
          isOpen={isTableDialogOpen}
          onClose={() => setIsTableDialogOpen(false)}
        />
      </TeacherManagmentProvider>
    </TeacherFilterProvider>
  );
}
