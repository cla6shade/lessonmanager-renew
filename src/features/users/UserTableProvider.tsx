"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useNavigation } from "../navigation/location/NavigationContext";
import { useFilter } from "./FilterProvider";
import useFetchUsers from "./hooks/useFetchUsers";
import { toaster } from "@/components/ui/toaster";

interface UserTableContextType {
  selectedLocation: { id: number; name: string };
  setSelectedLocation: (location: { id: number; name: string }) => void;
  locations: { id: number; name: string }[];

  page: number;
  setPage: (page: number) => void;

  selectedUsers: Set<number>;
  setSelectedUsers: (users: Set<number>) => void;
  isAllSelected: boolean;
  setIsAllSelected: (selected: boolean) => void;

  handleSelectAll: (checked: boolean) => void;
  handleSelectUser: (userId: number, checked: boolean) => void;

  // User store data
  users: any[];
  total: number;
  totalPages: number;
  isUserLoading: boolean;
  userFetchError: string | null;
  refetchUsers: () => void;
}

const UserTableContext = createContext<UserTableContextType | undefined>(
  undefined
);

export function useUserTable() {
  const context = useContext(UserTableContext);
  if (!context) {
    throw new Error("useUserTable must be used within UserTableProvider");
  }
  return context;
}

interface UserTableProviderProps {
  children: React.ReactNode;
}

export function UserTableProvider({ children }: UserTableProviderProps) {
  const { selectedLocation: defaultSelectedLocation, locations } =
    useNavigation();
  const { currentFilter, searchName, searchContact, searchBirthDate } =
    useFilter();

  const [selectedLocation, setSelectedLocation] = useState(
    defaultSelectedLocation
  );
  const [page, setPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  const { users, total, totalPages, loading, error, refetch } = useFetchUsers({
    locationId: selectedLocation.id,
    filter: currentFilter,
    name: searchName || undefined,
    contact: searchContact || undefined,
    birthDate: searchBirthDate || undefined,
    page,
    limit: 20,
  });

  // 지점 변경 시 페이지 초기화
  useEffect(() => {
    setPage(1);
    setSelectedUsers(new Set());
    setIsAllSelected(false);
  }, [selectedLocation.id]);

  // 필터 변경 시 페이지 초기화
  useEffect(() => {
    setPage(1);
    setSelectedUsers(new Set());
    setIsAllSelected(false);
  }, [currentFilter, searchName, searchContact, searchBirthDate]);

  const handleSelectAll = (checked: boolean) => {
    setIsAllSelected(checked);
    if (checked) {
      setSelectedUsers(new Set(users.map((user) => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
    setIsAllSelected(newSelected.size === users.length && users.length > 0);
  };

  const contextValue: UserTableContextType = {
    selectedLocation,
    setSelectedLocation,
    locations,
    page,
    setPage,
    selectedUsers,
    setSelectedUsers,
    isAllSelected,
    setIsAllSelected,
    handleSelectAll,
    handleSelectUser,

    users,
    total,
    totalPages,
    isUserLoading: loading,
    userFetchError: error,
    refetchUsers: refetch,
  };

  return (
    <UserTableContext.Provider value={contextValue}>
      {children}
    </UserTableContext.Provider>
  );
}
