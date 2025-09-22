"use client";

import { Flex } from "@chakra-ui/react";
import { FilterProvider } from "./FilterProvider";
import { UserTableProvider } from "./UserTableProvider";
import FilterSection from "./FilterSection";
import UserTable from "./UserTable";

export default function UserManagementPage() {
  return (
    <FilterProvider>
      <UserTableProvider>
        <Flex py={4} flexGrow={1} direction="column" height="100%">
          <FilterSection />
          <UserTable />
        </Flex>
      </UserTableProvider>
    </FilterProvider>
  );
}
