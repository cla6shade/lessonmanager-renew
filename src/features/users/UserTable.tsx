"use client";

import {
  Table,
  Box,
  Flex,
  Button,
  HStack,
  Select,
  createListCollection,
  Portal,
  Checkbox,
} from "@chakra-ui/react";
import { useState } from "react";
import { formatDate } from "@/utils/date";
import { SkeletonTable } from "@/components/ui/skeleton";
import Pagination from "@/components/ui/pagination";
import { useUserTable } from "./UserTableProvider";
import UserDetailDialog from "./UserDetailDialog";
import UserLessonsDialog from "@/features/dialog/UserLessonsDialog";
import UserPaymentsDialog from "@/features/dialog/UserPaymentsDialog";
import { UserSearchResult } from "@/app/(users)/api/users/schema";

export default function UserTable() {
  const {
    selectedLocation,
    setSelectedLocation,
    locations,
    page,
    setPage,
    selectedUsers,
    isAllSelected,
    handleSelectAll,
    handleSelectUser,
    users,
    total,
    totalPages,
    isUserLoading,
    refetchUsers,
  } = useUserTable();

  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLessonsDialogOpen, setIsLessonsDialogOpen] = useState(false);
  const [isPaymentsDialogOpen, setIsPaymentsDialogOpen] = useState(false);

  const handleDetailClick = (user: UserSearchResult) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
  };

  const handleLessonsClick = (user: UserSearchResult) => {
    setSelectedUser(user);
    setIsLessonsDialogOpen(true);
  };

  const handlePaymentsClick = (user: UserSearchResult) => {
    setSelectedUser(user);
    setIsPaymentsDialogOpen(true);
  };

  const handleDetailDialogClose = () => {
    setIsDetailDialogOpen(false);
    setSelectedUser(null);
  };

  const handleLessonsDialogClose = () => {
    setIsLessonsDialogOpen(false);
    setSelectedUser(null);
  };

  const handlePaymentsDialogClose = () => {
    setIsPaymentsDialogOpen(false);
    setSelectedUser(null);
  };

  const locationCollection = createListCollection({
    items: locations.map((location) => ({
      label: location.name,
      value: location.id.toString(),
    })),
  });

  if (isUserLoading) {
    return (
      <Box
        width="100%"
        height="0"
        flexGrow={1}
        overflow="auto"
        border="1px solid"
        borderColor="border"
        borderRadius="md"
      >
        <SkeletonTable />
      </Box>
    );
  }

  return (
    <Flex direction="column" flexGrow={1} height="100%">
      <Box
        width="100%"
        height="0"
        flexGrow={1}
        overflow="auto"
        border="1px solid"
        borderColor="border"
        borderRadius="md"
      >
        <Table.Root variant="outline" size="lg">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader width="30px">
                <Checkbox.Root
                  checked={isAllSelected}
                  onCheckedChange={(e) => handleSelectAll(!!e.checked)}
                  size="sm"
                  pt={1}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                </Checkbox.Root>
              </Table.ColumnHeader>
              <Table.ColumnHeader>ID</Table.ColumnHeader>
              <Table.ColumnHeader px={2} width="50px">
                <Select.Root
                  collection={locationCollection}
                  size="xs"
                  value={[selectedLocation.id.toString()]}
                  onValueChange={(details) => {
                    const locationId = parseInt(details.value[0]);
                    const location = locations.find(
                      (loc) => loc.id === locationId
                    );
                    if (location) {
                      setSelectedLocation(location);
                    }
                  }}
                  width="fit-content"
                >
                  <Select.Trigger
                    fontSize="sm"
                    fontWeight="medium"
                    minWidth="120px"
                    height="auto"
                    padding="2"
                  >
                    <Select.ValueText placeholder="지점 선택">
                      {selectedLocation.name}
                    </Select.ValueText>
                  </Select.Trigger>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {locationCollection.items.map((item) => (
                          <Select.Item key={item.value} item={item}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Table.ColumnHeader>
              <Table.ColumnHeader>이름</Table.ColumnHeader>
              <Table.ColumnHeader>생년월일</Table.ColumnHeader>
              <Table.ColumnHeader>휴대폰 번호</Table.ColumnHeader>
              <Table.ColumnHeader
                width="100px"
                display="flex"
                justifyContent="center"
              >
                비고
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users.map((user) => (
              <Table.Row key={user.id}>
                <Table.Cell pt={4}>
                  <Checkbox.Root
                    checked={selectedUsers.has(user.id)}
                    onCheckedChange={(e) =>
                      handleSelectUser(user.id, !!e.checked)
                    }
                    size="sm"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                </Table.Cell>
                <Table.Cell>{user.id}</Table.Cell>
                <Table.Cell>{user.location.name}</Table.Cell>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>
                  {user.birth ? formatDate(new Date(user.birth)) : "-"}
                </Table.Cell>
                <Table.Cell>{user.contact}</Table.Cell>
                <Table.Cell
                  width="100px"
                  display="flex"
                  justifyContent="center"
                >
                  <HStack gap={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDetailClick(user)}
                    >
                      상세 보기
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLessonsClick(user)}
                    >
                      레슨 내역
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePaymentsClick(user)}
                    >
                      결제 내역
                    </Button>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
            {users.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={7} textAlign="center" py={8}>
                  등록된 수강생이 없습니다.
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      <Box mt={4} px={4}>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={20}
          onPageChange={setPage}
        />
      </Box>

      {selectedUser && (
        <>
          <UserDetailDialog
            user={selectedUser}
            isOpen={isDetailDialogOpen}
            onClose={handleDetailDialogClose}
            onUserUpdate={() => {
              refetchUsers();
            }}
          />
          <UserLessonsDialog
            userId={selectedUser.id}
            userName={selectedUser.name}
            isOpen={isLessonsDialogOpen}
            onClose={handleLessonsDialogClose}
          />
          <UserPaymentsDialog
            userId={selectedUser.id}
            userName={selectedUser.name}
            isOpen={isPaymentsDialogOpen}
            onClose={handlePaymentsDialogClose}
          />
        </>
      )}
    </Flex>
  );
}
