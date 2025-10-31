'use client';

import { createContext, useState, ReactNode, use } from 'react';
import { UserSearchResult } from '@/app/(users)/api/users/schema';

interface UserSelectionContextValue {
  selectedUsers: Set<UserSearchResult>;
  isAllSelected: boolean;
  isTotalSelected: boolean;
  handleSelectUser: (user: UserSearchResult, isChecked: boolean) => void;
  handleSelectAll: (isChecked: boolean, users: UserSearchResult[]) => void;
  handlePageChange: () => void;
  setIsTotalSelected: (value: boolean) => void;
  clearSelection: () => void;
}

const UserSelectionContext = createContext<UserSelectionContextValue | null>(null);

interface UserSelectionProviderProps {
  children: ReactNode;
}

export function UserSelectionProvider({ children }: UserSelectionProviderProps) {
  const [selectedUsers, setSelectedUsers] = useState<Set<UserSearchResult>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [isTotalSelected, setIsTotalSelected] = useState<boolean>(false);

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

  const handleSelectAll = (isChecked: boolean, users: UserSearchResult[]) => {
    if (isChecked) {
      setIsAllSelected(true);
      setSelectedUsers(new Set(users));
    } else {
      setIsAllSelected(false);
      setSelectedUsers(new Set());
    }
  };

  const handlePageChange = () => {
    setIsAllSelected(false);
  };

  const clearSelection = () => {
    setSelectedUsers(new Set());
    setIsAllSelected(false);
    setIsTotalSelected(false);
  };

  const value: UserSelectionContextValue = {
    selectedUsers,
    isAllSelected,
    isTotalSelected,
    handleSelectUser,
    handleSelectAll,
    handlePageChange,
    setIsTotalSelected,
    clearSelection,
  };

  return (
    <UserSelectionContext.Provider value={value}>{children}</UserSelectionContext.Provider>
  );
}

export function useUserSelection(): UserSelectionContextValue {
  const context = use(UserSelectionContext);

  if (!context) {
    throw new Error('useUserSelection must be used within a UserSelectionProvider');
  }

  return context;
}
