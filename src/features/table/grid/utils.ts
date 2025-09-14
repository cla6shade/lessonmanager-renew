import { ExtendedTeacher, WorkingTimeData } from "../types";
import { Location } from "@/generated/prisma";

export const LESSON_STATUS_COLORS = {
  COMPLETED: "green.600", // 완료된 레슨
  CANCELLED: "red.400", // 당일 취소된 레슨
  GRAND: "yellow.500", // 그랜드 레슨
  REGULAR: "yellow.200", // 일반 레슨
};

export function getWorkingTeachersOnDate(
  selectedLocation: Location,
  teachers: ExtendedTeacher[],
  dayOfWeek: string
): ExtendedTeacher[] {
  return teachers.filter((teacher) => {
    if (!teacher.workingTime) return false;
    const workingTimeData = JSON.parse(
      teacher.workingTime.times
    ) as WorkingTimeData;
    const dayTimes = workingTimeData[dayOfWeek as keyof WorkingTimeData];
    return (
      dayTimes &&
      dayTimes.length > 0 &&
      teacher.location.id === selectedLocation.id
    );
  });
}

export function getTeacherWorkingHours(
  teacher: ExtendedTeacher,
  dayOfWeek: string
): number[] {
  if (!teacher.workingTime) return [];

  const workingTimeData = JSON.parse(
    teacher.workingTime.times
  ) as WorkingTimeData;

  return workingTimeData[dayOfWeek as keyof WorkingTimeData] || [];
}

export function getLessonStatusColor(lesson: {
  dueDate: Date;
  isDone: boolean;
  dueHour: number;
  isGrand: boolean;
}): string {
  const today = new Date();
  const lessonDate = new Date(lesson.dueDate);

  if (
    lesson.isDone &&
    lessonDate.getTime() + lesson.dueHour * 60 * 60 * 1000 > today.getTime()
  ) {
    const currentHour = today.getHours();
    if (currentHour < lesson.dueHour) {
      return LESSON_STATUS_COLORS.CANCELLED;
    }
  }

  if (lesson.isDone) {
    return LESSON_STATUS_COLORS.COMPLETED;
  }

  if (lesson.isGrand) {
    return LESSON_STATUS_COLORS.GRAND;
  }

  return LESSON_STATUS_COLORS.REGULAR;
}
