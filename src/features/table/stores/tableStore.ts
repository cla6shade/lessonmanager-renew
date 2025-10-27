import { createStore } from 'zustand';
import type { StoreApi } from 'zustand';
import { OpenHours, WorkingTime } from '@/generated/prisma';
import {
  DatePeriod,
  getCurrentDatePeriod,
  getNextDatePeriod,
  getPreviousDatePeriod,
  setDateToStartOfDay,
} from '@/utils/date';
import { ExtendedTeacher } from '../types';

export interface TableState {
  openHours: OpenHours;
  teachers: ExtendedTeacher[];
  workingTimes: WorkingTime[];
  selectedTeacher: ExtendedTeacher | null;
  datePeriod: DatePeriod;
  selectedDate: Date;
  setPeriodToNext: () => void;
  setPeriodToPrevious: () => void;
  setSelectedDate: (date: Date) => void;
  setSelectedTeacher: (teacher: ExtendedTeacher | null) => void;
  setDatePeriod: (period: DatePeriod) => void;
}

export type TableStore = StoreApi<TableState>;

export function createTableStore(init: {
  openHours: OpenHours;
  teachers: ExtendedTeacher[];
  workingTimes: WorkingTime[];
}) {
  const initialDatePeriod = getCurrentDatePeriod(new Date());
  const initialSelectedDate = setDateToStartOfDay(new Date());
  return createStore<TableState>()((set, get) => ({
    openHours: init.openHours,
    teachers: init.teachers,
    workingTimes: init.workingTimes,
    selectedTeacher: null,
    datePeriod: initialDatePeriod,
    selectedDate: initialSelectedDate,
    setPeriodToNext: () => {
      const cur = get().datePeriod;
      const next = getNextDatePeriod(cur);
      set({ datePeriod: next, selectedDate: new Date(cur.startDate) });
    },
    setPeriodToPrevious: () => {
      const cur = get().datePeriod;
      const prev = getPreviousDatePeriod(cur);
      set({ datePeriod: prev, selectedDate: new Date(cur.endDate) });
    },
    setSelectedDate: (date) => set({ selectedDate: date }),
    setSelectedTeacher: (teacher) => set({ selectedTeacher: teacher }),
    setDatePeriod: (period) => set({ datePeriod: period }),
  }));
}
