import {
  useState,
  useEffect,
  createContext,
  ReactNode,
  use,
  useRef,
} from "react";
import type { StoreApi } from "zustand";
import { useStore } from "zustand";
import { OpenHours, WorkingTime } from "@/generated/prisma";
import { ExtendedTeacher } from "../../types";
import {
  createTableStore,
  TableState,
  TableStore,
} from "../../stores/tableStore";

const TableStoreContext = createContext<TableStore | null>(null);

interface TableProviderProps {
  workingTimes: WorkingTime[];
  openHours: OpenHours;
  teachers: ExtendedTeacher[];
  children: ReactNode;
}

export default function TableProvider({
  children,
  workingTimes,
  openHours,
  teachers,
}: TableProviderProps) {
  const store = useRef(
    createTableStore({ openHours, teachers, workingTimes })
  ).current;
  return (
    <TableStoreContext.Provider value={store}>
      {children}
    </TableStoreContext.Provider>
  );
}

function useTableStoreSelector<U>(selector: (s: TableState) => U) {
  const store = use(TableStoreContext);
  if (!store) throw new Error("useTable must be used within a TableProvider");
  return useStore(store, selector);
}

export function useTable() {
  const openHours = useTableStoreSelector((s) => s.openHours);
  const teachers = useTableStoreSelector((s) => s.teachers);
  const workingTimes = useTableStoreSelector((s) => s.workingTimes);
  const selectedTeacher = useTableStoreSelector((s) => s.selectedTeacher);
  const datePeriod = useTableStoreSelector((s) => s.datePeriod);
  const selectedDate = useTableStoreSelector((s) => s.selectedDate);
  const setPeriodToNext = useTableStoreSelector((s) => s.setPeriodToNext);
  const setPeriodToPrevious = useTableStoreSelector(
    (s) => s.setPeriodToPrevious
  );
  const setSelectedDate = useTableStoreSelector((s) => s.setSelectedDate);
  const setSelectedTeacher = useTableStoreSelector((s) => s.setSelectedTeacher);
  const setDatePeriod = useTableStoreSelector((s) => s.setDatePeriod);

  return {
    openHours,
    teachers,
    workingTimes,
    selectedTeacher,
    datePeriod,
    selectedDate,
    setPeriodToNext,
    setPeriodToPrevious,
    setSelectedDate,
    setSelectedTeacher,
    setDatePeriod,
  };
}
