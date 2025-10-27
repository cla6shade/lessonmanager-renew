import { createContext, ReactNode, use, useRef } from 'react';
import { ExtendedTeacher } from '../../types';

interface LessonReservationContextProps {
  children: ReactNode;
  selectedDate: Date;
  selectedTeacher: ExtendedTeacher;
  dueHour: number;
}

interface LessonReservationValue {
  selectedDate: Date;
  dueHour: number;
  selectedTeacher: ExtendedTeacher;
}

const LessonReservationStoreContext = createContext<LessonReservationValue | null>(null);

export default function LessonReservationProvider({
  children,
  ...values
}: LessonReservationContextProps) {
  return (
    <LessonReservationStoreContext.Provider value={values}>
      {children}
    </LessonReservationStoreContext.Provider>
  );
}

export function useLessonReservation() {
  const store = use(LessonReservationStoreContext);
  if (!store)
    throw new Error('useLessonReservation must be used within a LessonReservationProvider');
  return store;
}
