'use client';

import { Button, Flex } from '@chakra-ui/react';
import { FilterProvider } from './search/FilterProvider';
import { UserTableProvider } from './table/UserTableProvider';
import { UserSelectionProvider } from './UserSelectionProvider';
import FilterSection from './search/FilterSection';
import UserTable from './table/UserTable';
import CreateUserDialog from '@/features/users/creation/CreateUserDialog';
import SendSMSDialog from '@/features/users/sms/SendSMSDialog';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function UserManagementPage() {
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  return (
    <FilterProvider>
      <UserTableProvider>
        <UserSelectionProvider>
          <Flex py={4} flexGrow={1} direction="column" height="100%">
            <Flex gap={4}>
              <FilterSection />
              <Flex grow={1} gap={4} justify="end">
                <Button
                  size="2xl"
                  colorScheme="brand"
                  variant="outline"
                  onClick={() => setIsCreateUserDialogOpen(true)}
                >
                  <Plus size={20} />
                  수강생 등록
                </Button>

                <Button
                  size="2xl"
                  colorScheme="brand"
                  variant="outline"
                  onClick={() => setIsMessageDialogOpen(true)}
                >
                  <Plus size={20} />
                  문자 전송
                </Button>
              </Flex>
            </Flex>
            <UserTable />
          </Flex>

          <CreateUserDialog
            isOpen={isCreateUserDialogOpen}
            onClose={() => setIsCreateUserDialogOpen(false)}
          />

          <SendSMSDialog open={isMessageDialogOpen} onClose={() => setIsMessageDialogOpen(false)} />
        </UserSelectionProvider>
      </UserTableProvider>
    </FilterProvider>
  );
}
