"use client";

import { Button, Flex } from "@chakra-ui/react";
import { FilterProvider } from "./FilterProvider";
import { UserTableProvider } from "./UserTableProvider";
import FilterSection from "./FilterSection";
import UserTable from "./UserTable";
import CreateUserDialog from "@/features/dialog/CreateUserDialog";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function UserManagementPage() {
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);

  const handleCreateUserClick = () => {
    setIsCreateUserDialogOpen(true);
  };

  const handleCreateUserDialogClose = () => {
    setIsCreateUserDialogOpen(false);
  };

  return (
    <FilterProvider>
      <UserTableProvider>
        <Flex py={4} flexGrow={1} direction="column" height="100%">
          <Flex justifyContent="space-between">
            <FilterSection />
            <Button
              size="2xl"
              colorScheme="brand"
              variant="outline"
              onClick={handleCreateUserClick}
            >
              <Plus size={20} />
              수강생 등록
            </Button>
          </Flex>
          <UserTable />
        </Flex>

        <CreateUserDialog
          isOpen={isCreateUserDialogOpen}
          onClose={handleCreateUserDialogClose}
        />
      </UserTableProvider>
    </FilterProvider>
  );
}
