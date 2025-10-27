'use client';

import { createContext, useState, ReactNode, use } from 'react';

interface DateFragment {
  year: string;
  month: string;
  day: string;
}

interface TeacherFilterContextType {
  startDate: DateFragment;
  endDate: DateFragment;
  setStartDate: (date: DateFragment) => void;
  setEndDate: (date: DateFragment) => void;
  getStartDateISO: () => string;
  getEndDateISO: () => string;
}

const TeacherFilterContext = createContext<TeacherFilterContextType | undefined>(undefined);

export function TeacherFilterProvider({ children }: { children: ReactNode }) {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const [startDate, setStartDate] = useState<DateFragment>({
    year: oneMonthAgo.getFullYear().toString(),
    month: (oneMonthAgo.getMonth() + 1).toString().padStart(2, '0'),
    day: oneMonthAgo.getDate().toString().padStart(2, '0'),
  });

  const [endDate, setEndDate] = useState<DateFragment>({
    year: today.getFullYear().toString(),
    month: (today.getMonth() + 1).toString().padStart(2, '0'),
    day: today.getDate().toString().padStart(2, '0'),
  });

  const getStartDateISO = () => {
    if (startDate.year && startDate.month && startDate.day) {
      const date = new Date(
        parseInt(startDate.year),
        parseInt(startDate.month) - 1,
        parseInt(startDate.day),
        0,
        0,
        0,
      );
      return date.toISOString();
    }
    return '';
  };

  const getEndDateISO = () => {
    if (endDate.year && endDate.month && endDate.day) {
      const date = new Date(
        parseInt(endDate.year),
        parseInt(endDate.month) - 1,
        parseInt(endDate.day),
        23,
        59,
        59,
      );
      return date.toISOString();
    }
    return '';
  };

  return (
    <TeacherFilterContext.Provider
      value={{
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        getStartDateISO,
        getEndDateISO,
      }}
    >
      {children}
    </TeacherFilterContext.Provider>
  );
}

export function useTeacherFilter() {
  const context = use(TeacherFilterContext);
  if (context === undefined) {
    throw new Error('useTeacherFilter must be used within a TeacherFilterProvider');
  }
  return context;
}
