"use client";

import { createContext, useState, useEffect, ReactNode, use } from 'react';
import { useTeacherFilter } from "./search/TeacherFilterProvider";
import useFetchTeachers from "./hooks/useFetchTeachers";
import { toaster } from "@/components/ui/toaster";
import { TeacherSearchResult } from "@/app/(teachers)/api/teachers/schema";

interface TeacherManagmentContextType {
  page: number;
  setPage: (page: number) => void;

  teachers: TeacherSearchResult[];
  total: number;
  totalPages: number;
  isTeacherLoading: boolean;
  teacherFetchError: string | null;
  refetchTeachers: () => void;
}

const TeacherManagmentContext = createContext<
  TeacherManagmentContextType | undefined
>(undefined);

export function useTeacherManagement() {
  const context = use(TeacherManagmentContext);
  if (!context) {
    throw new Error(
      "useTeacherManagement must be used within TeacherManagmentProvider"
    );
  }
  return context;
}

interface TeacherManagmentProviderProps {
  children: ReactNode;
}

export function TeacherManagmentProvider({
  children,
}: TeacherManagmentProviderProps) {
  const { getStartDateISO, getEndDateISO } = useTeacherFilter();

  const [page, setPage] = useState(1);

  const {
    teachers,
    total,
    totalPages,
    loading: isTeacherLoading,
    error: teacherFetchError,
    refetch: refetchTeachers,
  } = useFetchTeachers({
    startDate: getStartDateISO(),
    endDate: getEndDateISO(),
    page,
  });

  useEffect(() => {
    if (teacherFetchError) {
      toaster.create({
        title: "선생님 목록 조회 실패",
        description: teacherFetchError,
        type: "error",
      });
    }
  }, [teacherFetchError]);

  return (
    <TeacherManagmentContext.Provider
      value={{
        page,
        setPage,
        teachers,
        total,
        totalPages,
        isTeacherLoading,
        teacherFetchError,
        refetchTeachers,
      }}
    >
      {children}
    </TeacherManagmentContext.Provider>
  );
}
