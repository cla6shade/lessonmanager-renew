import { WorkingTimeData } from "@/features/table/types";
import prisma from "@/lib/prisma";
import { getWorkingDayOfWeek } from "@/utils/date";
import { LessonSearchParams, LessonSearchResult } from "./schema";
import {
  CreateLessonByAdminInput,
  CreateLessonByUserInput,
} from "./api/lessons/schema";
import { hasLessonCount } from "../(users)/service";

export async function getLessons({
  startDate,
  endDate,
  selectedTeacherId: teacherId,
  selectedLocationId: locationId,
}: LessonSearchParams): Promise<LessonSearchResult> {
  return prisma.lesson.findMany({
    where: {
      dueDate: {
        gte: startDate,
        lte: endDate,
      },
      ...(teacherId !== undefined ? { teacherId } : {}),
      ...(locationId !== undefined ? { locationId } : {}),
    },
    include: {
      location: true,
      teacher: {
        select: {
          id: true,
          name: true,
          major: true,
        },
      },
    },
    omit: {
      contact: true,
      note: true,
    },
  });
}

export async function createLessonByAdmin({
  dueDate,
  dueHour,
  teacherId,
  userId,
  locationId,
  isGrand,
  contact,
  username,
}: CreateLessonByAdminInput) {
  return prisma.lesson.create({
    data: {
      dueDate,
      dueHour,
      teacherId,
      userId,
      locationId,
      isGrand,
      contact,
      username,
    },
  });
}

export async function createLessonByUser(
  { dueDate, dueHour, teacherId, locationId, isGrand }: CreateLessonByUserInput,
  userId: number
) {
  return prisma.lesson.create({
    data: {
      dueDate,
      dueHour,
      teacherId,
      locationId,
      isGrand,
      userId,
    },
  });
}

export async function canCreateLesson({ userId }: { userId: number }) {
  return hasLessonCount(userId);
}

export async function updateLesson(
  lessonId: number,
  { note, isDone }: { note?: string; isDone?: boolean }
) {
  return prisma.lesson.update({
    where: { id: lessonId },
    data: { note, isDone },
    include: {
      location: true,
      teacher: {
        select: {
          id: true,
          name: true,
          major: true,
        },
      },
    },
  });
}

export async function isBannedAt(date: Date, hour: number, teacherId: number) {
  const bannedTime = await prisma.lessonBannedTimes.findFirst({
    where: {
      teacherId: teacherId,
      date: date,
      hour: hour,
    },
  });
  return !!bannedTime;
}

export async function isAvailableAt(
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

export async function isTeacherAvailableAt(
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
