import { WorkingTimeData } from "@/features/table/types";
import prisma from "@/lib/prisma";
import { getWorkingDayOfWeek } from "@/utils/date";

export async function createLesson() {}

export async function isNotBannedAt(
  date: Date,
  hour: number,
  teacherId: number
) {
  const bannedTime = await prisma.lessonBannedTimes.findFirst({
    where: {
      teacherId: teacherId,
      date: date,
      hour: hour,
    },
  });
  return !bannedTime;
}

export async function isAvaliableAt(
  date: Date,
  hour: number,
  isGrand: boolean
) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      dueDate: date,
      dueHour: hour,
      isGrand: isGrand,
    },
  });
  return !lesson;
}

export async function isTeacherAvaliableAt(
  teacherId: number,
  date: Date,
  hour: number
) {
  const workingTime = await prisma.workingTime.findUnique({
    where: {
      teacherId: teacherId,
    },
  });
  if (!workingTime) {
    return false;
  }
  const workingTimeData = JSON.parse(workingTime.times) as WorkingTimeData;
  return workingTimeData[
    getWorkingDayOfWeek(date) as keyof WorkingTimeData
  ]?.includes(hour);
}
