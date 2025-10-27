"use client";

import { createContext, ReactNode, useContext, useState } from 'react';
import { UserSearchFilter } from "@/app/(users)/api/users/schema";

interface FilterContextType {
  currentFilter: UserSearchFilter;
  setCurrentFilter: (filter: UserSearchFilter) => void;
  searchName: string;
  setSearchName: (name: string) => void;
  searchContact: string;
  setSearchContact: (contact: string) => void;
  searchBirthDate: string;
  setSearchBirthDate: (birthDate: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within FilterProvider");
  }
  return context;
}

interface FilterProviderProps {
  children: ReactNode;
}

export function FilterProvider({ children }: FilterProviderProps) {
  const [currentFilter, setCurrentFilter] = useState<UserSearchFilter>("ALL");
  const [searchName, setSearchName] = useState("");
  const [searchContact, setSearchContact] = useState("");
  const [searchBirthDate, setSearchBirthDate] = useState("");

  const contextValue: FilterContextType = {
    currentFilter,
    setCurrentFilter,
    searchName,
    setSearchName,
    searchContact,
    setSearchContact,
    searchBirthDate,
    setSearchBirthDate,
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
}
