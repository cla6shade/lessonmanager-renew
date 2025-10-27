"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigation } from "../../navigation/provider/NavigationContext";
import { useFilter } from "../search/FilterProvider";
import useFetchUsers from "../search/useFetchUsers";
import { UserSearchResult } from "@/app/(users)/api/users/schema";
import { Location } from "@/generated/prisma";

interface UserTableContextType {
  selectedLocation: Location;
  setSelectedLocation: (location: Location) => void;
  locations: Location[];

  page: number;
  setPage: (page: number) => void;

  users: UserSearchResult[];
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
  children: ReactNode;
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

  const { users, total, totalPages, loading, error, refetch } = useFetchUsers({
    locationId: selectedLocation.id,
    filter: currentFilter,
    name: searchName || undefined,
    contact: searchContact || undefined,
    birthDate: searchBirthDate || undefined,
    page,
    limit: 20,
  });

  useEffect(() => {
    setPage(1);
  }, [selectedLocation.id]);

  useEffect(() => {
    setPage(1);
  }, [currentFilter, searchName, searchContact, searchBirthDate]);

  const contextValue: UserTableContextType = {
    selectedLocation,
    setSelectedLocation,
    locations,
    page,
    setPage,

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
