"use client";

import { Button, Flex, HStack } from "@chakra-ui/react";
import TeacherFilterSection from "./TeacherFilterSection";
import { TeacherFilterProvider } from "./TeacherFilterProvider";
import TeacherTable from "./table/TeacherTable";
import CreateTeacherDialog from "@/features/teachers/creation/CreateTeacherDialog";
import TeacherTableDialog from "./workingTimes/TeacherTableDialog";
import { Plus, Clock } from "lucide-react";
import { useState } from "react";
import { TeacherManagmentProvider } from "./TeacherManagmentProvider";

export default function TeacherManagementPage() {
  const [isCreateTeacherDialogOpen, setIsCreateTeacherDialogOpen] =
    useState(false);
  const [isTeacherTableDialogOpen, setIsTeacherTableDialogOpen] =
    useState(false);

  const handleCreateTeacherClick = () => {
    setIsCreateTeacherDialogOpen(true);
  };

  const handleCreateTeacherDialogClose = () => {
    setIsCreateTeacherDialogOpen(false);
  };

  const handleTeacherTableClick = () => {
    setIsTeacherTableDialogOpen(true);
  };

  const handleTeacherTableDialogClose = () => {
    setIsTeacherTableDialogOpen(false);
  };

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
                onClick={handleTeacherTableClick}
              >
                <Clock size={20} />
                근무시간 관리
              </Button>
              <Button
                size="2xl"
                colorScheme="brand"
                variant="outline"
                onClick={handleCreateTeacherClick}
              >
                <Plus size={20} />
                선생님 등록
              </Button>
            </HStack>
          </Flex>
          <TeacherTable />
        </Flex>

        <CreateTeacherDialog
          isOpen={isCreateTeacherDialogOpen}
          onClose={handleCreateTeacherDialogClose}
        />

        <TeacherTableDialog
          isOpen={isTeacherTableDialogOpen}
          onClose={handleTeacherTableDialogClose}
        />
      </TeacherManagmentProvider>
    </TeacherFilterProvider>
  );
}
