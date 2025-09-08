import { createContext, ReactNode, use, useCallback, useState } from "react";
import { OpenHours, WorkingTime } from "@/generated/prisma";
import {
  DatePeriod,
  getCurrentDatePeriod,
  getNextDatePeriod,
  getPreviousDatePeriod,
  setDateToStartOfDay,
} from "@/utils/date";
import { ExtendedTeacher } from "./types";

export const TableContext = createContext<TableContextType | undefined>(
  undefined
);

interface TableProviderProps {
  workingTimes: WorkingTime[];
  openHours: OpenHours;
  teachers: ExtendedTeacher[];
  children: ReactNode;
}

interface TableContextType {
  openHours: OpenHours;
  teachers: ExtendedTeacher[];
  selectedTeacher: ExtendedTeacher | null;
  workingTimes: WorkingTime[];
  datePeriod: DatePeriod;
  selectedDate: Date;
  setPeriodToNext: () => void;
  setPeriodToPrevious: () => void;
  setSelectedDate: (date: Date) => void;
  setSelectedTeacher: (teacher: ExtendedTeacher | null) => void;
  setDatePeriod: (period: DatePeriod) => void;
}

export default function TableProvider({
  children,
  workingTimes,
  openHours,
  teachers,
}: TableProviderProps) {
  const [selectedTeacher, setSelectedTeacher] =
    useState<ExtendedTeacher | null>(null);
  const [datePeriod, setDatePeriod] = useState<DatePeriod>(
    getCurrentDatePeriod(new Date())
  );
  const [selectedDate, setSelectedDate] = useState<Date>(
    setDateToStartOfDay(new Date())
  );

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
