import { createContext, ReactNode, use, useCallback, useState } from "react";
import { OpenHours, Teacher, WorkingTime } from "@/generated/prisma";
import {
  DatePeriod,
  getCurrentDatePeriod,
  getNextDatePeriod,
  getPreviousDatePeriod,
} from "@/utils/date";

export const TableContext = createContext<TableContextType | undefined>(
  undefined
);

interface TableProviderProps {
  workingTimes: WorkingTime[];
  openHours: OpenHours;
  teachers: Teacher[];
  children: ReactNode;
}

interface TableContextType {
  workingTimes: WorkingTime[];
  openHours: OpenHours;
  teachers: Teacher[];
  selectedTeacher: Teacher | null;
  datePeriod: DatePeriod;
  selectedDate: Date;
  setPeriodToNext: () => void;
  setPeriodToPrevious: () => void;
  setSelectedDate: (date: Date) => void;
  setSelectedTeacher: (teacher: Teacher | null) => void;
  setDatePeriod: (period: DatePeriod) => void;
}

export default function TableProvider({
  children,
  workingTimes,
  openHours,
  teachers,
}: TableProviderProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [datePeriod, setDatePeriod] = useState<DatePeriod>(
    getCurrentDatePeriod(new Date())
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const setPeriodToNext = useCallback(() => {
    setDatePeriod(getNextDatePeriod(datePeriod));
    setSelectedDate(new Date(datePeriod.startDate));
  }, [datePeriod]);

  const setPeriodToPrevious = useCallback(() => {
    setDatePeriod(getPreviousDatePeriod(datePeriod));
    setSelectedDate(new Date(datePeriod.endDate));
  }, [datePeriod]);

  return (
    <TableContext.Provider
      value={{
        workingTimes,
        openHours,
        teachers,
        selectedTeacher,
        datePeriod,
        selectedDate,
        setPeriodToNext,
        setPeriodToPrevious,
        setSelectedDate,
        setSelectedTeacher,
        setDatePeriod,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}

export function useTable() {
  const context = use(TableContext);
  if (!context) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context;
}
