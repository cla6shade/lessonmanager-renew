'use client';

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
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { formatDate } from '@/utils/date';
import SkeletonFetchBoundary from '@/components/SkeletonFetchBoundary';
import Pagination from '@/components/ui/pagination';
import { useUserTable } from './UserTableProvider';
import UserDetailDialog from '../details/UserDetailDialog';
import UserLessonsDialog from '@/features/users/lessons/UserLessonsDialog';
import UserPaymentsDialog from '@/features/users/payments/UserPaymentsDialog';
import { UserSearchResult } from '@/app/(users)/api/users/schema';
import { Location } from '@/generated/prisma';

export default function UserTable() {
  const {
    selectedLocation,
    setSelectedLocation,
    locations,
    page,
    setPage,
    users,
    total,
    totalPages,
    isUserLoading,
    refetchUsers,
  } = useUserTable();

  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<UserSearchResult>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [isTotalSelected, setIsTotalSelected] = useState<boolean>(false);
  const [openDialogType, setOpenDialogType] = useState<'detail' | 'lessons' | 'payments' | null>(
    null,
  );

  const openDialog = (user: UserSearchResult, dialogType: 'detail' | 'lessons' | 'payments') => {
    setSelectedUser(user);
    setOpenDialogType(dialogType);
  };

  const closeDialog = () => {
    setSelectedUser(null);
    setOpenDialogType(null);
  };

  const locationCollection = createListCollection({
    items: locations.map((location: Location) => ({
      label: location.name,
      value: location.id.toString(),
    })),
  });

  const handlePageChange = (page: number) => {
    setPage(page);
    setIsAllSelected(false);
  };

  const handleSelectUser = (user: UserSearchResult, isChecked: boolean) => {
    setSelectedUsers((prevState) => {
      const next = new Set(prevState);
      if (isChecked) {
        next.add(user);
      } else {
        next.delete(user);
        setIsAllSelected(false);
      }
      return next;
    });
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setIsAllSelected(true);
      setSelectedUsers(new Set(users));
    } else {
      setIsAllSelected(false);
      setSelectedUsers(new Set());
    }
  };

  return (
    <Flex direction="column" flexGrow={1} height="100%">
      <SkeletonFetchBoundary
        isLoading={isUserLoading}
        error={null}
        isEmpty={users.length === 0}
        rows={20}
        columns={7}
        useFlexHeight={true}
      >
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
                      const location = locations.find((loc: Location) => loc.id === locationId);
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
                          {locationCollection.items.map(
                            (item: { value: string; label: string }) => (
                              <Select.Item key={item.value} item={item}>
                                {item.label}
                              </Select.Item>
                            ),
                          )}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Table.ColumnHeader>
                <Table.ColumnHeader>이름</Table.ColumnHeader>
                <Table.ColumnHeader>생년월일</Table.ColumnHeader>
                <Table.ColumnHeader>휴대폰 번호</Table.ColumnHeader>
                <Table.ColumnHeader width="100px" display="flex" justifyContent="center">
                  비고
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {users.map((user: UserSearchResult) => (
                <Table.Row key={user.id}>
                  <Table.Cell pt={4}>
                    <Checkbox.Root
                      checked={selectedUsers.has(user)}
                      onCheckedChange={(e) => handleSelectUser(user, !!e.checked)}
                      size="sm"
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                  </Table.Cell>
                  <Table.Cell>{user.id}</Table.Cell>
                  <Table.Cell>{user.location.name}</Table.Cell>
                  <Table.Cell>{user.name}</Table.Cell>
                  <Table.Cell>{user.birth ? formatDate(new Date(user.birth)) : '-'}</Table.Cell>
                  <Table.Cell>{user.contact}</Table.Cell>
                  <Table.Cell width="100px" display="flex" justifyContent="center">
                    <HStack gap={2}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(user, 'detail')}
                      >
                        상세 보기
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(user, 'lessons')}
                      >
                        레슨 내역
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(user, 'payments')}
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
      </SkeletonFetchBoundary>

      <Box mt={4} px={4}>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={20}
          onPageChange={handlePageChange}
        />
        <Flex gap={2}>
          <Checkbox.Root
            checked={isTotalSelected}
            onCheckedChange={(e) => {
              setIsTotalSelected(!!e.checked);
              handleSelectAll(!!e.checked);
            }}
            size="sm"
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>전체 항목 선택</Checkbox.Label>
          </Checkbox.Root>
        </Flex>
      </Box>

      {selectedUser && (
        <>
          <UserDetailDialog
            user={selectedUser}
            onUserUpdate={(user: UserSearchResult) => {
              setSelectedUser(user);
            }}
            isOpen={openDialogType === 'detail'}
            onClose={closeDialog}
            refetchUsers={refetchUsers}
          />
          <UserLessonsDialog
            userId={selectedUser.id}
            userName={selectedUser.name}
            isOpen={openDialogType === 'lessons'}
            onClose={closeDialog}
          />
          <UserPaymentsDialog
            userId={selectedUser.id}
            userName={selectedUser.name}
            isOpen={openDialogType === 'payments'}
            onClose={closeDialog}
          />
        </>
      )}
    </Flex>
  );
}
